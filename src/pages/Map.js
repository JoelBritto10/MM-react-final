import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Map.css';

function Map({ currentUser }) {
  const [searchParams] = useSearchParams();
  const tripIdFromParam = searchParams.get('tripId');
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showLocationMap, setShowLocationMap] = useState(false);

  // Get user's real-time location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to get location');
          console.log('Location error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Load trips from localStorage
  useEffect(() => {
    const loadTrips = () => {
      const storedTrips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      
      // If coming from home page with tripId, filter to show only joined trips and the selected trip
      if (tripIdFromParam) {
        const joinedTrips = storedTrips.filter(trip => 
          trip.participants && trip.participants.includes(currentUser?.uid || 'demo-user')
        );
        setTrips(joinedTrips);
      } else {
        setTrips(storedTrips);
      }
      
      setLoading(false);
    };

    loadTrips();
  }, [tripIdFromParam, currentUser]);

  const getGoogleMapsUrl = () => {
    if (!userLocation) return '';
    return `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=16`;
  };

  if (loading) {
    return (
      <div className="container">
        <h1>📍 Trip Map</h1>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📍 Trip Map</h1>
      </div>

      {/* Real-time Location Feature */}
      <div className="map-info">
        <div className="location-feature-grid">
          <div 
            className="location-item clickable" 
            onClick={() => setShowLocationMap(true)}
            title="Click to view your location on map"
          >
            <span className="location-icon">📍</span>
            <div className="location-text">
              <h4>Your Location</h4>
              {userLocation ? (
                <p>
                  <strong>{userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°</strong>
                  <br />
                  <small>Accuracy: ±{userLocation.accuracy.toFixed(0)}m</small>
                </p>
              ) : (
                <p className={locationError ? 'error' : 'loading'}>{locationError || '📡 Detecting location...'}</p>
              )}
            </div>
          </div>

          <div className="location-item">
            <span className="location-icon">🗺️</span>
            <div className="location-text">
              <h4>Map Feature Active</h4>
              <p>Real-time location tracking enabled</p>
            </div>
          </div>

          <div className="location-item">
            <span className="location-icon">📌</span>
            <div className="location-text">
              <h4>Trips Available</h4>
              <p><strong>{trips.length}</strong> trips to explore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
      {showLocationMap && userLocation && (
        <div className="location-map-modal">
          <div className="modal-overlay" onClick={() => setShowLocationMap(false)}></div>
          <div className="modal-content">
            <button 
              className="modal-close-btn" 
              onClick={() => setShowLocationMap(false)}
            >
              ✕
            </button>
            
            <h2>Your Location</h2>
            
            <div className="map-container">
              <iframe
                title="Your Location Map"
                width="100%"
                height="400"
                frameBorder="0"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAogHSZ0_rCy07a2SUw5nnwfdJ-1Q8RlXA&q=${userLocation.lat},${userLocation.lng}&zoom=16`}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            <div className="location-details">
              <div className="detail-row">
                <span className="detail-label">Latitude:</span>
                <span className="detail-value">{userLocation.lat.toFixed(6)}°</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Longitude:</span>
                <span className="detail-value">{userLocation.lng.toFixed(6)}°</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Accuracy:</span>
                <span className="detail-value">±{userLocation.accuracy.toFixed(0)} meters</span>
              </div>
            </div>

            <div className="modal-actions">
              <a 
                href={getGoogleMapsUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-modal-primary"
              >
                🗺️ Open in Google Maps
              </a>
              <button 
                onClick={() => setShowLocationMap(false)}
                className="btn-modal-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trips Grid */}
      <div className="map-trips-section">
        <h2>Your Joined Trips</h2>
        {trips.length === 0 ? (
          <div className="no-trips-message">
            <p>🌍 You haven't joined any trips yet. Go to Home and join a trip!</p>
          </div>
        ) : (
          <div className="trips-grid-container">
            {trips.map(trip => (
              <div key={trip.id} className="trip-grid-card">
                {trip.image && (
                  <div 
                    className="trip-grid-image" 
                    style={{ backgroundImage: `url('${trip.image}')` }}
                  ></div>
                )}
                <div className="trip-grid-content">
                  <h3 className="trip-title">{trip.title}</h3>
                  <p className="trip-location">📍 {trip.location}</p>
                  <p className="trip-description">{trip.description}</p>
                  
                  <div className="trip-meta">
                    <span className="meta-item">
                      👤 <strong>{trip.hostName}</strong>
                    </span>
                    {trip.participants && (
                      <span className="trip-participants-badge">{trip.participants.length} joined</span>
                    )}
                  </div>

                  {trip.mapsUrl && (
                    <a 
                      href={trip.mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-map-link"
                    >
                      🗺️ View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
