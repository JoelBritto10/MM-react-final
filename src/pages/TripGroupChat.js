import React, { useState, useEffect, useRef } from 'react';
import './TripGroupChat.css';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const TripGroupChat = ({ tripId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch trip data and verify membership
  useEffect(() => {
    const verifyMembershipAndLoadChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user's UID
        const currentUserUid = currentUser?.uid || auth.currentUser?.uid;

        if (!currentUserUid) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // Fetch trip document
        const tripRef = doc(db, 'trips', tripId);
        const tripSnapshot = await getDoc(tripRef);

        if (!tripSnapshot.exists()) {
          setError('Trip not found');
          setLoading(false);
          return;
        }

        const trip = tripSnapshot.data();
        setTripData(trip);

        // Verify user is a member of the trip
        const tripMembers = trip.members || trip.participants || [];
        const isMember = tripMembers.includes(currentUserUid);

        if (!isMember) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // User is verified as a member - set up real-time message listener
        const messagesRef = collection(db, 'trips', tripId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date()
            }));
            setMessages(loadedMessages);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error('Error verifying membership:', err);
        setError('Error loading chat');
        setLoading(false);
      }
    };

    if (tripId) {
      verifyMembershipAndLoadChat();
    }
  }, [tripId, currentUser]);

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Validate message
    if (!messageInput.trim()) {
      return;
    }

    if (messageInput.length > 500) {
      setError('Message is too long (max 500 characters)');
      return;
    }

    const currentUserUid = currentUser?.uid || auth.currentUser?.uid;
    const userName = currentUser?.displayName || auth.currentUser?.displayName || 'Anonymous';

    try {
      setIsSending(true);
      setError(null);

      const messagesRef = collection(db, 'trips', tripId, 'messages');

      await addDoc(messagesRef, {
        userId: currentUserUid,
        userName: userName,
        userAvatar: currentUser?.photoURL || auth.currentUser?.photoURL || '👤',
        content: messageInput.trim(),
        timestamp: serverTimestamp(),
        edited: false
      });

      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Check if date changed between messages
  const shouldShowDateDivider = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    return formatDate(currentMsg.timestamp) !== formatDate(prevMsg.timestamp);
  };

  // Access Denied State
  if (accessDenied) {
    return (
      <div className="trip-chat-container">
        <div className="access-denied-state">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this chat.</p>
          <p className="access-denied-hint">Join the trip to participate in the group chat.</p>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="trip-chat-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !messages.length) {
    return (
      <div className="trip-chat-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentUserUid = currentUser?.uid || auth.currentUser?.uid;

  return (
    <div className="trip-chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <h2 className="chat-title">
            {tripData?.title || 'Trip Chat'}
          </h2>
          <p className="chat-members-count">
            {tripData?.members?.length || tripData?.participants?.length || 0} members
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-chat-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Start the conversation by sending the first message!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => {
              const isCurrentUser = message.userId === currentUserUid;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showDateDivider = shouldShowDateDivider(message, prevMessage);
              const sameUserAsPrev = prevMessage && prevMessage.userId === message.userId;
              const showUserInfo = !sameUserAsPrev;

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <div className="date-divider">
                      <span className="date-text">{formatDate(message.timestamp)}</span>
                    </div>
                  )}

                  <div className={`message-wrapper ${isCurrentUser ? 'message-sent' : 'message-received'}`}>
                    {!isCurrentUser && showUserInfo && (
                      <div className="message-avatar">{message.userAvatar}</div>
                    )}

                    <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
                      {!isCurrentUser && showUserInfo && (
                        <div className="message-sender-name">{message.userName}</div>
                      )}

                      <div className="message-content">
                        <p>{message.content}</p>
                        {message.edited && (
                          <span className="message-edited-badge">(edited)</span>
                        )}
                      </div>

                      <div className="message-time">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>

                    {isCurrentUser && (
                      <div className="message-avatar-right">
                        {currentUser?.photoURL || '👤'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      {/* Message Input Area */}
      <div className="message-input-area">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            disabled={isSending}
            maxLength="500"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!messageInput.trim() || isSending}
            title="Send message"
          >
            {isSending ? '⏳' : '✈️'}
          </button>
        </form>
        <div className="character-count">
          {messageInput.length}/500
        </div>
      </div>
    </div>
  );
};

export default TripGroupChat;
