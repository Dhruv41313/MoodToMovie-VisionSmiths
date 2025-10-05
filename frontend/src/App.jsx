import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { RiHome4Fill, RiCompass3Fill, RiHeartFill } from 'react-icons/ri';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import FavoritesPage from './pages/FavoritesPage';
import './index.css';

function App() {
  const [favorites, setFavorites] = useState([]);
  const toggleFavorite = (movie) => {
    setFavorites(prev => prev.find(fav => fav.id === movie.id)
      ? prev.filter(fav => fav.id !== movie.id)
      : [...prev, movie]);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h1 className="logo">MoodToMovie</h1>
          <nav>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><RiHome4Fill /> Home</NavLink>
            <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><RiCompass3Fill /> Discover</NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><RiHeartFill /> Favorites</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/discover" element={<DiscoverPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/favorites" element={<FavoritesPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;