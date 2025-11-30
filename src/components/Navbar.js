import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/home" className="nav-logo">
          🗺️ MapMates
        </Link>
        <div className="nav-menu">
          <Link to="/home" className="nav-link">Trips</Link>
          <Link to="/explore" className="nav-link">🔍 Explore</Link>
          <Link to="/suggestions" className="nav-link">🤖 Suggestions</Link>
          <Link to="/chat" className="nav-link">Messages</Link>
          <Link to="/karma" className="nav-link">Karma</Link>
          <Link to="/feedback" className="nav-link">📋 Feedback</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
