import React from 'react';

const GENRES = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' }
];

function GenreFilter({ selectedGenres, onGenreChange }) {
    const handleCheckboxChange = (genreId) => {
        const newSelection = selectedGenres.includes(genreId)
            ? selectedGenres.filter(id => id !== genreId)
            : [...selectedGenres, genreId];
        onGenreChange(newSelection);
    };

    return (
        <div className="genre-filter-container">
            {/* <<< FIX: Changed label from "Exclude" to "Also Include" for clarity >>> */}
            <label>2. Also Include Genres (optional)</label>
            <div className="genre-grid">
                {GENRES.map(genre => (
                    <div key={genre.id} className="genre-checkbox">
                        <input
                            type="checkbox"
                            id={`genre-${genre.id}`}
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() => handleCheckboxChange(genre.id)}
                        />
                        <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default GenreFilter;