import React from 'react';
import { motion } from 'framer-motion';

function GameRow({ title, games }) {
  if (!games || games.length === 0) return null;

  return (
    <div className="movie-row-container">
      <h3 className="section-header-text">{title}</h3>
      <div className="movie-row">
        {games.map(game => (
          <motion.div
            key={game.id}
            className="game-card"
            whileHover={{ scale: 1.05, zIndex: 2 }}
            transition={{ duration: 0.2 }}
          >
            <img src={game.background_image} alt={game.name} />
            <div className="card-content">
              <h4>{game.name}</h4>
              {/* <<< FIX: Safely handle games with no rating >>> */}
              <p>⭐ {(game.rating || 0).toFixed(1)} / 5</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default GameRow;