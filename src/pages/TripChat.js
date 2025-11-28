import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripChat.css';

function TripChat({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Load trip and verify user is a member
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const currentTrip = trips.find(t => t.id === tripId);

    if (!currentTrip) {
      setError('Trip not found');
      setLoading(false);
      return;
    }

    // Security check: Verify user is a participant
    const isParticipant = currentTrip.participants && currentTrip.participants.includes(currentUser.id);
    const isHost = currentTrip.hostId === currentUser.id;

    if (!isParticipant && !isHost) {
      setError('Access denied: You are not a member of this trip');
      setLoading(false);
      return;
    }

    // Set trip and load participants
    setTrip(currentTrip);

    // Load participants data
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tripParticipantIds = [currentTrip.hostId, ...(currentTrip.participants || [])];
    const tripParticipants = users.filter(u => tripParticipantIds.includes(u.id));
    setParticipants(tripParticipants);

    // Load messages for this trip
    const allMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    const tripMessages = allMessages[tripId] || [];
    setMessages(tripMessages);

    setLoading(false);
  }, [tripId, currentUser, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    if (!currentUser) {
      alert('Please log in to send messages');
      return;
    }

    // Create new message object
    const message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      tripId: tripId
    };

    // Save message to localStorage
    const allMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    if (!allMessages[tripId]) {
      allMessages[tripId] = [];
    }
    allMessages[tripId].push(message);
    localStorage.setItem('tripMessages', JSON.stringify(allMessages));

    // Update state
    setMessages([...messages, message]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="chat-loading">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="chat-error">
          <p>{error}</p>
          <button onClick={() => navigate('/home')} className="btn btn-primary">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="trip-chat-card card">
        <div className="chat-header">
          <h1>💬 {trip?.title} - Group Chat</h1>
          <button onClick={() => navigate('/home')} className="btn btn-secondary">
            ← Back
          </button>
        </div>

        {/* Participants Section */}
        <div className="participants-section">
          <h3>👥 Participants ({participants.length})</h3>
          <div className="participants-list">
            {participants.map(participant => (
              <div key={participant.id} className="participant-badge">
                <span className="participant-name">{participant.username}</span>
                {participant.id === trip?.hostId && <span className="host-badge">Host</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Messages Section */}
        <div className="messages-section">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="message-item">
                  <div className="message-header">
                    <strong className="message-username">{msg.username}</strong>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="message-content">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
              maxLength="500"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </div>
          <span className="character-count">{newMessage.length}/500</span>
        </form>

        {/* Trip Info */}
        <div className="trip-info-mini card">
          <h4>📍 {trip?.location}</h4>
          <p>{trip?.description}</p>
          <p className="trip-date">📅 {new Date(trip?.date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default TripChat;
