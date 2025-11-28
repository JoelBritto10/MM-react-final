// Utility to clear corrupted or oversized localStorage data
export const clearStorageQuotaIssues = () => {
  try {
    // Clear the localStorage completely to start fresh
    const backup = {
      users: localStorage.getItem('users'),
      trips: localStorage.getItem('trips')
    };

    console.log('Current storage state backed up');
    
    // Try to clear problematic data
    try {
      localStorage.removeItem('users');
      localStorage.removeItem('trips');
      console.log('Cleared old storage data');
    } catch (e) {
      console.error('Could not clear storage:', e);
    }

    return backup;
  } catch (error) {
    console.error('Error in clearStorageQuotaIssues:', error);
  }
};

// Compress all images in trips
export const compressAllTripImages = () => {
  try {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    // Note: This should be implemented when trips are fetched, not here
    return trips;
  } catch (error) {
    console.error('Error compressing trip images:', error);
  }
};
