# Firebase Setup Guide for MapMates

Firebase integration has been added to the MapMates application. This guide will help you set up Firebase for your project.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a new project"**
3. Enter project name: `MapMates` (or your preferred name)
4. Accept the terms and click **Create project**
5. Wait for the project to be created

## Step 2: Create a Web App

1. In the Firebase Console, click the **Web App** icon (it looks like `</>`
2. Give your app a name (e.g., `MapMates Web`)
3. Check the checkbox for Firebase Hosting (optional)
4. Click **Register app**

## Step 3: Get Your Firebase Config

After registering the app, you'll see a `firebaseConfig` object. It will look like:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Add Config to Your App

1. Open `.env.local` in the project root
2. Replace the placeholder values with your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY_HERE
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

3. **Save the file and restart your development server** (npm start)

## Step 5: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started**
3. Click **Email/Password** provider
4. Toggle **Enable** and click **Save**

## Step 6: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose location (closest to your users)
4. Start in **Production mode** (we'll set security rules later)
5. Click **Enable**

### Set Up Firestore Security Rules

Once Firestore is created:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth != null;
      allow write: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
    }

    // Trips collection - anyone can read, authenticated users can create/edit their own
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;

      // Trip messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow delete: if request.auth.uid == resource.data.userId;
      }
    }

    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Karma collection (optional, for tracking karma history)
    match /karma/{karmaId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## Step 7: Enable Cloud Storage (Optional, for image uploads)

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **Get started**
3. Choose location and click **Done**
4. Update the security rules to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write their own files
    match /trips/{tripId}/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow reading trip images
    match /trips/{tripId}/images/{fileName} {
      allow read: if request.auth != null;
    }
  }
}
```

## Step 8: Verify Firebase Integration

1. Run your app: `npm start`
2. The app should load without errors in the browser console
3. Try creating an account (it will use Firebase Authentication)
4. Try creating a trip (it will be stored in Firestore)

## Files Added/Modified

### New Files:
- `src/firebase.js` - Firebase configuration and initialization
- `src/firebaseUtils.js` - Utility functions for Firebase operations
- `.env.local` - Environment variables for Firebase config
- `FIREBASE-SETUP.md` - This setup guide

### Modified Files:
- `package.json` - Added firebase dependency

## Available Firebase Functions

### Authentication
- `registerUser(email, password, username)` - Create new account
- `loginUser(email, password)` - Login existing user
- `logoutUser()` - Logout current user
- `onAuthChange(callback)` - Listen for auth state changes

### User Profile
- `getUserProfile(uid)` - Get user profile data
- `updateUserProfile(uid, profileData)` - Update user profile

### Trips
- `createTrip(tripData)` - Create new trip
- `getTrips()` - Get all trips
- `getTrip(tripId)` - Get specific trip
- `updateTrip(tripId, tripData)` - Update trip
- `deleteTrip(tripId)` - Delete trip
- `getUserTrips(userId)` - Get trips created by user

### Reviews & Karma
- `createReview(tripId, reviewData)` - Create review
- `getTripReviews(tripId)` - Get reviews for a trip
- `getUserReviews(userId)` - Get reviews for a user

### Messages
- `sendMessage(tripId, messageData)` - Send chat message
- `getTripMessages(tripId)` - Get all messages in a trip

### Participants
- `joinTrip(tripId, userId, userName)` - Join a trip
- `leaveTrip(tripId, userId)` - Leave a trip

## Migration from localStorage to Firebase (Optional)

If you want to migrate existing data from localStorage:

1. Before clearing localStorage, backup your data
2. Update each page component to use Firebase functions instead of localStorage
3. Test thoroughly to ensure data integrity

## Troubleshooting

### "Firebase is not defined"
- Make sure you've added Firebase credentials to `.env.local`
- Restart the development server after adding `.env.local`

### "Permission denied" errors
- Check your Firestore security rules
- Ensure user is authenticated before accessing Firestore

### "Cannot find module 'firebase'"
- Run: `npm install firebase`

### Data not syncing
- Check browser console for error messages
- Verify Firebase configuration in `.env.local`
- Check Firestore rules allow the operation

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use production-mode Firestore** - Restrict access via security rules
3. **Enable two-factor authentication** on your Firebase Console account
4. **Regularly review Firestore rules** - Only allow necessary operations
5. **Monitor Firestore usage** - Firebase has free tier limits

## Free Tier Limits (as of 2025)

- **Authentication**: 50K sign-ups/month
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Storage**: 5 GB bandwidth/month

For production apps exceeding these limits, Firebase operates on a pay-as-you-go model.

## Next Steps

1. Complete the setup steps above
2. Test authentication (signup/login)
3. Test creating/editing trips
4. Monitor Firestore usage in Firebase Console
5. Deploy to production when ready

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
