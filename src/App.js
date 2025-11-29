import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange, logoutUser, getUserProfile } from './firebaseUtils';
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
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            ...userProfile
          };
          setCurrentUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
              <Route path="/profile" element={isAuthenticated ? <Profile currentUser={currentUser} /> : <Navigate to="/login" />} />
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
