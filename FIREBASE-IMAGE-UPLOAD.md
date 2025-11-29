# Firebase Image Upload Integration

## Overview
All images uploaded in the MapMates app are now automatically stored in **Firebase Storage** with their URLs and metadata saved in **Firestore Database**.

## Features Implemented

### 1. User Profile Images
- **Profile Photo**: Uploads to `user-images/{uid}/profile-{timestamp}.jpg`
- **Background Photo**: Uploads to `user-images/{uid}/background-{timestamp}.jpg`
- URLs stored in Firestore under `users/{uid}` collection
- Images are compressed before upload for optimal storage

### 2. Trip Images
- **Trip Cover Image**: Uploads to `trip-images/{userId}/{tripId}-{timestamp}.jpg`
- URLs stored in Firestore under `trips/{tripId}` collection
- Supports both new trips and edited trips

## How It Works

### Upload Flow
1. User selects an image in the app
2. Image is compressed using canvas API (quality optimized)
3. Base64 image is uploaded to **Firebase Storage**
4. Download URL is retrieved from Firebase
5. URL is stored in **Firestore** along with file path for reference
6. App displays the Firebase-hosted image

### Storage Structure

#### Firebase Storage
```
user-images/
├── {userId}/
│   ├── profile-{timestamp}.jpg
│   └── background-{timestamp}.jpg
trip-images/
├── {userId}/
│   ├── {tripId}-{timestamp}.jpg
│   └── {tripId}-{timestamp}.jpg
```

#### Firestore
```
users/{uid}
├── profileImage: "https://firebase-url..."
├── profileImagePath: "user-id/profile-timestamp.jpg"
├── backgroundImage: "https://firebase-url..."
└── backgroundImagePath: "user-id/background-timestamp.jpg"

trips/{tripId}
├── tripImage: "https://firebase-url..."
└── tripImagePath: "user-id/tripId-timestamp.jpg"
```

## API Functions

### Upload User Image
```javascript
import { uploadUserImage } from '../firebaseUtils';

// Upload profile image
const url = await uploadUserImage(userId, base64Image, 'profile');

// Upload background image
const url = await uploadUserImage(userId, base64Image, 'background');
```

### Upload Trip Image
```javascript
import { uploadTripImage } from '../firebaseUtils';

const url = await uploadTripImage(tripId, base64Image, userId);
```

### Delete Images
```javascript
import { deleteImage, deleteTripImage } from '../firebaseUtils';

// Delete user image
await deleteImage('user-id/profile-timestamp.jpg');

// Delete trip image
await deleteTripImage('user-id/tripId-timestamp.jpg');
```

## Updated Files

### `/src/firebaseUtils.js`
- Added Firebase Storage imports
- New function: `uploadUserImage(uid, base64Image, imageType)`
- New function: `uploadTripImage(tripId, base64Image, userId)`
- New function: `deleteImage(imagePath)`
- New function: `deleteTripImage(tripImagePath)`

### `/src/pages/Profile.js`
- Imports `uploadUserImage` from firebaseUtils
- Updated `handleSave()` to upload images to Firebase Storage
- Images are uploaded with Firebase URLs before saving
- Supports both new and existing image updates

### `/src/pages/CreateTrip.js`
- Imports `uploadTripImage` from firebaseUtils
- Updated `handleSubmit()` to upload trip images to Firebase Storage
- Creates Firebase-hosted trip images on trip creation

### `/src/pages/EditTrip.js`
- Imports `uploadTripImage` from firebaseUtils
- Updated `handleSubmit()` to support image updates to Firebase Storage
- Supports updating trip images on trip edit

## Firebase Storage Rules

Add these security rules to your Firestore to allow authenticated users to upload images:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /user-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /trip-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Console Logging

When uploading images, check the browser console (F12) for:
- `📤 Uploading profile image to Firebase...`
- `✅ Image uploaded successfully: [URL]`
- `✅ Image URL saved to Firestore`

## Benefits

✅ **Reduced Local Storage Usage** - Images stored in cloud, not on device
✅ **Firestore Integration** - Image URLs automatically saved in database
✅ **Global CDN** - Firebase serves images from optimized locations worldwide
✅ **Scalability** - Unlimited storage capacity
✅ **Easy Recovery** - Images persisted in cloud, not lost if app data cleared
✅ **Automatic Compression** - Images optimized before upload

## Troubleshooting

### Images not uploading?
1. Verify Firebase credentials in `.env.local` are correct
2. Check Firestore security rules allow writes
3. Check browser console for error messages
4. Verify Firebase Storage bucket is enabled

### "Error uploading image to Firebase"?
1. Check Firebase project has Storage enabled
2. Verify user is authenticated (signed in)
3. Check storage rules allow the upload
4. Try with a smaller image file

### Firebase URL not showing?
1. Verify Firestore update succeeded (check console)
2. Hard refresh the app (Ctrl+F5)
3. Check if URL is being overwritten by localStorage
4. Verify security rules allow reading the image

## Session Persistence

- All image URLs stored in Firestore persist across sessions
- Images automatically reload when user logs back in
- localStorage also stores image URLs as backup

## Next Steps (Optional)

1. Add image cropping/editing before upload
2. Add image gallery/carousel for trip photos
3. Implement image moderation/approval workflow
4. Add social features (likes, comments on images)
5. Generate thumbnails for faster loading

---

**Last Updated:** November 29, 2025
**Firebase Project:** reactmm-fd1e1
**Status:** ✅ Fully Implemented
