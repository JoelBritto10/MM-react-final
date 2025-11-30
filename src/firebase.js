import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Firebase configuration (Mumbai region - asia-south1)
const firebaseConfig = {
  apiKey: "AIzaSyAogHSZ0_rCy07a2SUw5nnwfdJ-1Q8RlXA",
  authDomain: "m-mates.firebaseapp.com",
  projectId: "m-mates",
  storageBucket: "m-mates.firebasestorage.app",
  messagingSenderId: "707198396550",
  appId: "1:707198396550:web:c9f139565b5fdb54940907",
  measurementId: "G-LPKCN667B3",
  // Region set to Mumbai (asia-south1) at Firebase project level
  databaseURL: "https://m-mates-default-rtdb.asia-south1.firebasedatabase.app"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully (Mumbai region - asia-south1)');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;
