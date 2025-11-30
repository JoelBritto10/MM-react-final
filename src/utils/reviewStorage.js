// All reviews are now stored in Firebase Firestore
// These functions are kept for compatibility but no longer use localStorage

export const saveReviewToLocalStorage = (review) => {
  // Reviews are stored in Firebase Firestore via firebaseUtils.js
  console.log('Review stored in Firebase:', review.tripId);
  return true;
};

export const getAllReviewsFromLocalStorage = () => {
  // All reviews are now in Firebase Firestore
  return {};
};

export const getReviewsForTrip = (tripId) => {
  // Reviews are retrieved from Firebase Firestore
  return [];
};

export const getReviewsForHost = (hostId, trips) => {
  // Reviews are retrieved from Firebase Firestore
  return [];
};

export const getReviewsByUser = (userId) => {
  // Reviews are retrieved from Firebase Firestore
  return [];
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
