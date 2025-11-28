import React, { useState, useEffect, useRef } from 'react';
import '../styles/TripGroupChat.css';

function TripGroupChat({ currentUser, trips }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const emojis = ['😀', '😂', '😍', '🎉', '👍', '🔥', '✨', '🎈', '👌', '💯', '😎', '🤔', '😢', '😡', '🤗', '❤️'];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectTrip = (tripId) => {
    setSelectedTripId(tripId);
    loadMessages(tripId);
    setIsExpanded(true);
  };

  const loadMessages = (tripId) => {
    const tripMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    const tripMsgs = tripMessages[tripId] || [];
    setMessages(tripMsgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    
    if (tripMsgs.length > 0) {
      const lastMsg = tripMsgs[tripMsgs.length - 1];
      setLastMessage(lastMsg.message.substring(0, 50));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTripId) return;

    const newMsg = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      tripId: selectedTripId
    };

    // Save to localStorage
    const tripMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    if (!tripMessages[selectedTripId]) {
      tripMessages[selectedTripId] = [];
    }
    tripMessages[selectedTripId].push(newMsg);
    localStorage.setItem('tripMessages', JSON.stringify(tripMessages));

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps/?q=${latitude},${longitude}`;
          const locationMessage = `📍 Location: ${mapsUrl}`;
          
          const newMsg = {
            id: Date.now().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            message: locationMessage,
            timestamp: new Date().toISOString(),
            tripId: selectedTripId,
            isLocation: true
          };

          const tripMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
          if (!tripMessages[selectedTripId]) {
            tripMessages[selectedTripId] = [];
          }
          tripMessages[selectedTripId].push(newMsg);
          localStorage.setItem('tripMessages', JSON.stringify(tripMessages));

          setMessages([...messages, newMsg]);
          setShowAttachmentMenu(false);
        },
        (error) => {
          alert('Unable to access location. Please enable location services.');
          console.error(error);
        }
      );
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image
        compressImage(reader.result).then(compressedImage => {
          const newMsg = {
            id: Date.now().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            message: 'Shared an image',
            image: compressedImage,
            timestamp: new Date().toISOString(),
            tripId: selectedTripId,
            isImage: true
          };

          const tripMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
          if (!tripMessages[selectedTripId]) {
            tripMessages[selectedTripId] = [];
          }
          tripMessages[selectedTripId].push(newMsg);
          localStorage.setItem('tripMessages', JSON.stringify(tripMessages));

          setMessages([...messages, newMsg]);
          setShowAttachmentMenu(false);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 300;
        const maxHeight = 300;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const selectedTrip = trips?.find(t => t.id === selectedTripId);

  if (!isExpanded) {
    // Minimized state - show trip selection
    return (
      <div className="trip-chat-widget minimized">
        <div className="trip-chat-label">
          <span>💬 Trip Chats</span>
          <span className="chip-count">{trips?.length || 0}</span>
        </div>
        
        {(!trips || trips.length === 0) ? (
          <p className="no-trips-msg">Join a trip to start chatting</p>
        ) : (
          <div className="trip-list">
            {trips.map(trip => (
              <button
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className="trip-chip"
                title={trip.title}
              >
                <span className="trip-icon">📍</span>
                <span className="trip-name">{trip.title.substring(0, 20)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Expanded state - show chat window
  return (
    <div className="trip-chat-widget expanded">
      <div className="chat-header">
        <div className="header-content">
          <span className="group-icon">📍</span>
          <div className="header-text">
            <h3 className="group-title">{selectedTrip?.title || 'Chat'}</h3>
            <p className="group-subtitle">{messages.length} messages</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsExpanded(false);
            setSelectedTripId(null);
          }}
          className="close-btn"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation! 👋</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.username === currentUser.username ? 'sent' : 'received'}`}
            >
              {msg.username !== currentUser.username && (
                <span className="sender-name">{msg.username}</span>
              )}
              {msg.isImage ? (
                <img src={msg.image} alt="Shared image" className="message-image" />
              ) : msg.isLocation ? (
                <a href={msg.message.split(': ')[1]} target="_blank" rel="noopener noreferrer" className="location-link">
                  📍 {msg.message}
                </a>
              ) : (
                <p className="message-text">{msg.message}</p>
              )}
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="emoji-btn"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="input-container">
        <div className="input-wrapper">
          <div className="icon-group">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="icon-btn attachment-btn"
              title="Attachments"
            >
              📎
            </button>

            {showAttachmentMenu && (
              <div className="attachment-menu">
                <button
                  type="button"
                  onClick={handleLocationShare}
                  className="attachment-option location"
                >
                  📍 Share Location
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="attachment-option image"
                >
                  🖼️ Upload Image
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          <input
            type="text"
            inputMode="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength="500"
            className="message-input"
          />

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="icon-btn emoji-btn"
            title="Emojis"
          >
            😊
          </button>
        </div>

        <div className="char-count-footer">
          <span className="char-count">{newMessage.length}/500</span>
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            ✈️ Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default TripGroupChat;
