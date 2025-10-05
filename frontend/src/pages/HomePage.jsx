import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import MovieRow from '../components/MovieRow';
import MovieModal from '../components/MovieModal';
import GameRow from '../components/GameRow';
import GenreFilter from '../components/GenreFilter';
import { RiMicFill, RiMicOffFill } from 'react-icons/ri';
import { API_BASE_URL } from '../config';

function HomePage({ favorites, toggleFavorite }) {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [faceMood, setFaceMood] = useState('...');
  const [voiceMood, setVoiceMood] = useState('...');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Ready. Select your inputs and get recommendations.');
  const [recommendations, setRecommendations] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [excludeGenres, setExcludeGenres] = useState([]);
  const [recommendationType, setRecommendationType] = useState('movies');
  const faceWs = useRef(null);
  const voiceWs = useRef(null);

  const handleTypeToggle = (type) => {
    setRecommendationType(type);
    setRecommendations([]); // <<< FIX: Clear old results to prevent crash
    setStatus('Ready.');
  };

  const setupWebSocket = (url, onMessage, onOpen, onError, onClose) => {
    const ws = new WebSocket(url);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
    return ws;
  };

  useEffect(() => {
    if (isCameraOn) {
      setFaceMood('Connecting...');
      faceWs.current = setupWebSocket(
        `${API_BASE_URL.replace(/^http/, 'ws')}/ws/analyze_face`,
        (event) => setFaceMood(event.data),
        () => console.log('Face WS Open'),
        () => setFaceMood('Error!'),
        () => console.log('Face WS Closed')
      );
      const interval = setInterval(() => {
        if (faceWs.current?.readyState === WebSocket.OPEN && webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) faceWs.current.send(imageSrc);
        }
      }, 1500);
      return () => { clearInterval(interval); faceWs.current?.close(); };
    } else {
      setFaceMood('...');
    }
  }, [isCameraOn]);

  useEffect(() => {
    if (isMicOn) {
      setVoiceMood('Connecting...');
      voiceWs.current = setupWebSocket(
          `${API_BASE_URL.replace(/^http/, 'ws')}/ws/analyze_voice`,
          (event) => setVoiceMood(event.data),
          () => console.log('Voice WS Open'),
          () => setVoiceMood('Error!'),
          () => console.log('Voice WS Closed')
      );
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current.ondataavailable = event => { if (event.data.size > 0 && voiceWs.current?.readyState === WebSocket.OPEN) voiceWs.current.send(event.data); };
        mediaRecorderRef.current.start(2000);
      }).catch(err => { console.error("Mic error:", err); setIsMicOn(false); });
      return () => { mediaRecorderRef.current?.stop(); voiceWs.current?.close(); };
    } else {
      setVoiceMood('...');
    }
  }, [isMicOn]);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setStatus(`Finding ${recommendationType}...`);
    const endpoint = recommendationType === 'movies' ? '/get_recommendations' : '/get_game_recommendations';
    const payload = { text, face_mood: isCameraOn ? faceMood : null, voice_mood: isMicOn ? voiceMood : null, exclude_genres: excludeGenres };
    
    try {
      const headers = new Headers({ "ngrok-skip-browser-warning": "69420", 'Content-Type': 'application/json' });
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      setStatus(`Success! Detected mood is '${data.mood}'.`);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Recommendation error:", error);
      setStatus(`Error: Could not fetch recommendations.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
        <h2>The Ultimate Mood Detector</h2>
        <p>Fuse your facial expression, voice tone, and text to get hyper-personalized recommendations.</p>
      </header>

      <div className="recommendation-type-toggle">
        <button 
          className={`toggle-button ${recommendationType === 'movies' ? 'active' : ''}`}
          onClick={() => handleTypeToggle('movies')}>
          Movies
        </button>
        <button 
          className={`toggle-button ${recommendationType === 'games' ? 'active' : ''}`}
          onClick={() => handleTypeToggle('games')}>
          Games
        </button>
      </div>

      <div className="input-section">
        <div className="text-input-area">
          <label>1. Describe your mood (Highest Priority)</label>
          <textarea placeholder="e.g., I want something fun and adventurous..." value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="camera-area">
          <div className="webcam-container">{isCameraOn ? <Webcam audio={false} ref={webcamRef} className="webcam-feed" /> : <div className="webcam-off-placeholder">Camera off</div>}</div>
          <button className="secondary-button" onClick={() => setIsCameraOn(!isCameraOn)}>{isCameraOn ? `⏹️ Stop Cam (Face: ${faceMood})` : '🎥 Start Camera'}</button>
          <button className="secondary-button" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <><RiMicFill/> Voice: {voiceMood}</> : <><RiMicOffFill/> Start Mic</>}</button>
        </div>
      </div>
      
      {recommendationType === 'movies' && <GenreFilter selectedGenres={excludeGenres} onGenreChange={setExcludeGenres} />}
      
      <div className="controls-section">
        <button className="action-button" onClick={handleGetRecommendations} disabled={isLoading}>{isLoading ? 'Analyzing...' : `✨ Get ${recommendationType === 'movies' ? 'Movie' : 'Game'} Recs`}</button>
        <div className="mood-display">{status}</div>
      </div>
      
      {recommendationType === 'movies' && recommendations.length > 0 && (
        <MovieRow title="Your Personalized Suggestions" movies={recommendations} favorites={favorites} toggleFavorite={toggleFavorite} onMovieClick={setSelectedMovie} />
      )}

      {recommendationType === 'games' && recommendations.length > 0 && (
        <GameRow title="Your Personalized Game Suggestions" games={recommendations} />
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </>
  );
}
export default HomePage;