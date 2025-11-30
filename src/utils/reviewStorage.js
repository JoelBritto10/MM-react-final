// localStorage backup for reviews
// Keeps a local copy of all reviews for offline access and backup

export const saveReviewToLocalStorage = (review) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    
    if (!allReviews[review.tripId]) {
      allReviews[review.tripId] = [];
    }

    // Add review with localStorage timestamp if not from Firestore
    const reviewData = {
      ...review,
      localTimestamp: new Date().toISOString(),
      synced: true
    };

    allReviews[review.tripId].push(reviewData);
    localStorage.setItem('tripReviews', JSON.stringify(allReviews));

    return true;
  } catch (err) {
    console.error('Error saving review to localStorage:', err);
    return false;
  }
};

export const getAllReviewsFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('tripReviews')) || {};
  } catch (err) {
    console.error('Error retrieving reviews from localStorage:', err);
    return {};
  }
};

export const getReviewsForTrip = (tripId) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    return allReviews[tripId] || [];
  } catch (err) {
    console.error('Error retrieving trip reviews:', err);
    return [];
  }
};

export const getReviewsForHost = (hostId, trips) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    const hostedTripIds = trips
      .filter(trip => trip.hostId === hostId)
      .map(trip => trip.id);

    let hostReviews = [];
    hostedTripIds.forEach(tripId => {
      hostReviews = [...hostReviews, ...(allReviews[tripId] || [])];
    });

    return hostReviews;
  } catch (err) {
    console.error('Error retrieving host reviews:', err);
    return [];
  }
};

export const getReviewsByUser = (userId) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem('tripReviews')) || {};
    let userReviews = [];

    Object.values(allReviews).forEach(tripReviews => {
      const userTripsReviews = tripReviews.filter(r => r.userId === userId);
      userReviews = [...userReviews, ...userTripsReviews];
    });

    return userReviews;
  } catch (err) {
    console.error('Error retrieving user reviews:', err);
    return [];
  }
};

export const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(review => {
    const rating = review.rating;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  return distribution;
};

export const calculateReviewStats = (reviews) => {
  return {
    totalReviews: reviews.length,
    averageRating: calculateAverageRating(reviews),
    ratingDistribution: getRatingDistribution(reviews)
  };
};
