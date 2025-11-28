import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripReview.css';

function TripReview({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load trip
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const currentTrip = trips.find(t => t.id === tripId);

    if (!currentTrip) {
      setError('Trip not found');
      setLoading(false);
      return;
    }

    // Check if user is a participant
    const isParticipant = currentTrip.participants && currentTrip.participants.includes(currentUser.id);
    const isHost = currentTrip.hostId === currentUser.id;

    if (isHost) {
      setError('As the host, you cannot rate your own trip');
      setLoading(false);
      return;
    }

    if (!isParticipant) {
      setError('You did not join this trip');
      setLoading(false);
      return;
    }

    // Check if user already reviewed this trip
    const reviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    const tripReviews = reviews[tripId] || [];
    const userReview = tripReviews.find(r => r.userId === currentUser.id);

    if (userReview) {
      setSubmitted(true);
    }

    setTrip(currentTrip);
    setLoading(false);
  }, [tripId, currentUser]);

  const handleSubmitReview = () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    // Load reviews
    const reviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    if (!reviews[tripId]) {
      reviews[tripId] = [];
    }

    // Create review object
    const review = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      tripId: tripId,
      rating: rating,
      comment: comment,
      timestamp: new Date().toISOString()
    };

    // Add review
    reviews[tripId].push(review);
    localStorage.setItem('tripReviews', JSON.stringify(reviews));

    // Calculate karma points for host based on rating
    let karmaPoints = 0;
    if (rating >= 4) {
      karmaPoints = 10; // Excellent (4-5 stars)
    } else if (rating === 3) {
      karmaPoints = 5;  // Average (3 stars)
    } else if (rating === 2) {
      karmaPoints = 0;  // Bad (2 stars) - No points
    } else {
      karmaPoints = -1; // Poor (1 star) - Host loses 1 point
    }

    // Update host's karma
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u => {
      if (u.id === trip.hostId) {
        return {
          ...u,
          karma: (u.karma || 0) + karmaPoints
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user if needed
    if (currentUser.id === trip.hostId) {
      const updatedCurrentUser = {
        ...currentUser,
        karma: (currentUser.karma || 0) + karmaPoints
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }

    setSubmitted(true);
    setTimeout(() => navigate('/home'), 2000);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="review-container card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="review-container card">
          <h1>Error</h1>
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/home')} className="btn btn-primary">
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="review-container card">
          <div className="success-message">
            <h1>✅ Review Submitted!</h1>
            <p>Thank you for your feedback. The host has earned karma points!</p>
            <p>Redirecting back to trips...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="review-container card">
        <button onClick={() => navigate('/home')} className="btn-back">← Back</button>

        <h1>Rate Your Experience</h1>
        <div className="trip-review-info">
          <h2>{trip?.title}</h2>
          <p>📍 {trip?.location}</p>
          <p>Hosted by <strong>{trip?.hostName}</strong></p>
        </div>

        <div className="review-section">
          <h3>How would you rate this trip?</h3>
          
          <div className="rating-options">
            {/* Excellent (4-5 stars) = 10 points */}
            <div className="rating-option">
              <input
                type="radio"
                id="excellent"
                name="rating"
                value="5"
                checked={rating === 5}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <label htmlFor="excellent" className="excellent">
                <span className="stars">⭐⭐⭐⭐⭐</span>
                <span className="label-text">Excellent! 🚀 (+10 Karma Points)</span>
              </label>
            </div>

            <div className="rating-option">
              <input
                type="radio"
                id="very-good"
                name="rating"
                value="4"
                checked={rating === 4}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <label htmlFor="very-good" className="very-good">
                <span className="stars">⭐⭐⭐⭐</span>
                <span className="label-text">Very Good! 😊 (+10 Karma Points)</span>
              </label>
            </div>

            {/* Average (3 stars) = 5 points */}
            <div className="rating-option">
              <input
                type="radio"
                id="average"
                name="rating"
                value="3"
                checked={rating === 3}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <label htmlFor="average" className="average">
                <span className="stars">⭐⭐⭐</span>
                <span className="label-text">Average 😐 (+5 Karma Points)</span>
              </label>
            </div>

            <div className="rating-option">
              <input
                type="radio"
                id="poor"
                name="rating"
                value="1"
                checked={rating === 1}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <label htmlFor="poor" className="poor">
                <span className="stars">⭐</span>
                <span className="label-text">Poor 😞 (-1 Karma Point)</span>
              </label>
            </div>

            <div className="rating-option">
              <input
                type="radio"
                id="bad"
                name="rating"
                value="2"
                checked={rating === 2}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <label htmlFor="bad" className="bad">
                <span className="stars">⭐⭐</span>
                <span className="label-text">Bad 😠 (0 Karma Points)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="comment-section">
          <h3>Add a comment (optional)</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience about this trip..."
            maxLength="500"
            className="review-textarea"
          />
          <span className="char-count">{comment.length}/500</span>
        </div>

        <div className="review-actions">
          <button 
            onClick={handleSubmitReview}
            className="btn btn-primary"
            disabled={!rating}
          >
            Submit Review
          </button>
          <button 
            onClick={() => navigate('/home')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TripReview;
