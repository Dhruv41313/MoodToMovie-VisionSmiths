import React, { useState } from 'react';
import MovieModal from '../components/MovieModal';
import { motion } from 'framer-motion';
import { RiHeartFill } from 'react-icons/ri';

function FavoritesPage({ favorites, toggleFavorite }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  return (
    <>
      <header>
        <h2>Your Favorite Movies</h2>
        <p>All the movies you've saved for later.</p>
      </header>
      <div className="recommendations-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem'}}>
        {favorites.length > 0 ? (
          favorites.map((movie) => (
            <motion.div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)} whileHover={{ scale: 1.05 }}>
              <img src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`} alt={movie.title} />
              <button className="fav-button favorited" onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}><RiHeartFill /></button>
              <div className="card-content">
                <h4>{movie.title}</h4>
                <p>⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            </motion.div>
          ))
        ) : (<p>You haven't favorited any movies yet. Click the heart icon on a movie to save it here.</p>)}
      </div>
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </>
  );
}
export default FavoritesPage;