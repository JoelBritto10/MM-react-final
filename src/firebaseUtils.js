import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

// ============= AUTHENTICATION =============

export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with username
    await updateProfile(user, { displayName: username });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
      uid: user.uid,
      createdAt: new Date().toISOString(),
      karma: 0
    });
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const sendPasswordReset = async (email) => {
  try {
    // Verify user exists first
    // This is done implicitly by Firebase when sending reset email
    
    // Send password reset email with custom action URL
    const resetLink = `${window.location.origin}/reset-password`;
    
    await sendPasswordResetEmail(auth, email, {
      url: resetLink,
      handleCodeInApp: true
    });
    
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // More specific error handling
    if (error.code === 'auth/user-not-found') {
      throw new Error('This email is not registered. Please sign up first.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many reset requests. Please try again in a few minutes.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Password reset is currently disabled. Please contact support.');
    } else if (error.message && (error.message.includes('CONFIGURATION_NOT_FOUND') || error.message.includes('configured'))) {
      throw new Error('Email service is not configured. Please contact support.');
    } else {
      throw error;
    }
  }
};

// ============= USER PROFILE =============

export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ============= TRIPS =============

export const createTrip = async (tripData) => {
  try {
    console.log('📝 Attempting to create trip in Firestore...', tripData);
    
    const tripsCollection = collection(db, 'trips');
    
    // Prepare trip data with defaults
    const dataToSave = {
      ...tripData,
      participants: tripData.participants || [],
      createdAt: tripData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Data to save:', dataToSave);

    const docRef = await addDoc(tripsCollection, dataToSave);
    
    console.log('✅ Trip created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating trip:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(`Failed to create trip: ${error.message}`);
  }
};

export const getTrips = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'trips'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
};

export const getTrip = async (tripId) => {
  try {
    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`Trip ${tripId} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error getting trip:', error);
    return null;
  }
};

export const getUserTrips = async (userId) => {
  try {
    const q = query(collection(db, 'trips'), where('hostId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user trips:', error);
    return [];
  }
};

export const updateTrip = async (tripId, data) => {
  try {
    if (!tripId) {
      throw new Error('Trip ID is missing or invalid');
    }

    // First check if the trip exists
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    if (!tripDoc.exists()) {
      console.warn(`Trip ${tripId} does not exist in Firestore`);
      throw new Error(`Trip ${tripId} not found`);
    }

    await updateDoc(doc(db, 'trips', tripId), data);
    console.log(`✅ Trip ${tripId} updated successfully`);
    return true;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    // Delete all messages associated with this trip from localStorage
    const tripMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    if (tripMessages[tripId]) {
      delete tripMessages[tripId];
      localStorage.setItem('tripMessages', JSON.stringify(tripMessages));
      console.log(`✅ Deleted chat messages for trip ${tripId}`);
    }

    // Delete the trip from Firestore
    await deleteDoc(doc(db, 'trips', tripId));
    console.log(`✅ Trip ${tripId} deleted from Firestore`);
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const subscribeToTrips = (callback) => {
  return onSnapshot(collection(db, 'trips'), (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter out any trips that might be invalid
    const validTrips = trips.filter(trip => trip.id && trip.title);
    callback(validTrips);
  });
};

// ============= IMAGE STORAGE =============

export const uploadUserImage = async (userId, imageData, imageType) => {
  try {
    // Convert base64 data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${imageType}-${timestamp}.jpg`;
    const storageRef = ref(storage, `user-images/${userId}/${fileName}`);
    
    // Upload blob to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000'
    });
    
    // Get download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    console.log('✅ User image uploaded:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading user image:', error);
    throw error;
  }
};

