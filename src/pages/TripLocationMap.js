import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripLocationMap.css';
import { subscribeToTrips } from '../firebaseUtils';

function TripLocationMap({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load trip from Firebase
  useEffect(() => {
    try {
      const unsubscribe = subscribeToTrips((firebaseTrips) => {
        const foundTrip = firebaseTrips.find(t => t.id === tripId);
        
        if (foundTrip) {
          setTrip(foundTrip);
        } else {
          setError('Trip not found');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error loading trip:', err);
      setError('Failed to load trip');
      setLoading(false);
    }
  }, [tripId]);

  // Open in new tab (external Google Maps)
  const openInGoogleMaps = () => {
    if (trip?.location) {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(trip.location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Get directions
  const getDirections = () => {
    if (trip?.location) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>📍 Trip Location</h1>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading trip location...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container">
        <h1>📍 Trip Location</h1>
        <div className="error-message">
          <p>{error || 'Trip not found'}</p>
          <button onClick={() => navigate('/home')} className="btn-secondary">
            ← Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container trip-location-container">
      <div className="location-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <h1>{trip.title}</h1>
      </div>

      <div className="location-content">
        {/* Location Info Section */}
        <div className="location-info">
          <div className="info-card">
            <h2>📍 Trip Location</h2>
            <p className="location-text">{trip.location}</p>
            
            <div className="location-details">
              {trip.startDate && (
                <div className="detail-item">
                  <span className="detail-label">📅 Start Date:</span>
                  <span className="detail-value">{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {trip.endDate && (
                <div className="detail-item">
                  <span className="detail-label">📅 End Date:</span>
                  <span className="detail-value">{new Date(trip.endDate).toLocaleDateString()}</span>
                </div>
              )}
              {trip.category && (
                <div className="detail-item">
                  <span className="detail-label">🏷️ Category:</span>
                  <span className="detail-value">{trip.category}</span>
                </div>
              )}
              {trip.participants && (
                <div className="detail-item">
                  <span className="detail-label">👥 Participants:</span>
                  <span className="detail-value">{trip.participants.length || 0}</span>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button onClick={openInGoogleMaps} className="btn-primary">
                🗺️ View on Google Maps
              </button>
              <button onClick={getDirections} className="btn-secondary">
                🧭 Get Directions
              </button>
            </div>
          </div>

          {/* Trip Description */}
          {trip.description && (
            <div className="info-card">
              <h3>📝 About This Trip</h3>
              <p className="description-text">{trip.description}</p>
            </div>
          )}

          {/* Budget Info */}
          {trip.budget && (
            <div className="info-card budget-info">
              <h3>💰 Budget</h3>
              <p className="budget-text">{trip.budget}</p>
            </div>
          )}
        </div>

        {/* Map Embed Section */}
        <div className="map-embed-section">
          <div className="map-container">
            {trip.location ? (
              <>
                {/* Map Preview Image - Static Maps API with Location Overlay */}
                <div className="map-preview-wrapper">
                  <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(trip.location)}&zoom=15&size=600x400&markers=color:red%7C${encodeURIComponent(trip.location)}&key=AIzaSyAIHFMkFApePoPqCOx6fLnWrxg7cFFfZJ4`}
                    alt={`Map of ${trip.location}`}
                    style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/600x400?text=Map+of+${trip.location}`;
                    }}
                    className="map-preview"
                  />
                  {/* Location Popup Overlay */}
                  <div className="location-popup">
                    <div className="popup-content">
                      <span className="popup-icon">📍</span>
                      <span className="popup-text">{trip.location}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-map">
                <p>No location information available.</p>
              </div>
            )}
          </div>

          {/* Map Info Card */}
          <div className="map-info-card">
            <h3>🌍 Location Details</h3>
            <div className="location-coordinates">
              <p><strong>Location:</strong> {trip.location}</p>
              {trip.country && <p><strong>Country:</strong> {trip.country}</p>}
              {trip.city && <p><strong>City:</strong> {trip.city}</p>}
              {trip.region && <p><strong>Region:</strong> {trip.region}</p>}
            </div>

            {/* Share Location */}
            <div className="share-section">
              <h4>📤 Share Location</h4>
              <button 
                onClick={() => {
                  const text = `Join me on trip to ${trip.location}! ${trip.title}`;
                  if (navigator.share) {
                    navigator.share({
                      title: trip.title,
                      text: text,
                      url: window.location.href
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(
                      `${trip.title}\nLocation: ${trip.location}\nURL: ${window.location.href}`
                    );
                    alert('Location copied to clipboard!');
                  }
                }}
                className="btn-secondary"
              >
                📋 Share This Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripLocationMap;
