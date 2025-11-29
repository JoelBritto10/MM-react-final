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
import TripReview from './pages/TripReview';
import Feedback from './pages/Feedback';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session on app load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
          <>
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
              <Route path="/" element={isAuthenticated ? <Home currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/home" element={isAuthenticated ? <Home currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/map" element={isAuthenticated ? <Map currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isAuthenticated ? <Profile currentUser={currentUser} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} />
              <Route path="/chat" element={isAuthenticated ? <Chat currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/trip-chat/:tripId" element={isAuthenticated ? <TripChat currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/karma" element={isAuthenticated ? <Karma currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/feedback" element={isAuthenticated ? <Feedback currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/create-trip" element={isAuthenticated ? <CreateTrip currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/edit-trip/:id" element={isAuthenticated ? <EditTrip currentUser={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/trip-review/:tripId" element={isAuthenticated ? <TripReview currentUser={currentUser} /> : <Navigate to="/login" />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
