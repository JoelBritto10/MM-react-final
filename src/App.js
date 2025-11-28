import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import TripChat from './pages/TripChat';
import Karma from './pages/Karma';
import CreateTrip from './pages/CreateTrip';
import EditTrip from './pages/EditTrip';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // Also refresh user from users array to get latest data
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const freshUser = users.find(u => u.id === parsedUser.id);
        if (freshUser) {
          setCurrentUser(freshUser);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing user:', error);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar onLogout={handleLogout} currentUser={currentUser} />}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="/" element={isAuthenticated ? <Home currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/home" element={isAuthenticated ? <Home currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/map" element={isAuthenticated ? <Map currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/chat" element={isAuthenticated ? <Chat currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/trip-chat/:tripId" element={isAuthenticated ? <TripChat currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/karma" element={isAuthenticated ? <Karma currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/create-trip" element={isAuthenticated ? <CreateTrip currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/edit-trip/:id" element={isAuthenticated ? <EditTrip currentUser={currentUser} /> : <Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
