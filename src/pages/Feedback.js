import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

function Feedback({ currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'given', or 'trips'
  const [reviews, setReviews] = useState([]);
  const [tripDetails, setTripDetails] = useState({});
  const [hostedTrips, setHostedTrips] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    loadReviews();
  }, [activeTab, currentUser]);

  const loadReviews = () => {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};

    // Always fetch hosted trips for the "Trips" tab
    const hostTrips = trips
      .filter(trip => trip.hostId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    setHostedTrips(hostTrips);

    if (activeTab === 'received') {
      // Get reviews for trips hosted by current user
      const hostedTripsData = trips.filter(trip => trip.hostId === currentUser.id);
      let receivedReviews = [];
      const tripMap = {};

      hostedTripsData.forEach(trip => {
        tripMap[trip.id] = trip;
        const tripReviews = allReviews[trip.id] || [];
        receivedReviews = [...receivedReviews, ...tripReviews.map(r => ({ ...r, tripId: trip.id }))];
      });

      calculateStats(receivedReviews);
      setReviews(receivedReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setTripDetails(tripMap);
    } else if (activeTab === 'given') {
      // Get reviews given by current user
      let givenReviews = [];
      const tripMap = {};

      Object.keys(allReviews).forEach(tripId => {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          tripMap[tripId] = trip;
          const userReviews = allReviews[tripId].filter(r => r.userId === currentUser.id);
          givenReviews = [...givenReviews, ...userReviews.map(r => ({ ...r, tripId: tripId }))];
        }
      });

      setReviews(givenReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setTripDetails(tripMap);
    }

    setLoading(false);
  };

  const calculateStats = (reviewList) => {
    if (reviewList.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewList.forEach(review => {
      const rating = review.rating;
      distribution[rating]++;
      totalRating += rating;
    });

    const average = (totalRating / reviewList.length).toFixed(1);

    setStats({
      totalReviews: reviewList.length,
      averageRating: parseFloat(average),
      ratingDistribution: distribution
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745'; // Green
    if (rating === 3) return '#ffc107'; // Yellow
    if (rating === 2) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getRatingLabel = (rating) => {
    if (rating === 5) return 'Excellent! 🚀';
    if (rating === 4) return 'Very Good! 😊';
    if (rating === 3) return 'Average 😐';
    if (rating === 2) return 'Bad 😠';
    if (rating === 1) return 'Poor 😞';
    return '';
  };

  const getKarmaChange = (rating) => {
    if (rating >= 4) return '+10 Karma';
    if (rating === 3) return '+5 Karma';
    if (rating === 2) return '0 Karma';
    return '-1 Karma';
  };

  const getReviewCountForTrip = (tripId) => {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    return (allReviews[tripId] || []).length;
  };

  const getAverageRatingForTrip = (tripId) => {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    const tripReviews = allReviews[tripId] || [];
    if (tripReviews.length === 0) return 0;
    const sum = tripReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / tripReviews.length).toFixed(1);
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + (rating < 5 ? '☆'.repeat(5 - rating) : '');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="feedback-container">
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="feedback-container">
        <button onClick={() => navigate('/home')} className="btn-back">← Back</button>

        <div className="feedback-header">
          <h1>📋 Feedback & Ratings</h1>
          <p>View all reviews and ratings for your trips</p>
        </div>

        {/* Tabs */}
        <div className="feedback-tabs">
          <button
            className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            📥 Received ({reviews.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'given' ? 'active' : ''}`}
            onClick={() => setActiveTab('given')}
          >
            📤 Given ({reviews.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            🗺️ Trips ({hostedTrips.length})
          </button>
        </div>

        {/* Statistics Section */}
        {activeTab === 'received' && reviews.length > 0 && (
          <div className="stats-section">
            <div className="stats-card">
              <h3>Overall Rating</h3>
              <div className="rating-display">
                <span className="rating-number">{stats.averageRating}</span>
                <span className="rating-stars">{renderStars(Math.round(stats.averageRating))}</span>
              </div>
              <p className="stats-subtext">Based on {stats.totalReviews} reviews</p>
            </div>

            <div className="stats-card">
              <h3>🏆 Karma Points</h3>
              <div className="rating-display">
                <span className="rating-number" style={{ color: '#667eea' }}>{currentUser?.karma || 0}</span>
                <span className="rating-stars" style={{ fontSize: '14px' }}>Earned from reviews</span>
              </div>
              <p className="stats-subtext">Keep delivering great experiences!</p>
            </div>

            <div className="stats-card">
              <h3>Rating Breakdown</h3>
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution[rating];
                  const percentage = stats.totalReviews > 0 ? ((count / stats.totalReviews) * 100).toFixed(0) : 0;
                  return (
                    <div key={rating} className="distribution-row">
                      <span className="dist-label">
                        {rating} <span className="stars-small">{'⭐'.repeat(rating)}</span>
                      </span>
                      <div className="dist-bar-container">
                        <div
                          className="dist-bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getRatingColor(rating)
                          }}
                        />
                      </div>
                      <span className="dist-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        {reviews.length > 0 && (
          <div className="filter-section">
            <label>Filter by Rating:</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Very Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Bad</option>
              <option value="1">⭐ Poor</option>
            </select>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-section">
          {activeTab === 'trips' ? (
            // Trips Tab Content
            hostedTrips.length > 0 ? (
              <div className="trips-list">
                {hostedTrips.map(trip => {
                  const reviewCount = getReviewCountForTrip(trip.id);
                  const avgRating = getAverageRatingForTrip(trip.id);
                  return (
                    <div key={trip.id} className="trip-card">
                      <div className="trip-card-header">
                        <div className="trip-info">
                          <h3>{trip.title}</h3>
                          <p className="trip-location">📍 {trip.location}</p>
                          <p className="trip-date">
                            📅 {new Date(trip.date || trip.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {trip.time && ` at ${trip.time}`}
                          </p>
                        </div>
                        <div className="trip-stats">
                          {reviewCount > 0 ? (
                            <>
                              <div className="rating-box">
                                <span className="rating-value">{avgRating}</span>
                                <span className="rating-stars">{renderStars(Math.round(avgRating))}</span>
                              </div>
                              <p className="review-count">{reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}</p>
                            </>
                          ) : (
                            <p className="no-reviews">No reviews yet</p>
                          )}
                        </div>
                      </div>

                      <div className="trip-card-body">
                        {trip.description && (
                          <p className="trip-description">{trip.description}</p>
                        )}
                        {trip.category && (
                          <span className="trip-category">
                            {trip.category === 'beach' && '🏖️'}
                            {trip.category === 'mountain' && '⛰️'}
                            {trip.category === 'city' && '🏙️'}
                            {trip.category === 'adventure' && '🎯'}
                            {trip.category === 'culture' && '🎭'}
                            {trip.category === 'sports' && '⚽'}
                            {trip.category === 'all' && '🌍'}
                            {' '}{trip.category}
                          </span>
                        )}
                      </div>

                      <div className="trip-card-footer">
                        <span className="participant-count">
                          👥 {(trip.participants || []).length} {(trip.participants || []).length === 1 ? 'Participant' : 'Participants'}
                        </span>
                        <button
                          className="btn-view-details"
                          onClick={() => navigate(`/trip-chat/${trip.id}`)}
                        >
                          ✓ Validate →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">🗺️</p>
                <h3>No trips created yet</h3>
                <p>Create your first trip to get started and start hosting adventures!</p>
                <button
                  onClick={() => navigate('/create-trip')}
                  className="btn btn-primary"
                >
                  Create a Trip
                </button>
              </div>
            )
          ) : filteredReviews.length > 0 ? (
            <div className="reviews-list">
              {filteredReviews.map(review => {
                const trip = tripDetails[review.tripId];
                return (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-user-info">
                        <div className="user-avatar">{review.username.charAt(0).toUpperCase()}</div>
                        <div>
                          <h4>{review.username}</h4>
                          <p className="review-timestamp">
                            {new Date(review.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="review-rating" style={{ color: getRatingColor(review.rating) }}>
                        <span className="rating-stars-large">{'⭐'.repeat(review.rating)}</span>
                        <p className="rating-label">{getRatingLabel(review.rating)}</p>
                        <p className="karma-badge">{getKarmaChange(review.rating)}</p>
                      </div>
                    </div>

                    <div className="review-trip-info">
                      <span className="trip-title">📍 {trip?.title || 'Trip'}</span>
                      <span className="trip-location">{trip?.location}</span>
                    </div>

                    {review.comment && (
                      <div className="review-comment">
                        <p>"{review.comment}"</p>
                      </div>
                    )}

                    {activeTab === 'given' && (
                      <button
                        className="btn-edit-review"
                        onClick={() => setSelectedTrip(review.tripId)}
                      >
                        View Trip →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-icon">
                {activeTab === 'received' ? '📭' : '✍️'}
              </p>
              <h3>
                {activeTab === 'received'
                  ? 'No reviews received yet'
                  : 'No reviews given yet'}
              </h3>
              <p>
                {activeTab === 'received'
                  ? 'Once participants complete your trips, they can leave reviews and ratings.'
                  : 'After you complete trips, you can leave reviews and ratings for the hosts.'}
              </p>
              <button
                onClick={() => navigate('/home')}
                className="btn btn-primary"
              >
                {activeTab === 'received' ? 'Create a Trip' : 'Find Trips'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
