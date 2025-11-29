import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getUserProfile } from '../firebaseUtils';
import './Auth.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try Firebase first
      try {
        console.log('Attempting to login with Firebase...');
        const firebaseUser = await loginUser(email, password);
        console.log('✅ Logged in to Firebase:', firebaseUser.uid);

        // Get user profile from Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);

        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: userProfile?.username || 'User',
          ...userProfile
        };

        // Login successful
        onLogin(userData);
        setError('');
        navigate('/home');
      } catch (firebaseError) {
        console.error('Firebase login error:', firebaseError.code, firebaseError.message);
        
        // Try localStorage fallback for specific errors
        if (firebaseError.code === 'auth/operation-not-allowed' || 
            firebaseError.code === 'auth/network-request-failed') {
          console.warn('Firebase unavailable. Attempting localStorage fallback...');
          
          // Fallback to localStorage
          const users = JSON.parse(localStorage.getItem('users')) || [];
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            console.log('✅ Logged in from localStorage');
            onLogin(user);
            setError('');
            navigate('/home');
            return;
          }
        }
        
        // If fallback didn't work, throw the original error
        throw firebaseError;
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Email not found. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you haven\'t signed up yet, please sign up first.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('⚠️ Email/Password auth not enabled in Firebase. Please enable it in Firebase Console → Authentication → Sign-in method');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🗺️ MapMates</h1>
        <h2>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
