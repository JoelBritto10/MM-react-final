import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { updateTrip, subscribeToTrips, sendTripJoinConfirmation } from '../firebaseUtils';

function Home({ currentUser }) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load trips from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToTrips((firebaseTrips) => {
      setTrips(firebaseTrips);
    });

    return () => unsubscribe();
  }, []);

  // Filter trips by category
  useEffect(() => {
    let results = trips;
    if (selectedCategory !== 'all') {
      results = trips.filter(trip => trip.category === selectedCategory);
    }
    setFilteredTrips(results);
  }, [trips, selectedCategory]);

  // Handle joining a trip
  const handleJoinTrip = async (trip) => {
    if (!currentUser) {
      alert('Please log in to join a trip');
      return;
    }

    if (!trip.id) {
      console.error('Trip ID is missing:', trip);
      alert('❌ Invalid trip. Please refresh the page and try again.');
      return;
    }

    const userId = currentUser?.id || currentUser?.uid;

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
      // Update trip participants in Firebase
      const updatedParticipants = [...(trip.participants || []), userId];
      await updateTrip(trip.id, {
        participants: updatedParticipants,
        participantCount: updatedParticipants.length,
        updatedAt: new Date().toISOString()
      });
      
      // Send confirmation email
      await sendTripJoinConfirmation(
        currentUser.email,
        currentUser.username || currentUser.email.split('@')[0],
        trip.title,
        trip.location,
        new Date(trip.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        trip.hostName
      );
      
      alert('✅ Successfully joined the trip! Check your email for confirmation.');
    } catch (error) {
      console.error('Error joining trip:', error);
      alert('❌ Failed to join trip. This trip may have been deleted. Please refresh the page.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Discover trips</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '14px' }}
            >
              ✕ Clear filter ({selectedCategory})
            </button>
          )}
          <Link to="/create-trip" className="btn-primary-small">+ Create</Link>
        </div>
      </div>

      <div className="trips-container">
        {filteredTrips.length === 0 ? (
          <div className="empty-state">
            <h3>No trips {selectedCategory !== 'all' ? `in ${selectedCategory}` : 'yet'}</h3>
            <p>
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category or create a new trip!' 
                : 'Be the first to create a trip!'}
            </p>
            {selectedCategory !== 'all' && (
              <button 
                onClick={() => setSelectedCategory('all')}
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                View All Trips
              </button>
            )}
            <Link to="/create-trip" className="btn-primary">Create trip</Link>
          </div>
        ) : (
          filteredTrips.map(trip => {
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
                      <button
                        onClick={() => setSelectedCategory(trip.category)}
                        className="trip-category"
                        style={{ 
                          cursor: 'pointer', 
                          border: 'none', 
                          background: 'rgba(0, 0, 0, 0.6)', 
                          padding: '4px 8px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        title={`Filter by ${trip.category}`}
                      >
                        {trip.category || '🌍 Trip'}
                      </button>
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
