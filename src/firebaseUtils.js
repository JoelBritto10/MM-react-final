import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

// ============= AUTHENTICATION =============

export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username,
      email,
      karma: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
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
    console.warn('User profile not found or error accessing Firestore:', error.message);
    return null; // Return null instead of throwing - user may not have profile yet
  }
};

export const updateUserProfile = async (uid, profileData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...profileData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ============= TRIPS =============

export const createTrip = async (tripData) => {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const getTrips = async () => {
  try {
    const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error getting trips:', error);
    throw error;
  }
};

export const getTrip = async (tripId) => {
  try {
    const docSnap = await getDoc(doc(db, 'trips', tripId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting trip:', error);
    throw error;
  }
};

export const updateTrip = async (tripId, tripData) => {
  try {
    await updateDoc(doc(db, 'trips', tripId), {
      ...tripData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, 'trips', tripId));
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const getUserTrips = async (userId) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error getting user trips:', error);
    throw error;
  }
};

// ============= REVIEWS & KARMA =============

export const createReview = async (tripId, reviewData) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      tripId,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getTripReviews = async (tripId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('tripId', '==', tripId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
  } catch (error) {
    console.error('Error getting trip reviews:', error);
    throw error;
  }
};

export const getUserReviews = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('reviewedUserId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw error;
  }
};

// ============= MESSAGES & CHAT =============

export const sendMessage = async (tripId, messageData) => {
  try {
    const docRef = await addDoc(collection(db, `trips/${tripId}/messages`), {
      ...messageData,
      timestamp: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getTripMessages = async (tripId) => {
  try {
    const q = query(
      collection(db, `trips/${tripId}/messages`),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (error) {
    console.error('Error getting trip messages:', error);
    throw error;
  }
};

// ============= TRIP PARTICIPANTS =============

export const joinTrip = async (tripId, userId, userName) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);

    if (tripSnap.exists()) {
      const tripData = tripSnap.data();
      const participants = tripData.participants || [];

      // Check if user already joined
      if (participants.some(p => p.id === userId)) {
        throw new Error('User already joined this trip');
      }

      // Check if trip is full
      if (tripData.maxCount && participants.length >= tripData.maxCount) {
        throw new Error('Trip is full');
      }

      // Add participant
      participants.push({ id: userId, name: userName });
      await updateTrip(tripId, { participants });
    }
  } catch (error) {
    console.error('Error joining trip:', error);
    throw error;
  }
};

export const leaveTrip = async (tripId, userId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);

    if (tripSnap.exists()) {
      const tripData = tripSnap.data();
      const participants = (tripData.participants || []).filter(p => p.id !== userId);
      await updateTrip(tripId, { participants });
    }
  } catch (error) {
    console.error('Error leaving trip:', error);
    throw error;
  }
};

// ============= IMAGE STORAGE (Firebase Storage & Firestore) =============

/**
 * Upload user profile image to Firebase Storage and save URL to Firestore
 * @param {string} uid - User ID
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} imageType - 'profile' or 'background'
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadUserImage = async (uid, base64Image, imageType = 'profile') => {
  try {
    if (!uid) throw new Error('User ID is required');
    if (!base64Image) throw new Error('Image data is required');

    // Create a reference to the image file in Storage
    const timestamp = Date.now();
    const fileName = `${uid}/${imageType}-${timestamp}.jpg`;
    const imageRef = ref(storage, `user-images/${fileName}`);

    console.log(`📤 Uploading ${imageType} image to Firebase Storage...`);

    // Upload the image as base64 string
    await uploadString(imageRef, base64Image, 'data_url');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`✅ Image uploaded successfully: ${downloadURL}`);

    // Save the image URL to Firestore user profile
    const updateData = {};
    updateData[`${imageType}Image`] = downloadURL;
    updateData[`${imageType}ImagePath`] = fileName; // Store path for deletion purposes

    await updateUserProfile(uid, updateData);
    console.log(`✅ Image URL saved to Firestore`);

    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${imageType} image:`, error);
    throw error;
  }
};

/**
 * Upload trip image to Firebase Storage and save URL to Firestore
 * @param {string} tripId - Trip ID
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} userId - User ID (for organizing in storage)
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadTripImage = async (tripId, base64Image, userId) => {
  try {
    if (!tripId || !base64Image || !userId) {
      throw new Error('Trip ID, image data, and User ID are required');
    }

    // Create a reference to the image file
    const timestamp = Date.now();
    const fileName = `${tripId}-${timestamp}.jpg`;
    const imageRef = ref(storage, `trip-images/${userId}/${fileName}`);

    console.log(`📤 Uploading trip image to Firebase Storage...`);

    // Upload the image
    await uploadString(imageRef, base64Image, 'data_url');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    console.log(`✅ Trip image uploaded successfully: ${downloadURL}`);

    // Update trip with image URL in Firestore
    await updateTrip(tripId, {
      tripImage: downloadURL,
      tripImagePath: fileName, // Store path for deletion purposes
    });
    console.log(`✅ Trip image URL saved to Firestore`);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading trip image:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} imagePath - Path to the image in storage
 * @returns {Promise<void>}
 */
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) return;
    
    const imageRef = ref(storage, `user-images/${imagePath}`);
    await deleteObject(imageRef);
    console.log(`✅ Image deleted from Firebase Storage`);
  } catch (error) {
    // Image might not exist, which is fine
    console.warn('Image deletion warning:', error.message);
  }
};

/**
 * Delete a trip image from Firebase Storage
 * @param {string} tripImagePath - Path to the trip image in storage
 * @returns {Promise<void>}
 */
export const deleteTripImage = async (tripImagePath) => {
  try {
    if (!tripImagePath) return;
    
    const imageRef = ref(storage, `trip-images/${tripImagePath}`);
    await deleteObject(imageRef);
    console.log(`✅ Trip image deleted from Firebase Storage`);
  } catch (error) {
    // Image might not exist, which is fine
    console.warn('Trip image deletion warning:', error.message);
  }
};
