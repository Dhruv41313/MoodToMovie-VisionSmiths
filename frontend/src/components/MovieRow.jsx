import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiHeartFill, RiHeartLine } from 'react-icons/ri';
import { API_BASE_URL } from '../config';

function MovieRow({ title, initialMood, movies: propMovies, favorites, toggleFavorite, onMovieClick }) {
  const [movies, setMovies] = useState(propMovies || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propMovies && initialMood) {
      setError(null);
      const fetchMovies = async () => {
        try {
          const headers = new Headers({ "ngrok-skip-browser-warning": "69420", 'Content-Type': 'application/json' });
          const res = await fetch(`${API_BASE_URL}/get_recommendations`, {
            method: 'POST', headers: headers,
            body: JSON.stringify({ face_mood: initialMood }),
          });
          if(!res.ok) throw new Error(`Server Error: ${res.status}`);
          const data = await res.json();
          if(data.error) throw new Error(data.error);
          setMovies(data.recommendations?.slice(0, 10) || []);
        } catch (err) {
          console.error(`Failed to fetch movies for ${title}:`, err);
          setError(err.message);
        }
      };
      fetchMovies();
    } else {
      setMovies(propMovies || []);
    }
  }, [initialMood, propMovies]);

  if (error) return <p style={{ color: 'var(--brand-red-hover)'}}>Could not load "{title}": {error}</p>;
  if (!propMovies && movies.length === 0) return <p style={{color: 'var(--text-secondary)'}}>Loading "{title}"...</p>;
  if (propMovies && movies.length === 0) return null;

  return (
    <div className="movie-row-container">
      <h3 className="section-header-text">{title}</h3>
      <div className="movie-row">
        {movies.map(movie => {
          const isFavorited = favorites.some(fav => fav.id === movie.id);
          return (
            <motion.div key={movie.id} className="movie-card" onClick={() => onMovieClick(movie)} whileHover={{ scale: 1.05, zIndex: 2 }}>
              <img src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`} alt={movie.title} />
              <button className={`fav-button ${isFavorited ? 'favorited' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}>
                {isFavorited ? <RiHeartFill /> : <RiHeartLine />}
              </button>
              <div className="card-content">
                <h4>{movie.title}</h4>
                {/* <<< FIX: Safely handle if vote_average is missing >>> */}
                <p>⭐ {(movie.vote_average || 0).toFixed(1)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
export default MovieRow;