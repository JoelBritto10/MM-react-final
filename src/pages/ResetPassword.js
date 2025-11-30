import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';
import './Auth.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [oobCode, setOobCode] = useState('');

  // Extract the reset code from URL on component mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    
    if (!code) {
      setError('Invalid or expired reset link. Please request a new one.');
      setVerifying(false);
      return;
    }

    // Verify the code is valid
    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setVerifying(false);
      })
      .catch((err) => {
        console.error('Code verification error:', err);
        setError('Invalid or expired reset link. Please request a new password reset.');
        setVerifying(false);
      });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Confirm the password reset with Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      setSuccess('✅ Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/expired-action-code') {
        setError('Reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Invalid reset link. Please request a new one.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🗺️ MapMates</h1>
          <h2>Reset Password</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !oobCode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🗺️ MapMates</h1>
          <h2>Reset Password</h2>
          <div className="alert alert-error">{error}</div>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🗺️ MapMates</h1>
        <h2>Reset Password</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          🔒 Your password will be securely updated in Firebase
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
