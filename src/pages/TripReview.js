import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseUtils';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import StarRating from '../components/StarRating';
import HostReplySection from '../components/HostReplySection';
import { analyzeSentiment, getSentimentEmoji, getSentimentColor } from '../utils/sentimentAnalyzer';
import { saveReviewToLocalStorage } from '../utils/reviewStorage';
import './TripReview.css';

function TripReview({ currentUser }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostReviews, setHostReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load trip data and fetch host reviews
  useEffect(() => {
    const loadTripData = async () => {
      try {
        // Load trip from localStorage
        const trips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
        const currentTrip = trips.find(t => t.id === tripId);

        if (!currentTrip) {
          setError('Trip not found');
          setLoading(false);
          return;
        }

        // Check if trip is completed
        const tripDate = new Date(currentTrip.date);
        const today = new Date();
        if (tripDate >= today) {
          setError('This trip is not yet completed. You can only review completed trips.');
          setLoading(false);
          return;
        }

        // Check if user is a participant
        const isParticipant = currentTrip.participants && currentTrip.participants.includes(currentUser?.id || currentUser?.uid);
        const isHost = currentTrip.hostId === (currentUser?.id || currentUser?.uid);

        if (isHost) {
          setError('As the host, you cannot review your own trip');
          setLoading(false);
          return;
        }

        if (!isParticipant) {
          setError('You did not join this trip');
          setLoading(false);
          return;
        }

        setTrip(currentTrip);
        setHostId(currentTrip.hostId);

        // Fetch host reviews from Firestore
        await fetchHostReviews(currentTrip.hostId);

        // Check if user already reviewed this trip
        await checkUserReview(tripId, currentUser?.id || currentUser?.uid);

        setLoading(false);
      } catch (err) {
        console.error('Error loading trip:', err);
        setError('Error loading trip data');
        setLoading(false);
      }
    };

    loadTripData();
  }, [tripId, currentUser]);

  const fetchHostReviews = async (currentHostId) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('hostId', '==', currentHostId)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const reviews = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setHostReviews(reviews);
    } catch (err) {
      console.error('Error fetching host reviews:', err);
    }
  };

  const checkUserReview = async (currentTripId, userId) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('tripId', '==', currentTripId),
        where('reviewerId', '==', userId)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      setUserHasReviewed(querySnapshot.docs.length > 0);
    } catch (err) {
      console.error('Error checking user review:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please add a comment');
      return;
    }

    setSubmitting(true);
    try {
      // Analyze sentiment
      const sentiment = analyzeSentiment(comment);

      const reviewData = {
        tripId: tripId,
        hostId: hostId,
        reviewerId: currentUser?.id || currentUser?.uid,
        reviewerName: currentUser?.username || currentUser?.displayName || 'Anonymous',
        reviewerAvatar: currentUser?.avatar || '',
        rating: rating,
        comment: comment.trim(),
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      // Save to localStorage as backup
      saveReviewToLocalStorage({
        ...reviewData,
        id: Date.now().toString()
      });

      // Refresh the host reviews list immediately
      await fetchHostReviews(hostId);
      
      // Update user review status
      setUserHasReviewed(true);
      
      // Reset form
      setRating(0);
      setComment('');
      setSubmitting(false);

      // Show success message briefly before refreshing
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        // Don't navigate away - stay on page to show updated reviews
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
      setSubmitting(false);
    }
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
          <h1>⚠️ Cannot Review</h1>
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
            <p>Thank you for your feedback. Your review is now visible below!</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>Updating reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="review-container card">
        <button onClick={() => navigate('/home')} className="btn-back">← Back</button>

        <h1>⭐ Review Your Trip Experience</h1>

        {/* Trip Card Display Section */}
        <div className="trip-card-section">
          <h2 className="section-title">📍 Trip Details</h2>
          <div className="trip-card-display">
            {trip?.image && (
              <div 
                className="trip-card-image"
                style={{ backgroundImage: `url('${trip.image}')` }}
              />
            )}
            <div className="trip-card-content">
              <h3 className="trip-title">{trip?.title}</h3>
              <p className="trip-category">
                {trip?.category && `${trip.category} 🎯`}
              </p>
              <p className="trip-location">📍 {trip?.location}</p>
              <p className="trip-date">
                📅 {trip?.date && new Date(trip.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="trip-description">{trip?.description}</p>
              <div className="trip-host-section">
                <span className="host-label">🏠 Hosted by</span>
                <span className="host-name"><strong>{trip?.hostName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form Section */}
        {!userHasReviewed ? (
          <div className="review-form-section">
            <h2 className="section-title">⭐ Rate the Host & Trip</h2>
            
            <div className="review-section">
              <h3>How would you rate this trip?</h3>
              <StarRating value={rating} onChange={setRating} size="large" />
            </div>

            <div className="comment-section">
              <h3>Your Feedback (Required)</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Share your experience about this trip, the host's organization, and what you enjoyed..."
                maxLength="500"
                className="review-textarea"
              />
              <span className="char-count">{comment.length}/500</span>
            </div>

            <div className="review-actions">
              <button 
                onClick={handleSubmitReview}
                className="btn btn-primary"
                disabled={!rating || !comment.trim() || submitting}
              >
                {submitting ? '⏳ Submitting...' : '✅ Submit Review'}
              </button>
              <button 
                onClick={() => navigate('/home')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="already-reviewed">
            <p>✅ You have already reviewed this trip!</p>
          </div>
        )}

        {/* Host Reviews Section */}
        {hostReviews.length > 0 && (
          <div className="host-reviews-section">
            <h2 className="section-title">📊 Reviews for {trip?.hostName}</h2>
            <div className="reviews-list">
              {hostReviews.map(review => (
                <div key={review.id} className="review-card amazon-style-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      {review.reviewerAvatar ? (
                        <img src={review.reviewerAvatar} alt={review.reviewerName} className="reviewer-avatar" />
                      ) : (
                        <div className="reviewer-avatar-placeholder">
                          {review.reviewerName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">{review.reviewerName}</h4>
                        <p className="review-date">
                          {review.timestamp ? new Date(review.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="review-rating-section">
                      <StarRating value={review.rating} readOnly={true} size="small" />
                      {review.sentiment && (
                        <span 
                          className="sentiment-badge"
                          style={{ backgroundColor: getSentimentColor(review.sentiment) }}
                        >
                          {getSentimentEmoji(review.sentiment)} {review.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                  
                  {/* Host Reply Section */}
                  <HostReplySection 
                    review={review}
                    hostId={hostId}
                    currentUser={currentUser}
                    isHost={trip?.hostId === (currentUser?.id || currentUser?.uid)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripReview;
