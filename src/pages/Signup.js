import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, getUserProfile } from '../firebaseUtils';
import './Auth.css';

function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Try Firebase first
      try {
        console.log('Attempting to create user in Firebase...');
        const firebaseUser = await registerUser(formData.email, formData.password, formData.username);
        console.log('✅ User created in Firebase:', firebaseUser.uid);

        // Get user profile from Firestore (should exist now after registerUser creates it)
        const userProfile = await getUserProfile(firebaseUser.uid);

        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: formData.username,
          karma: 0,
          ...(userProfile || {})
        };

        // Login and redirect
        onLogin(userData);
        setError('');
        navigate('/home');
      } catch (firebaseError) {
        console.error('Firebase signup error:', firebaseError.code, firebaseError.message);
        
        // Only fallback to localStorage for specific errors
        if (firebaseError.code === 'auth/operation-not-allowed' || 
            firebaseError.code === 'auth/network-request-failed') {
          console.warn('Firebase unavailable. Using localStorage fallback.');
          
          // Fallback to localStorage
          const users = JSON.parse(localStorage.getItem('users')) || [];
          
          // Check if email already exists
          if (users.find(u => u.email === formData.email)) {
            setError('Email already registered');
            setLoading(false);
            return;
          }
          
          // Create new user
          const newUser = {
            id: Date.now().toString(),
            username: formData.username,
            email: formData.email,
            password: formData.password,
            karma: 0,
            createdAt: new Date().toISOString(),
            firebaseSync: false // Mark as not synced to Firebase
          };
          
          // Save user
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          console.log('ℹ️ User saved to localStorage (Firebase unavailable)');
          
          // Login and redirect
          onLogin(newUser);
          setError('');
          navigate('/home');
        } else {
          // For other errors, throw them so they get caught below
          throw firebaseError;
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('✅ Email already registered in Firebase');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid Firebase credentials. Check your .env.local file and restart the app.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('⚠️ Email/Password auth not enabled in Firebase. Please enable it in Firebase Console → Authentication → Sign-in method');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🗺️ MapMates</h1>
        <h2>Sign Up</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
