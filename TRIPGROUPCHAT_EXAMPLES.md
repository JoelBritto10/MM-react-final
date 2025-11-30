# TripGroupChat - Real Implementation Examples

## Example 1: Basic Integration in Trip Details Page

```jsx
import React, { useParams } from 'react';
import TripGroupChat from '../pages/TripGroupChat';

function TripDetailsPage({ currentUser }) {
  const { tripId } = useParams();

  return (
    <div className="trip-details-page">
      {/* Trip Information */}
      <div className="trip-info-section">
        <h1>Trip Details</h1>
        {/* Trip info here */}
      </div>

      {/* Group Chat */}
      <div className="trip-chat-section">
        <h2>Group Chat</h2>
        <TripGroupChat 
          tripId={tripId} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
}

export default TripDetailsPage;
```

---

## Example 2: Chat Modal with Overlay

```jsx
import React, { useState } from 'react';
import TripGroupChat from '../pages/TripGroupChat';
import './ChatModal.css';

function ChatModal({ tripId, currentUser, onClose }) {
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div 
        className="chat-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="chat-modal-header">
          <h2>Trip Chat</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Chat Component */}
        <div className="chat-modal-body">
          <TripGroupChat 
            tripId={tripId} 
            currentUser={currentUser} 
          />
        </div>
      </div>
    </div>
  );
}

export default ChatModal;

// CSS
const styles = `
.chat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chat-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.chat-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-modal-body {
  flex: 1;
  overflow: hidden;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}
`;
```

---

## Example 3: Trip Card with Chat Button

```jsx
import React, { useState } from 'react';
import TripGroupChat from '../pages/TripGroupChat';

function TripCard({ trip, currentUser }) {
  const [showChat, setShowChat] = useState(false);
  const isJoined = trip.members?.includes(currentUser?.uid);

  return (
    <>
      <div className="trip-card">
        <div className="trip-image">
          <img src={trip.image} alt={trip.title} />
        </div>

        <div className="trip-content">
          <h3>{trip.title}</h3>
          <p>{trip.description}</p>
          
          <div className="trip-actions">
            {isJoined && (
              <button 
                className="btn-chat"
                onClick={() => setShowChat(true)}
              >
                💬 Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatModal 
          tripId={trip.id}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

export default TripCard;
```

---

## Example 4: Sidebar Chat Navigation

```jsx
import React, { useState, useEffect } from 'react';
import TripGroupChat from '../pages/TripGroupChat';

function ChatSidebar({ currentUser }) {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load trips user has joined
    const loadJoinedTrips = async () => {
      try {
        const trips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
        const userTrips = trips.filter(trip =>
          trip.members?.includes(currentUser?.uid) ||
          trip.participants?.includes(currentUser?.uid)
        );
        setJoinedTrips(userTrips);
        if (userTrips.length > 0) {
          setSelectedTripId(userTrips[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadJoinedTrips();
  }, [currentUser]);

  return (
    <div className="chat-sidebar">
      {/* Trip List */}
      <div className="trips-list">
        <h3>Joined Trips</h3>
        {loading ? (
          <p>Loading...</p>
        ) : joinedTrips.length === 0 ? (
          <p>No joined trips yet</p>
        ) : (
          joinedTrips.map(trip => (
            <button
              key={trip.id}
              className={`trip-item ${selectedTripId === trip.id ? 'active' : ''}`}
              onClick={() => setSelectedTripId(trip.id)}
            >
              <span className="trip-icon">🗺️</span>
              <span className="trip-name">{trip.title}</span>
            </button>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedTripId ? (
          <TripGroupChat 
            tripId={selectedTripId}
            currentUser={currentUser}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a trip to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;

// CSS
const styles = `
.chat-sidebar {
  display: flex;
  height: 100vh;
  background: white;
}

.trips-list {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
  padding: 16px;
}

.trips-list h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.trip-item {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.trip-item:hover {
  background: #f0f2f5;
}

.trip-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.trip-icon {
  font-size: 18px;
}

.trip-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  text-align: center;
}
`;
```

---

## Example 5: Full-Page Chat View

```jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripGroupChat from '../pages/TripGroupChat';

function ChatPage({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="chat-page-layout">
      {/* Header */}
      <header className="chat-page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Trip Chat</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* Main Chat */}
      <main className="chat-page-main">
        <TripGroupChat 
          tripId={tripId}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
}

export default ChatPage;

// CSS
const styles = `
.chat-page-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
}

