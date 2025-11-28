import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import TripSuggestions from '../components/TripSuggestions';

function Home({ currentUser }) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [expandedChatTrip, setExpandedChatTrip] = useState(null);
  const [tripMessages, setTripMessages] = useState({});
  const [newMessages, setNewMessages] = useState({});

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

  const handleEndTrip = (trip) => {
    const confirmEnd = window.confirm('Are you sure you want to end this trip? Members will be able to rate it.');
    if (!confirmEnd) return;

    // Mark trip as ended
    const updatedTrips = trips.map(t => {
      if (t.id === trip.id) {
        return {
          ...t,
          ended: true,
          endedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    alert('Trip ended! Members can now rate their experience.');
  };

  const handleSendMessageFromCard = (tripId, message) => {
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      tripId: tripId
    };

    const messages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    if (!messages[tripId]) {
      messages[tripId] = [];
    }
    messages[tripId].push(newMsg);
    localStorage.setItem('tripMessages', JSON.stringify(messages));

    setTripMessages(messages);
    setNewMessages(prev => ({
      ...prev,
      [tripId]: ''
    }));
  };

  const getTripLastMessage = (tripId) => {
    const messages = tripMessages[tripId] || [];
    if (messages.length === 0) return 'No messages yet';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.message.substring(0, 50) + (lastMsg.message.length > 50 ? '...' : '');
  };

  useEffect(() => {
    // Load trips from localStorage
    const storedTrips = JSON.parse(localStorage.getItem('trips')) || [];
    setTrips(storedTrips);
    
    // Load all messages
    const messages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    setTripMessages(messages);
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
              <p className="trip-date">📅 {new Date(trip.date).toLocaleDateString()} {trip.time && `@ ${trip.time}`}</p>
              {trip.participants && trip.participants.length > 0 && (
                <p className="trip-participants">👥 {trip.participants.length} joined</p>
              )}
              {trip.ended && (
                <p className="trip-ended-badge">✅ Trip Ended</p>
              )}
              
              {/* Chat Preview Section */}
              {expandedChatTrip === trip.id ? (
                <div className="trip-chat-preview expanded">
                  <div className="chat-preview-header">
                    <h4>💬 {trip.title}</h4>
                    <button 
                      onClick={() => setExpandedChatTrip(null)}
                      className="close-chat-btn"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="chat-messages-mini">
                    {(tripMessages[trip.id] || []).length === 0 ? (
                      <p className="empty-chat">Start the conversation!</p>
                    ) : (
                      (tripMessages[trip.id] || []).slice(-3).map(msg => (
                        <div 
                          key={msg.id} 
                          className={`mini-message ${msg.username === currentUser.username ? 'sent' : 'received'}`}
                        >
                          <strong>{msg.username}</strong>
                          <p>{msg.message.substring(0, 40)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessageFromCard(trip.id, newMessages[trip.id] || '');
                    }}
                    className="chat-input-mini"
                  >
                    <input
                      type="text"
                      value={newMessages[trip.id] || ''}
                      onChange={(e) => setNewMessages(prev => ({
                        ...prev,
                        [trip.id]: e.target.value
                      }))}
                      placeholder="Type a message..."
                      maxLength="200"
                      className="mini-input"
                    />
                    <button type="submit" className="mini-send-btn">📤</button>
                  </form>
                </div>
              ) : (
                <div className="trip-chat-preview">
                  <button 
                    onClick={() => setExpandedChatTrip(trip.id)}
                    className="chat-preview-btn"
                    title="Click to chat"
                  >
                    <span className="chat-icon">💬</span>
                    <span className="preview-text">{getTripLastMessage(trip.id)}</span>
                  </button>
                </div>
              )}
              
              <div className="trip-actions">
                {currentUser?.id === trip.hostId && (
                  <>
                    {!trip.ended ? (
                      <>
                        <Link to={`/edit-trip/${trip.id}`} className="btn btn-primary">Edit</Link>
                        <Link to="/map" className="btn btn-secondary">🧭 Navigate</Link>
                        <button 
                          onClick={() => handleEndTrip(trip)}
                          className="btn btn-end"
                        >
                          🛑 End Trip
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/map" className="btn btn-secondary">🧭 Navigate</Link>
                      </>
                    )}
                  </>
                )}
                {currentUser?.id !== trip.hostId && (
                  <>
                    {!trip.participants || !trip.participants.includes(currentUser?.id) ? (
                      <>
                        {trip.maxCount && trip.participants && trip.participants.length >= trip.maxCount ? (
                          <button 
                            className="btn btn-join"
                            disabled
                            style={{ opacity: '0.5', cursor: 'not-allowed', backgroundColor: '#ccc' }}
                          >
                            🚫 Trip is Full
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinTrip(trip)}
                            className="btn btn-join"
                          >
                            ➕ Join Trip
                          </button>
                        )}
                        {trip.maxCount && (
                          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                            {trip.participants?.length || 0}/{trip.maxCount}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigate('/chat')} className="btn btn-chat">
                          💬 Join GC
                        </button>
                        <Link to="/map" className="btn btn-secondary">🧭 Navigate</Link>
                        {trip.ended && (
                          <Link to={`/trip-review/${trip.id}`} className="btn btn-review">
                            ⭐ Rate Trip
                          </Link>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trip Suggestions Widget - Only on Home Page */}
      <TripSuggestions currentUser={currentUser} />
    </div>
  );
}

export default Home;
