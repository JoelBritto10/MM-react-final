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
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
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
    await updateDoc(doc(db, 'trips', tripId), data);
    return true;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, 'trips', tripId));
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const subscribeToTrips = (callback) => {
  return onSnapshot(collection(db, 'trips'), (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(trips);
  });
};

// ============= IMAGE STORAGE =============

export const uploadUserImage = async (userId, imageData, imageType) => {
  try {
    const storageRef = ref(storage, `user-images/${userId}/${imageType}-${Date.now()}`);
    const blob = await fetch(imageData).then(r => r.blob());
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading user image:', error);
    throw error;
  }
};

export const uploadTripImage = async (tripId, imageData, userId) => {
  try {
    const storageRef = ref(storage, `trip-images/${userId}/${tripId}-${Date.now()}`);
    const blob = await fetch(imageData).then(r => r.blob());
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading trip image:', error);
    throw error;
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
