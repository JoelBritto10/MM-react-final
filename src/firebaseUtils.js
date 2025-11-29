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
import { auth, db } from './firebase';

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
    console.error('Error getting user profile:', error);
    throw error;
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
