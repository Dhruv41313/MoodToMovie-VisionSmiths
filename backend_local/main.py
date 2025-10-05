# ===================================================================
# CELL 2: THE AI SERVER CODE (FINAL VERSION WITH RANDOM GAMES)
# ===================================================================

from transformers import pipeline
import os
import cv2
import base64
import numpy as np
import requests
import random
import asyncio
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from deepface import DeepFace
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from collections import Counter
import io
from pydub import AudioSegment
from pyngrok import ngrok
import uvicorn

# --- INITIALIZATION ---
print("--- Initializing AI models... ---")
load_dotenv()
nltk.download('vader_lexicon', quiet=True)
sentiment_analyzer = SentimentIntensityAnalyzer()
emotion_classifier = pipeline("audio-classification", model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
RAWG_API_KEY = os.getenv("RAWG_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class RecPayload(BaseModel):
    text: str | None = None
    face_mood: str | None = None
    voice_mood: str | None = None
    exclude_genres: list[int] | None = None

MOOD_TO_GENRE = {"happy": 35, "sad": 18, "angry": 28, "fear": 27, "surprise": 9648, "neutral": 99, "calm": 10749}
MOOD_TO_GAME_GENRE = {"happy": "action", "sad": "role-playing-games-rpg", "angry": "shooter", "fear": "adventure", "surprise": "puzzle", "neutral": "simulation"}
VOICE_MOOD_MAP = {'ang': 'angry', 'hap': 'happy', 'sad': 'sad', 'neu': 'neutral'}

def fuse_moods(text_mood, face_mood, voice_mood):
    moods = []
    if text_mood: moods.extend([text_mood, text_mood])
    if face_mood and face_mood not in ["neutral", "..."]: moods.append(face_mood)
    if voice_mood and voice_mood not in ["neutral", "..."]: moods.append(voice_mood)
    if not moods: return "neutral"
    return Counter(moods).most_common(1)[0][0]

async def fetch_watch_providers(session, movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/watch/providers?api_key={TMDB_API_KEY}"
    try:
        response = await session.get(url)
        response.raise_for_status()
        results = response.json().get("results", {}).get("IN", {}) or response.json().get("results", {}).get("US", {})
        return results.get("flatrate", [])
    except: return []

@app.post("/get_recommendations")
async def get_recommendations(payload: RecPayload):
    if not TMDB_API_KEY: return {"error": "TMDb API Key not configured."}
    text_mood = None
    if payload.text and payload.text.strip():
        scores = sentiment_analyzer.polarity_scores(payload.text)
        if scores['compound'] >= 0.05: text_mood = "happy"
        elif scores['compound'] <= -0.05: text_mood = "sad"
    final_mood = fuse_moods(text_mood, payload.face_mood, payload.voice_mood)
    genre_id = MOOD_TO_GENRE.get(final_mood.lower(), 99)
    exclude_genres_str = ",".join(map(str, payload.exclude_genres)) if payload.exclude_genres else ""
    movies_pool = []
    random_page = random.randint(1, 10)
    discover_url = (f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&sort_by=popularity.desc"
                    f"&page={random_page}&with_genres={genre_id}&without_genres={exclude_genres_str}&vote_count.gte=100")
    try:
        response = requests.get(discover_url)
        response.raise_for_status()
        movies_pool.extend([m for m in response.json().get("results", []) if m.get('poster_path')])
    except requests.RequestException as e: return {"error": f"Failed to fetch from TMDb: {e}", "recommendations": []}
    random.shuffle(movies_pool)
    recommended_movies = movies_pool[:12]
    async with httpx.AsyncClient() as session:
        tasks = [fetch_watch_providers(session, movie['id']) for movie in recommended_movies]
        provider_results = await asyncio.gather(*tasks)
    for movie, providers in zip(recommended_movies, provider_results):
        movie['watch_providers'] = providers
    return {"mood": final_mood, "recommendations": recommended_movies}

@app.post("/get_game_recommendations")
async def get_game_recommendations(payload: RecPayload):
    if not RAWG_API_KEY: return {"error": "RAWG API Key is not configured."}
    text_mood = None
    if payload.text and payload.text.strip():
        scores = sentiment_analyzer.polarity_scores(payload.text)
        if scores['compound'] >= 0.05: text_mood = "happy"
        elif scores['compound'] <= -0.05: text_mood = "sad"
    final_mood = fuse_moods(text_mood, payload.face_mood, payload.voice_mood)
    game_genre = MOOD_TO_GAME_GENRE.get(final_mood.lower(), "simulation")

    # <<< FIX: Added random page fetching to ensure variety >>>
    random_page = random.randint(1, 20)
    url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&genres={game_genre}&ordering=-rating&page_size=12&page={random_page}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            games = response.json().get("results", [])
            random.shuffle(games) # Shuffle the results from the random page
            return {"mood": final_mood, "recommendations": games}
    except httpx.RequestError as e:
        return {"error": f"Failed to fetch games from RAWG: {e}", "recommendations": []}

@app.get("/movie/{movie_id}/reviews")
async def get_movie_reviews(movie_id: int):
    if not TMDB_API_KEY: return {"error": "TMDb API Key not configured."}
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/reviews?api_key={TMDB_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json().get("results", [])
    except httpx.RequestError: return []

@app.websocket("/ws/analyze_face")
async def websocket_face(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            header, encoded = data.split(",", 1)
            img = cv2.imdecode(np.frombuffer(base64.b64decode(encoded), np.uint8), cv2.IMREAD_COLOR)
            analysis = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
            if isinstance(analysis, list) and analysis: await websocket.send_text(analysis[0]['dominant_emotion'])
    except: print("Face WebSocket closed.")

@app.websocket("/ws/analyze_voice")
async def websocket_voice(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            audio_data = await websocket.receive_bytes()
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_data)).set_frame_rate(16000).set_channels(1)
            samples = np.array(audio_segment.get_array_of_samples()).astype(np.float32) / 32768.0
            predictions = emotion_classifier(samples, sampling_rate=16000)
            best_prediction = max(predictions, key=lambda x: x['score'])
            mood = VOICE_MOOD_MAP.get(best_prediction['label'], "neutral")
            await websocket.send_text(mood)
    except: print("Voice WebSocket closed.")

async def run_server():
    print("--- Starting server and creating public URL... ---")
    ngrok.set_auth_token(NGROK_AUTHTOKEN)
    http_tunnel = ngrok.connect(8000)
    print("========================================================================================")
    print(f"--- Your Public URL is: {http_tunnel.public_url} ---")
    print("--- COPY THIS URL and PASTE it in your frontend/src/config.js file ---")
    print("========================================================================================")
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()

import nest_asyncio
nest_asyncio.apply()
asyncio.run(run_server())