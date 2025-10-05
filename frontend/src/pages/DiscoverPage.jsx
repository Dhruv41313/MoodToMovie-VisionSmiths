import React, { useState } from 'react';
import MovieRow from '../components/MovieRow';
import MovieModal from '../components/MovieModal';

function DiscoverPage({ favorites, toggleFavorite }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  return (
    <>
      <header>
        <h2>Discover New Movies</h2>
        <p>Explore movies from all kinds of moods and genres.</p>
      </header>
      <MovieRow title="Thrilling Action" initialMood="angry" favorites={favorites} toggleFavorite={toggleFavorite} onMovieClick={setSelectedMovie} />
      <MovieRow title="Mind-Bending Mysteries" initialMood="surprise" favorites={favorites} toggleFavorite={toggleFavorite} onMovieClick={setSelectedMovie} />
      <MovieRow title="Happy Comedies" initialMood="happy" favorites={favorites} toggleFavorite={toggleFavorite} onMovieClick={setSelectedMovie} />
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </>
  );
}
export default DiscoverPage;