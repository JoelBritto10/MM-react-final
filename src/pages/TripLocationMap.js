import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripLocationMap.css';

function TripLocationMap({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState('');
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load trip from localStorage
  useEffect(() => {
    try {
      const storedTrips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      const foundTrip = storedTrips.find(t => t.id === tripId);
      
      if (foundTrip) {
        setTrip(foundTrip);
        // Generate Google Maps URL with location pointer
        if (foundTrip.location) {
          const mapsUrl = generateGoogleMapsUrl(foundTrip.location);
          setMapUrl(mapsUrl);
        }
      } else {
        setError('Trip not found');
      }
    } catch (err) {
      console.error('Error loading trip:', err);
      setError('Failed to load trip');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Generate Google Maps URL with location pointer
  const generateGoogleMapsUrl = (location) => {
    if (!location) return '';
    
    // Encode location for URL
    const encodedLocation = encodeURIComponent(location);
    
    // Use iframe-compatible URL that shows the location with a marker
    // This URL format ensures the marker appears at the location
    return `https://www.google.com/maps?q=${encodedLocation}&output=embed`;
  };

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
            {mapUrl ? (
              <>
                <iframe
                  title={`Map of ${trip.location}`}
                  width="100%"
                  height="500"
                  frameBorder="0"
                  src={mapUrl}
                  style={{ borderRadius: '12px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                ></iframe>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                  📍 Location: {trip.location}
                </p>
              </>
            ) : (
              <div className="no-map">
                <p>Unable to display map. Click "View on Google Maps" to see the location.</p>
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

      {/* Quick Navigation */}
      <div className="quick-nav">
        <button onClick={() => navigate('/home')} className="btn-nav">Home</button>
        <button onClick={() => navigate('/map')} className="btn-nav">Trip Map</button>
        <button onClick={() => navigate(`/trip-group-chat/${tripId}`)} className="btn-nav">Chat</button>
      </div>
    </div>
  );
}

export default TripLocationMap;
