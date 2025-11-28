import React, { useState, useEffect } from 'react';
import './Karma.css';

function Karma({ currentUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const sorted = storedUsers.sort((a, b) => (b.karma || 0) - (a.karma || 0));
    setUsers(sorted);
  }, []);

  const getKarmaBadge = (karma) => {
    karma = karma || 0;
    if (karma >= 500) return '👑 Master';
    if (karma >= 200) return '🏆 Legend';
    if (karma >= 100) return '⛰️ Adventurer';
    if (karma >= 50) return '🗺️ Explorer';
    return '🌱 Beginner';
  };

  return (
    <div className="container">
      <div className="karma-container card">
        <h1>🏆 Karma Leaderboard</h1>
        
        <div className="karma-stats">
          <div className="stat-card">
            <h3>{currentUser?.karma || 0}</h3>
            <p>Your Karma Points</p>
            <p className="badge">{getKarmaBadge(currentUser?.karma)}</p>
          </div>
        </div>

        <div className="leaderboard">
          <h2>Top Contributors</h2>
          {users.map((user, index) => (
            <div key={user.id} className="leaderboard-item">
              <span className="rank">#{index + 1}</span>
              <span className="name">{user.username}</span>
              <span className="karma">{user.karma || 0} pts</span>
              <span className="badge">{getKarmaBadge(user.karma)}</span>
            </div>
          ))}
        </div>

        <div className="karma-info">
          <h3>How to Earn Karma</h3>
          <ul>
            <li>+10 points for creating a trip</li>
            <li>+5 points for each person who joins your trip</li>
            <li>Unlock badges as you reach karma milestones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Karma;
