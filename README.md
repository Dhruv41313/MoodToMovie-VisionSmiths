# MoodToMovie: A Multimodal AI Recommender

**Team: VisionSmiths** | **Samsung PRISM Gen AI Hackathon 2025**

## 🎬 Project Overview

MoodToMovie is an advanced, multimodal AI-powered recommendation engine that suggests movies and games to users based on their real-time emotional state. This application uses a sophisticated AI backend to perform real-time analysis of a user's facial expressions, voice tone, and written text. These inputs are fused into a single, nuanced mood, which drives a dynamic and personalized recommendation experience.

This repository contains the full source code for both the frontend and the backend. Due to the high computational resources required by the AI models, we provide two methods for running the project.

---
## ✨ Key Features

* ✅ **Real-time Face + Voice + Text Fusion:** Intelligently combines live data from a user's webcam, microphone, and text input.
* ✅ **Streaming App Links:** Movie details include links to streaming providers.
* ✅ **Genre Filters:** Users can refine recommendations by excluding specific genres.
* ✅ **Game Recommendations:** Suggests video games based on the user's mood.
* ✅ **Viewer Reviews:** Fetches and displays real viewer reviews for movies.
* ✅ **Interactive UI & Favorites:** A polished, multi-page application with a "Favorites" system, a "Discover" page, and clickable, interactive panels.

---
## 🛠️ Tech Stack

* **Frontend:** React (with Vite), Framer Motion, React Icons
* **Backend:** Python with FastAPI
* **AI / Machine Learning:**
    * Facial Emotion Recognition: `DeepFace`
    * Speech Emotion Recognition: Hugging Face `transformers`
    * Text Sentiment Analysis: `NLTK (Vader)`
* **APIs:** TMDb (Movies), RAWG (Games)

---

## 🚀 Setup and Run Instructions

This project has two parts: the AI backend and the web frontend. We provide two methods to run the backend.

### Method 1: The Stable Cloud-Powered Demo (Recommended for Judging)

This method runs the heavy AI backend on Google Colab, guaranteeing stability and performance regardless of local hardware.

**1. Run the Backend on Google Colab:**
   - Go to [https://colab.research.google.com](https://colab.research.google.com) and click **`File > Upload notebook...`**.
   - Select the `MoodToMovie_Backend.ipynb` file located in the `backend_colab` folder of this repository.
   - In the first code cell of the notebook, add your personal API keys (TMDb, RAWG) and your ngrok authtoken.
   - In the top menu, click **`Runtime > Run all`**.
   - After a few minutes, the output of the final cell will provide a public URL ending in `.ngrok-free.app`. **Copy this URL.**

**2. Run the Frontend Locally:**
   - Navigate to the `frontend` directory: `cd frontend`
   - Install dependencies: `npm install`
   - **Important:** Open the file `frontend/src/config.js` and paste the public `ngrok` URL you copied from Colab into the `API_BASE_URL` variable.
   - Start the frontend server: `npm run dev`
   - Open the provided `localhost` URL in your browser.

### Method 2: The Advanced Local Setup (Experimental)

This method runs both the backend and frontend on your local machine.
**Warning:** This requires a powerful computer with significant RAM (16GB+ recommended). The AI models are very resource-intensive and may cause the backend server to crash on some systems.

**1. Run the Backend Locally:**
   - Navigate to the `backend_local` directory: `cd backend_local`
   - Create and activate a Python virtual environment: `python -m venv venv` then `.\venv\Scripts\activate`
   - Install all required packages: `pip install -r requirements.txt`
   - Create a `.env` file and add your TMDb and RAWG API keys.
   - Run the server: `uvicorn main:app --reload`

**2. Run the Frontend Locally:**
   - Open a **second terminal** and navigate to the `frontend` directory.
   - Install dependencies: `npm install`
   - **Important:** Ensure the file `frontend/src/config.js` is pointing to the local backend URL: `http://127.0.0.1:8000`.
   - Start the frontend server: `npm run dev`

---
##  submissions

* **Video Demo URL:** https://drive.google.com/file/d/1_9z0guZTbqqxFZ8Ko-ukbLAtUXEbJJZo/view?usp=drivesdk
* **Colab Notebook File:** The code for the cloud-powered backend is located in `/backend_colab/MoodToMovie_Backend.ipynb`.
