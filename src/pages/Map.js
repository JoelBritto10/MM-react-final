import React, { useState, useEffect } from 'react';
import './Map.css';

function Map({ currentUser }) {
  const [trips, setTrips] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' });
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Load trips from localStorage
    const storedTrips = JSON.parse(localStorage.getItem('trips')) || [];
    setTrips(storedTrips);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Your Current Location'
          });
          setLoading(false);
        },
        error => {
          console.log('Geolocation error:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // Handle click outside to close flipped card
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectedTripId && !e.target.closest('.trip-flip-card')) {
        setSelectedTripId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedTripId]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  // Helper functions to extract coordinates from URL
  const extractLatFromUrl = (url) => {
    const match = url?.match(/@(-?\d+\.\d+),/);
    return match ? parseFloat(match[1]) : null;
  };

  const extractLngFromUrl = (url) => {
    const match = url?.match(/@-?\d+\.\d+,(-?\d+\.\d+)/);
    return match ? parseFloat(match[1]) : null;
  };

  // Generate Google Maps URL for selected trip
  const generateMapUrlForTrip = (trip) => {
    const tripLat = extractLatFromUrl(trip.mapsUrl) || trip.latitude;
    const tripLng = extractLngFromUrl(trip.mapsUrl) || trip.longitude;
    
    if (!tripLat || !tripLng) return '';
    
    const tripLatNum = parseFloat(tripLat);
    const tripLngNum = parseFloat(tripLng);
    
    // Format: directions from current location to destination
    // This will show both "Your location" and "Choose destination"
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${tripLatNum},${tripLngNum}?entry=ttu`;
  };

  // Handle joining a trip
  const handleJoinTrip = (trip) => {
    if (!currentUser) {
      alert('Please log in to join a trip');
      return;
    }

    // Check if user already joined
    if (trip.participants && trip.participants.includes(currentUser.id)) {
      alert('You have already joined this trip');
      return;
    }

    // Check if trip is at max capacity
    if (trip.maxCount && trip.participants && trip.participants.length >= trip.maxCount) {
      alert('This trip is full! No more participants can join.');
      return;
    }

    // Add user to participants
    const updatedTrips = trips.map(t => {
      if (t.id === trip.id) {
        return {
          ...t,
          participants: [...(t.participants || []), currentUser.id]
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    alert('Successfully joined the trip!');
  };

  if (loading) {
    return (
      <div className="container">
        <h1>📍 Discover Trips Near You</h1>
        <div className="loading">Loading your location...</div>
      </div>
    );
  }

  const tripsWithDistance = trips
    .filter(t => {
      // Only show trips if user is the host or has joined
      const isHost = t.hostId === currentUser?.id;
      const hasJoined = t.participants && t.participants.includes(currentUser?.id);
      return (t.mapsUrl || (t.latitude && t.longitude)) && (isHost || hasJoined);
    })
    .map(trip => {
      const lat = trip.latitude || extractLatFromUrl(trip.mapsUrl);
      const lng = trip.longitude || extractLngFromUrl(trip.mapsUrl);
      return {
        ...trip,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(lat),
          parseFloat(lng)
        )
      };
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  return (
    <div className="container">
      <h1>📍 Discover Trips Near You</h1>
      
      <div className="location-info">
        <div className="location-info-content">
          <h3>📍 {userLocation.name}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={`https://www.google.com/maps/?q=${userLocation.lat},${userLocation.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-small">
              🗺️ Open in Maps
            </a>
          </div>
        </div>
      </div>

      <div className="trips-list">
        <h2>📍 Available Trips (Sorted by Distance)</h2>
        {tripsWithDistance.length === 0 ? (
          <p className="no-trips">No trips available. <a href="/create-trip">Create one!</a></p>
        ) : (
          <div className="trips-grid">
            {tripsWithDistance.map(trip => {
              const isHost = trip.hostId === currentUser?.id;
              const hasJoined = trip.participants && trip.participants.includes(currentUser?.id);
              const mapUrl = generateMapUrlForTrip(trip);

              return (
                <div
                  key={trip.id}
                  className={`trip-flip-card ${selectedTripId === trip.id ? 'flipped' : ''}`}
                  onClick={() => setSelectedTripId(selectedTripId === trip.id ? null : trip.id)}
                >
                  {/* Front of card - Trip Info */}
                  <div className="trip-flip-front card">
                    {trip.image && (
                      <div className="trip-image-container">
                        <img src={trip.image} alt={trip.title} className="trip-image" />
                      </div>
                    )}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="trip-header">
                        <div className="trip-title-section">
                          <h4>{trip.title}</h4>
                          {trip.participants && trip.participants.length > 0 && (
                            <span className="participants-badge">
                              👥 {trip.participants.length} joined
                            </span>
                          )}
                        </div>
                        <span className="distance-badge">
                          📏 {trip.distance} mi
                        </span>
                      </div>
                      <p className="trip-location">📍 {trip.location}</p>
                      <p className="trip-date">📅 {trip.date}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {!isHost && !hasJoined && (
                          <>
                            {trip.maxCount && trip.participants && trip.participants.length >= trip.maxCount ? (
                              <button 
                                className="btn btn-join"
                                disabled
                                style={{ opacity: '0.5', cursor: 'not-allowed', backgroundColor: '#ccc' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                🚫 Trip is Full
                              </button>
                            ) : (
                              <button 
                                className="btn btn-join"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinTrip(trip);
                                }}
                              >
                                ➕ Join Trip
                              </button>
                            )}
                            {trip.maxCount && (
                              <span style={{ fontSize: '12px', color: '#999' }}>
                                {trip.participants?.length || 0}/{trip.maxCount}
                              </span>
                            )}
                          </>
                        )}
                        {hasJoined && (
                          <button 
                            className="btn btn-directions"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mapUrl) window.open(mapUrl, '_blank');
                            }}
                          >
                            🧭 Directions
                          </button>
                        )}
                        {isHost && (
                          <button 
                            className="btn btn-directions"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (mapUrl) window.open(mapUrl, '_blank');
                            }}
                          >
                            🧭 Directions
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back of card - Trip Details */}
                  <div className="trip-flip-back card">
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}>
                      <h4 style={{ margin: '0 0 12px 0' }}>{trip.title}</h4>
                      <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                        📍 {trip.location}
                      </p>
                      <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                        📅 {trip.date}
                      </p>
                      {trip.description && (
                        <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>
                          {trip.description}
                        </p>
                      )}
                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#999' }}>
                        📏 {trip.distance} miles away
                      </p>
                      <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999' }}>
                        👥 {trip.participants?.length || 0} members joined
                      </p>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#ccc' }}>
                        Click to flip
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
