import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getUserProfile, sendPasswordReset } from '../firebaseUtils';
import './Auth.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login with Firebase
      const firebaseUser = await loginUser(email, password);
      
      // Get user profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        username: userProfile?.username || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        karma: userProfile?.karma || 0,
        ...(userProfile || {})
      };

      // Login successful
      onLogin(userData);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Email not found. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    setError('');

    try {
      await sendPasswordReset(resetEmail);
      setResetMessage('✅ Password reset link sent! Check your email (including spam folder). The link expires in 1 hour.');
      setResetEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 4000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
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
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="forgot-password-btn"
        >
          🔑 Forgot Password?
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetMessage('');
                  setError('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {resetMessage && <div className="alert alert-success">{resetMessage}</div>}
              {error && <div className="alert alert-error">{error}</div>}
              <p className="modal-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetMessage('');
                      setError('');
                      setResetEmail('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
