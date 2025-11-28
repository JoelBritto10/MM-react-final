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

  useEffect(() => {
    // Load trips from localStorage
    const storedTrips = JSON.parse(localStorage.getItem('trips')) || [];
    setTrips(storedTrips);
  }, []);

  return (
    <div className="container">
      <div className="home-header">
        <h1>🗺️ Trip Locations & Experiences</h1>
        <Link to="/create-trip" className="btn btn-primary">➕ Create Trip</Link>
      </div>

      <div className="trips-grid">
        {trips.map(trip => (
          <div key={trip.id} className="trip-card card">
            {trip.image && (
              <div className="trip-image-container">
                <img src={trip.image} alt={trip.title} className="trip-image" />
              </div>
            )}
            <div style={{ padding: '12px' }}>
              <h3>{trip.title}</h3>
              <p className="trip-location">📍 {trip.location}</p>
              <p className="trip-desc">{trip.description}</p>
              <p className="trip-host">Hosted by <strong>{trip.hostName}</strong></p>
              <p className="trip-date">📅 {new Date(trip.date).toLocaleDateString()}</p>
              {trip.participants && trip.participants.length > 0 && (
                <p className="trip-participants">👥 {trip.participants.length} joined</p>
              )}
              <div className="trip-actions">
                {currentUser?.id === trip.hostId && (
                  <>
                    <Link to={`/edit-trip/${trip.id}`} className="btn btn-primary">Edit</Link>
                    <Link to="/map" className="btn btn-secondary">🧭 Navigate</Link>
                  </>
                )}
                {currentUser?.id !== trip.hostId && (
                  <>
                    <button 
                      onClick={() => handleJoinTrip(trip)}
                      className="btn btn-join"
                    >
                      {trip.participants && trip.participants.includes(currentUser?.id) ? '✓ Joined' : '➕ Join Trip'}
                    </button>
                    {trip.participants && trip.participants.includes(currentUser?.id) && (
                      <Link to="/map" className="btn btn-secondary">🧭 Navigate</Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
