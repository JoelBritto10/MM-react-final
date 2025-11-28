import React, { useState, useEffect } from 'react';
import './Chat.css';

function Chat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    setMessages(storedMessages);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      sender: currentUser.username,
      text: newMessage,
      timestamp: new Date().toLocaleString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  return (
    <div className="container">
      <div className="chat-container card">
        <h1>💬 Messages</h1>
        
        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender === currentUser.username ? 'sent' : 'received'}`}>
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
              <small>{msg.timestamp}</small>
            </div>
          ))}
        </div>

        <div className="message-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