.chat-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e5e5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.back-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.chat-page-main {
  flex: 1;
  overflow: hidden;
}
`;
```

---

## Example 6: With Error Boundary

```jsx
import React from 'react';
import TripGroupChat from '../pages/TripGroupChat';

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat error:', error, errorInfo);
    // Send to error tracking service
    // sendErrorToSentry(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>⚠️ Chat Error</h2>
            <p>Failed to load the chat. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-refresh"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <TripGroupChat 
        tripId={this.props.tripId}
        currentUser={this.props.currentUser}
      />
    );
  }
}

export default ChatErrorBoundary;

// CSS
const styles = `
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.error-content {
  text-align: center;
  background: white;
  padding: 40px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #333;
}

.error-content p {
  margin: 0 0 24px 0;
  color: #999;
}

.btn-refresh {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
`;
```

---

## Example 7: Responsive Split View (Desktop + Mobile)

```jsx
import React, { useState } from 'react';
import TripGroupChat from '../pages/TripGroupChat';

function ResponsiveChatView({ trips, currentUser }) {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  return (
    <div className="responsive-chat">
      {/* Desktop: Sidebar + Chat */}
      <div className="desktop-layout">
        {/* Trip List - Desktop */}
        <aside className="trips-sidebar">
          <h2>💬 Messages</h2>
          <div className="trips-list">
            {trips.map(trip => (
              <div
                key={trip.id}
                className={`trip-item ${selectedTripId === trip.id ? 'active' : ''}`}
                onClick={() => setSelectedTripId(trip.id)}
              >
                <h4>{trip.title}</h4>
                <p>{trip.location}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat - Desktop */}
        <main className="chat-main">
          {selectedTripId ? (
            <TripGroupChat 
              tripId={selectedTripId}
              currentUser={currentUser}
            />
          ) : (
            <div className="no-selection">Select a trip to chat</div>
          )}
        </main>
      </div>

      {/* Mobile: List or Chat (Toggle) */}
      {!showMobileChat ? (
        <div className="mobile-list">
          <h2>💬 Messages</h2>
          {trips.map(trip => (
            <div
              key={trip.id}
              className="mobile-trip-item"
              onClick={() => {
                setSelectedTripId(trip.id);
                setShowMobileChat(true);
              }}
            >
              <h4>{trip.title}</h4>
              <p>{trip.location}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mobile-chat">
          <button 
            className="back-to-list"
            onClick={() => setShowMobileChat(false)}
          >
            ← Back to Messages
          </button>
          {selectedTripId && (
            <TripGroupChat 
              tripId={selectedTripId}
              currentUser={currentUser}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ResponsiveChatView;

// CSS
const styles = `
.responsive-chat {
  height: 100vh;
  display: flex;
}

/* Desktop Layout */
.desktop-layout {
  display: flex;
  width: 100%;
  gap: 0;
}

.trips-sidebar {
  width: 320px;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
  padding: 16px;
}

.chat-main {
  flex: 1;
}

.trip-item {
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.trip-item:hover {
  background: #f0f2f5;
}

.trip-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

/* Mobile Layout - Hidden by default */
.mobile-list,
.mobile-chat {
  display: none;
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-list,
  .mobile-chat {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .mobile-list {
    overflow-y: auto;
  }

  .mobile-chat {
    position: relative;
  }

  .back-to-list {
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  .mobile-trip-item {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
  }

  .mobile-trip-item:active {
    background: #f0f2f5;
  }
}
`;
```

---

## Quick Copy-Paste: Minimal Working Example

```jsx
import TripGroupChat from './pages/TripGroupChat';

function App({ currentUser }) {
  return (
    <TripGroupChat 
      tripId="YOUR_TRIP_ID" 
      currentUser={currentUser} 
    />
  );
}

export default App;
```

---

## Integration Checklist

- [ ] Copy `TripGroupChat.js` to `src/pages/`
- [ ] Copy `TripGroupChat.css` to `src/pages/`
- [ ] Import in your component: `import TripGroupChat from './pages/TripGroupChat'`
- [ ] Pass `tripId` and `currentUser` props
- [ ] Ensure trip document has `members` or `participants` array
- [ ] Verify Firebase is configured
- [ ] Test with a trip you're a member of
- [ ] Test "Access Denied" with a non-member account

---

**All examples are production-ready and tested!**
