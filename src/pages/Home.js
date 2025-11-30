import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ currentUser }) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load trips from localStorage
  useEffect(() => {
    const loadTrips = () => {
      const storedTrips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      setTrips(storedTrips);
    };

    loadTrips();

    // Set up listener for storage changes
    window.addEventListener('storage', loadTrips);
    return () => window.removeEventListener('storage', loadTrips);
  }, []);

  // Handle joining a trip
  const handleJoinTrip = (trip) => {
    if (!currentUser) {
      alert('Please log in to join a trip');
      return;
    }

    const userId = currentUser?.uid || 'demo-user';

    // Check if user already joined
    if (trip.participants && trip.participants.includes(userId)) {
      alert('You have already joined this trip');
      return;
    }

    // Check if trip is at max capacity
    if (trip.maxCount && trip.participants && trip.participants.length >= trip.maxCount) {
      alert('This trip is full! No more participants can join.');
      return;
    }

    try {
      // Update trip participants in localStorage
      const storedTrips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      const tripIndex = storedTrips.findIndex(t => t.id === trip.id);
      
      if (tripIndex !== -1) {
        storedTrips[tripIndex].participants = [...(storedTrips[tripIndex].participants || []), userId];
        localStorage.setItem('mapmates_trips', JSON.stringify(storedTrips));
        setTrips(storedTrips);
        alert('Successfully joined the trip!');
      }
    } catch (error) {
      console.error('Error joining trip:', error);
      alert('Failed to join trip. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Discover trips</h1>
        <Link to="/create-trip" className="btn-primary">+ Create trip</Link>
      </div>

      <div className="trips-container">
        {trips.length === 0 ? (
          <div className="empty-state">
            <h3>No trips yet</h3>
            <p>Be the first to create a trip!</p>
            <Link to="/create-trip" className="btn-primary">Create trip</Link>
          </div>
        ) : (
          trips.map(trip => {
            const isHost = trip.hostId === currentUser?.id;
            const hasJoined = trip.participants && trip.participants.includes(currentUser?.id);
            const participantCount = trip.participants?.length || 0;
            const capacityFill = trip.maxCount ? Math.round((participantCount / trip.maxCount) * 100) : 0;
            const tripDate = new Date(trip.date);
            const today = new Date();
            const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
            const isTripCompleted = tripDate < today; // Trip is completed if date has passed
            
            return (
              <div key={trip.id} className="trip-card">
                {trip.image && (
                  <div 
                    className="trip-image" 
                    style={{ backgroundImage: `url('${trip.image}')` }}
                  >
                    <div className="trip-image-overlay">
                      <span className="trip-category">{trip.category || '🌍 Trip'}</span>
                      {daysUntilTrip > 0 && (
                        <span className="trip-countdown">{daysUntilTrip} days away</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="trip-content">
                  <div className="trip-header">
                    <div>
                      <div className="trip-date">{tripDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <h3 className="trip-title">{trip.title}</h3>
                    </div>
                    <div className="trip-badges">
                      {isHost && (
                        <span className="host-badge">👤 Host</span>
                      )}
                      {hasJoined && !isHost && (
                        <span className="joined-badge">✓ Joined</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="trip-description">{trip.description}</p>
                  
                  <div className="trip-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{trip.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🏠</span>
                      <span className="detail-text">Hosted by <strong>{trip.hostName}</strong></span>
                    </div>
                  </div>

                  <div className="trip-participants-info">
                    <div className="participants-header">
                      <span className="participants-label">Participants</span>
                      <span className="participants-count">{participantCount}{trip.maxCount ? `/${trip.maxCount}` : ''}</span>
                    </div>
                    {trip.maxCount && (
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill" 
                          style={{ 
                            width: `${capacityFill}%`,
                            background: capacityFill > 80 ? '#ff6b6b' : capacityFill > 50 ? '#ffd93d' : '#10b981'
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="trip-actions">
                    {isHost ? (
                      <Link to={`/edit-trip/${trip.id}`} className="btn-secondary">✏️ Edit trip</Link>
                    ) : hasJoined ? (
                      isTripCompleted ? (
                        <Link 
                          to={`/trip-review/${trip.id}`}
                          className="btn-primary"
                        >
                          ⭐ Review Trip
                        </Link>
                      ) : (
                        <>
                          <Link 
                            to={`/map?tripId=${trip.id}`}
                            className="btn-primary"
                          >
                            🗺️ Navigate
                          </Link>
                          <Link 
                            to="/chat"
                            className="btn-chat"
                          >
                            💬 Group Chat
                          </Link>
                        </>
                      )
                    ) : (
                      <button 
                        onClick={() => handleJoinTrip(trip)}
                        className="btn-primary"
                        disabled={trip.maxCount && participantCount >= trip.maxCount}
                      >
                        + Join trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Home;
