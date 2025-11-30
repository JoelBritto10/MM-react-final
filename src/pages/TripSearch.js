import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TripSearch.css';
import { subscribeToTrips } from '../firebaseUtils';

function TripSearch({ currentUser }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load trips from Firebase
  useEffect(() => {
    try {
      const unsubscribe = subscribeToTrips((firebaseTrips) => {
        setTrips(firebaseTrips || []);
        setFilteredTrips(firebaseTrips || []);
        
        // Extract unique categories from trips
        const uniqueCategories = [...new Set(firebaseTrips.map(trip => trip.category).filter(cat => cat && cat !== 'all'))];
        const categories = ['all', ...uniqueCategories.sort()];
        setAvailableCategories(categories);
        
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading trips:', error);
      setLoading(false);
    }
  }, []);

  // Filter and sort trips
  useEffect(() => {
    let results = trips;

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(trip => trip.category === selectedCategory);
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        case 'oldest':
          return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredTrips(results);
  }, [searchQuery, selectedCategory, sortBy, trips]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="trip-search-section">
        <h1>🔍 Search Trips</h1>

        {/* Search Controls */}
        <div className="search-controls">
          {/* Search Bar */}
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by location, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Filters Row */}
          <div className="filters-row">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? '🌍 All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="title-asc">A-Z Title</option>
                <option value="title-desc">Z-A Title</option>
              </select>
            </div>

            {/* Clear Button */}
            <button onClick={handleClearFilters} className="btn-clear-filters">
              ✕ Clear Filters
            </button>
          </div>

          {/* Results Info */}
          <div className="results-info">
            Found <strong>{filteredTrips.length}</strong> trip{filteredTrips.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
        </div>

        {/* Results */}
        {filteredTrips.length === 0 ? (
          <div className="no-results">
            <p>😔 No trips found matching your criteria</p>
            <button onClick={handleClearFilters} className="btn btn-primary">
              Clear Filters & Try Again
            </button>
          </div>
        ) : (
          <div className="trips-grid">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="trip-card search-trip-card">
                {trip.image && (
                  <div className="trip-card-image">
                    <img src={trip.image} alt={trip.title} />
                  </div>
                )}
                
                <div className="trip-card-content">
                  <div className="trip-header">
                    <h3>{trip.title}</h3>
                    {trip.category && (
                      <button
                        onClick={() => setSelectedCategory(trip.category)}
                        className="category-badge"
                        title={`Filter by ${trip.category}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none', padding: '0' }}
                      >
                        {trip.category === 'beach' && '🏖️'}
                        {trip.category === 'mountain' && '⛰️'}
                        {trip.category === 'city' && '🏙️'}
                        {trip.category === 'adventure' && '🎯'}
                        {trip.category === 'culture' && '🎭'}
                        {trip.category === 'sports' && '⚽'}
                      </button>
                    )}
                  </div>

                  <p className="trip-location">📍 {trip.location}</p>
                  <p className="trip-date">📅 {trip.date}</p>
                  <p className="trip-description">{trip.description.substring(0, 100)}...</p>

                  <div className="trip-stats">
                    {trip.participants && (
                      <span className="stat">👥 {trip.participants.length} joined</span>
                    )}
                    {trip.maxCount && (
                      <span className="stat">👤 Max: {trip.maxCount}</span>
                    )}
                  </div>

                  <div className="trip-actions">
                    <Link to={`/home`} className="btn btn-small btn-primary">
                      View Details
                    </Link>
                    {trip.mapsUrl && (
                      <a
                        href={trip.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-small btn-secondary"
                      >
                        🗺️ Map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripSearch;
