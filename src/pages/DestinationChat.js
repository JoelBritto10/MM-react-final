import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DestinationChat.css';

function DestinationChat({ currentUser }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '🎉', '👍', '🔥', '✨', '🎈', '👌', '💯', '😎', '🤔', '😢', '😡', '🤗', '❤️'];

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 300;
          const maxHeight = 300;
          let width = img.width;
          let height = img.height;

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
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    loadChatData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = () => {
    if (!currentUser || !groupId) {
      setLoading(false);
      return;
    }

    // Load group info
    const groups = JSON.parse(localStorage.getItem('destinationChatGroups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (group) {
      setGroupInfo(group);
      
      // Add current user to participants if not already there
      if (!group.participants.includes(currentUser.id || currentUser.uid)) {
        group.participants.push(currentUser.id || currentUser.uid);
        const updatedGroups = groups.map(g => g.id === groupId ? group : g);
        localStorage.setItem('destinationChatGroups', JSON.stringify(updatedGroups));
      }
    }

    // Load messages for this group
    const destinationMessages = JSON.parse(localStorage.getItem('destinationChatMessages') || '{}');
    const groupMessages = destinationMessages[groupId] || [];
    setMessages(groupMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    
    setLoading(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    const newMsg = {
      id: Date.now().toString(),
      userId: currentUser.id || currentUser.uid,
      username: currentUser.displayName || currentUser.username || 'User',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      groupId: groupId,
      isImage: newMessage.includes('data:image/')
    };

    // Save message
    const destinationMessages = JSON.parse(localStorage.getItem('destinationChatMessages') || '{}');
    if (!destinationMessages[groupId]) {
      destinationMessages[groupId] = [];
    }
    destinationMessages[groupId].push(newMsg);
    localStorage.setItem('destinationChatMessages', JSON.stringify(destinationMessages));

    // Update state
    setMessages([...messages, newMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleLocationShare = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 Shared Location: https://maps.google.com/?q=${latitude},${longitude}`;
          setNewMessage(prev => prev + (prev ? '\n' : '') + locationMessage);
          setShowAttachmentMenu(false);
        },
        (error) => {
          alert('Could not access your location. Please enable location services.');
        }
      );
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file);
      setNewMessage(prev => prev + (prev ? '\n' : '') + compressedImage);
      setShowAttachmentMenu(false);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Could not upload image. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="destination-chat-page">
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container destination-chat-container">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/suggestions')}>
          ← Back
        </button>
        <div className="header-info">
          <h2>{groupInfo?.name || 'Destination Chat'}</h2>
          {groupInfo?.destination && (
            <>
              <p className="destination-name">📍 {groupInfo.destination}</p>
              <p className="location-detail">{groupInfo.location}</p>
            </>
          )}
        </div>
        <div className="participant-count">
          <span className="participant-badge">👥 {groupInfo?.participants?.length || 0}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>🗨️ Start a conversation about {groupInfo?.destination}!</p>
            <small>Be the first to share your thoughts, questions, or tips about this destination.</small>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.userId === (currentUser.id || currentUser.uid) ? 'own-message' : 'other-message'}`}
            >
              {msg.userId !== (currentUser.id || currentUser.uid) && (
                <div className="message-user">{msg.username}</div>
              )}
              <div className="message-content">
                {msg.isImage ? (
                  <img src={msg.message} alt="Shared" className="message-image" />
                ) : (
                  <div className="message-text">
                    {msg.message.startsWith('📍') ? (
                      <a href={msg.message.split(': ')[1]} target="_blank" rel="noopener noreferrer" className="location-link">
                        {msg.message}
                      </a>
                    ) : (
                      msg.message
                    )}
                  </div>
                )}
              </div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="message-input-area">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-btn"
                onClick={() => {
                  addEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <div className="attachment-menu">
            <button
              type="button"
              className="attachment-option"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Photo
            </button>
            <button
              type="button"
              className="attachment-option"
              onClick={handleLocationShare}
            >
              📍 Location
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="input-controls">
          <button
            type="button"
            className="control-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            😊
          </button>
          <button
            type="button"
            className="control-btn"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            title="Add attachment"
          >
            📎
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            Send
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </form>
    </div>
  );
}

export default DestinationChat;
