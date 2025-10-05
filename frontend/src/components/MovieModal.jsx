import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

const getLogoPath = (path) => `https://image.tmdb.org/t/p/w45${path}`;

function MovieModal({ movie, onClose }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (movie) {
      const fetchReviews = async () => {
        try {
          const headers = new Headers({ "ngrok-skip-browser-warning": "69420" });
          const res = await fetch(`${API_BASE_URL}/movie/${movie.id}/reviews`, { headers });
          const data = await res.json();
          setReviews(data.slice(0, 3));
        } catch (error) {
          console.error("Failed to fetch reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [movie]);

  if (!movie) return null;

  const dropIn = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { duration: 0.3, type: "spring", damping: 25, stiffness: 500 } },
    exit: { y: "100vh", opacity: 0 },
  };

  // <<< FIX: Construct a clickable link for streaming providers >>>
  const watchLink = `https://www.themoviedb.org/movie/${movie.id}/watch`;

  return (
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} variants={dropIn} initial="hidden" animate="visible" exit="exit">
        <button className="modal-close-button" onClick={onClose}>×</button>
        <img className="modal-poster" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        <div className="modal-details">
          <h2>{movie.title}</h2>
          <p><strong>⭐ Rating:</strong> {movie.vote_average.toFixed(1)} / 10</p>
          <p>{movie.overview}</p>
          
          {movie.watch_providers && movie.watch_providers.length > 0 && (
            <div className="watch-providers">
              <h4>Available to Stream on:</h4>
              <div className="provider-logos">
                {movie.watch_providers.map(provider => (
                  <a key={provider.provider_id} href={watchLink} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={getLogoPath(provider.logo_path)} 
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="provider-logo"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="review-section">
            <h3>Viewer Reviews</h3>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review">
                  <p className="review-author">A review by {review.author}</p>
                  <p className="review-content">{review.content.substring(0, 400)}...</p>
                </div>
              ))
            ) : (
              <p>No viewer reviews found for this movie.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
export default MovieModal;