export const uploadTripImage = async (userId, imageData, tripName) => {
  try {
    console.log('📤 Processing trip image...');
    
    // Validate inputs
    if (!imageData || !userId) {
      console.warn('Missing imageData or userId, skipping image upload');
      return null;
    }
    
    // Return the base64 data directly - Firestore will store it
    // This avoids CORS issues with Firebase Storage
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      console.log('✅ Using base64 image data directly (avoiding Storage CORS)');
      return imageData; // Return base64 string to be stored in Firestore
    }
    
    // If it's a File object, convert to base64
    if (imageData instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ File converted to base64');
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageData);
      });
    }
    
    console.warn('Unable to process image, skipping');
    return null;
  } catch (error) {
    console.error('❌ Error processing trip image:', error.message);
    return null;
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// ============= DOCUMENT UPLOAD =============

export const uploadTripDocument = async (userId, documentData, fileName) => {
  try {
    console.log('📄 Processing trip document...');
    
    // Validate inputs
    if (!documentData || !userId || !fileName) {
      console.warn('Missing documentData, userId, or fileName, skipping document upload');
      return null;
    }
    
    // Return the base64 data directly - Firestore will store it
    if (typeof documentData === 'string' && documentData.startsWith('data:')) {
      console.log('✅ Using base64 document data directly');
      return {
        data: documentData,
        fileName: fileName,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId
      };
    }
    
    // If it's a File object, convert to base64
    if (documentData instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ File converted to base64');
          resolve({
            data: reader.result,
            fileName: fileName,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(documentData);
      });
    }
    
    console.warn('Unable to process document, skipping');
    return null;
  } catch (error) {
    console.error('❌ Error processing trip document:', error.message);
    return null;
  }
};

// ============= MESSAGES/CHAT =============

export const sendMessage = async (conversationId, messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      ...messageData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (conversationId, callback) => {
  return onSnapshot(collection(db, 'conversations', conversationId, 'messages'), (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// ============= REVIEWS/RATINGS =============

export const addReview = async (tripId, reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'trips', tripId, 'reviews'), {
      ...reviewData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviews = async (tripId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'trips', tripId, 'reviews'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting reviews:', error);
    return [];
  }
};

// ============= KARMA =============

export const updateUserKarma = async (userId, karmaPoints) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const currentKarma = userSnap.data()?.karma || 0;
    
    await updateDoc(userRef, {
      karma: currentKarma + karmaPoints
    });
    return true;
  } catch (error) {
    console.error('Error updating karma:', error);
    throw error;
  }
};

export const getUserKarma = async (userId) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    return userSnap.data()?.karma || 0;
  } catch (error) {
    console.error('Error getting user karma:', error);
    return 0;
  }
};

// ============= SEND EMAILS =============

export const sendTripJoinConfirmation = async (userEmail, userName, tripTitle, tripLocation, tripDate, hostName) => {
  try {
    // Send a confirmation email using a backend service or Firebase Cloud Functions
    // For now, we'll log it and you can integrate with your email service
    console.log('📧 Sending trip join confirmation email to:', userEmail);
    console.log('Trip:', tripTitle, 'Location:', tripLocation, 'Date:', tripDate);
    
    // Since we don't have direct email sending in the frontend, 
    // you'll need to set up Firebase Cloud Functions or a backend API
    // This is a placeholder for email notification
    
    // Store notification in Firestore for reference
    await addDoc(collection(db, 'notifications'), {
      type: 'trip_join_confirmation',
      userEmail: userEmail,
      userName: userName,
      tripTitle: tripTitle,
      tripLocation: tripLocation,
      tripDate: tripDate,
      hostName: hostName,
      createdAt: new Date().toISOString(),
      read: false
    });
    
    console.log('✅ Trip join confirmation notification created');
    return true;
  } catch (error) {
    console.error('Error creating trip join notification:', error);
    // Don't throw - notification failure shouldn't block trip joining
    return false;
  }
};

// ============= MIGRATION UTILITIES =============

/**
 * Migrate old trips from localStorage to Firestore
 * This is a one-time migration function
 */
// All trips are now stored in Firebase Firestore
// Migration function kept for compatibility but no longer needed
export const migrateLocalStorageTripsToFirebase = async () => {
  console.log('✅ All data is stored in Firebase Firestore');
  return 0;
};

// Remove duplicate trips from Firebase
export const removeDuplicateTrips = async () => {
  try {
    console.log('🔄 Checking for duplicate trips...');
    
    // Get all trips
    const querySnapshot = await getDocs(collection(db, 'trips'));
    const allTrips = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (allTrips.length === 0) {
      console.log('✅ No trips to deduplicate');
      return;
    }

    // Create a map to track duplicates by title, location, date, and hostId
    const tripMap = {};
    const duplicatesToDelete = [];
    
    for (const trip of allTrips) {
      const tripKey = `${trip.title}|${trip.location}|${trip.date}|${trip.hostId}`;
      
      if (tripMap[tripKey]) {
        // This is a duplicate - mark for deletion
        duplicatesToDelete.push(trip.id);
        console.log(`⚠️  Found duplicate: "${trip.title}" - will delete ID: ${trip.id}`);
      } else {
        // First occurrence - keep this one
        tripMap[tripKey] = trip.id;
      }
    }

    // Delete duplicate trips
    let deletedCount = 0;
    for (const tripId of duplicatesToDelete) {
      await deleteDoc(doc(db, 'trips', tripId));
      deletedCount++;
      console.log(`✅ Deleted duplicate trip: ${tripId}`);
    }

    console.log(`✅ Deduplication complete! Removed ${deletedCount} duplicate trip(s)`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    throw error;
  }
};

// Export db for use in other components
export { db, auth, storage };
