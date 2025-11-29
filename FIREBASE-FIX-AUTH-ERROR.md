# Fix "auth/operation-not-allowed" Error

## Solution: Enable Email/Password Authentication in Firebase

This error occurs because Email/Password sign-in method is disabled in your Firebase project.

### Step-by-Step Fix (5 minutes):

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Select your project: `reactmm-fd1e1`

2. **Navigate to Authentication**
   - Left sidebar → **Authentication**
   - Click on **Sign-in method** tab

3. **Enable Email/Password Provider**
   - Look for **Email/Password** in the list
   - Click on it
   - Toggle the **Enable** switch to ON
   - Make sure "Email/Password" checkbox is checked
   - Click **Save**

4. **Verify It's Enabled**
   - You should see a green checkmark next to "Email/Password"
   - Status should show: "Enabled"

5. **Test the App**
   - Go back to: http://localhost:3000
   - Try signing up with a test email
   - Check if you can create an account

### If Still Getting Error:

**Check these additional settings:**

1. **Firestore Database Exists**
   - Go to **Firestore Database** (left sidebar)
   - Click **Create Database** if it doesn't exist
   - Start in **Production mode**
   - Choose any region

2. **Security Rules Are Set**
   - In Firestore → **Rules** tab
   - Replace default rules with these:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Click **Publish**

3. **Check API Keys**
   - Go to **Project Settings** (gear icon)
   - Click **Service Accounts** tab
   - Make sure your `.env.local` has correct keys:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSyB3bP8oKSffhgeE_xodAjmilB_UtMHDohw
   REACT_APP_FIREBASE_AUTH_DOMAIN=reactmm-fd1e1.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=reactmm-fd1e1
   REACT_APP_FIREBASE_STORAGE_BUCKET=reactmm-fd1e1.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=901069877682
   REACT_APP_FIREBASE_APP_ID=1:901069877682:web:6d5dac19830e287d2cb4ab
   ```

### Alternative: Use Different Sign-In Methods

If Email/Password doesn't work, try these alternatives:

**Option 1: Google Sign-In**
1. In Firebase Authentication → Sign-in method
2. Enable **Google** provider
3. Add authorized domain if prompted

**Option 2: Phone Authentication**
1. In Firebase Authentication → Sign-in method
2. Enable **Phone** provider
3. Add your country's code

### Common Causes:

| Error | Cause | Fix |
|-------|-------|-----|
| **auth/operation-not-allowed** | Email/Password not enabled | Enable in Authentication settings |
| **auth/invalid-api-key** | Wrong Firebase credentials | Check `.env.local` matches Firebase Console |
| **Permission denied** | Firestore rules too restrictive | Update security rules |
| **auth/network-request-failed** | Network issue | Check internet, restart app |

### Verify Everything Works:

After enabling Email/Password, test:
1. ✅ Signup with new email
2. ✅ Check user appears in Firebase Console → Authentication → Users
3. ✅ Login with same email/password
4. ✅ See profile loaded

### Still Having Issues?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh page**: Ctrl+F5
3. **Restart dev server**: Kill terminal, run `npm start` again
4. **Check console errors**: F12 → Console tab

---

## Quick Reference: Firebase Console Navigation

```
Firebase Console (console.firebase.google.com)
├── Select Project: reactmm-fd1e1
├── Left Sidebar:
│   ├── Authentication
│   │   ├── Sign-in method → ENABLE EMAIL/PASSWORD ← YOU ARE HERE
│   │   └── Users
│   ├── Firestore Database
│   │   ├── Data
│   │   ├── Rules ← SET SECURITY RULES
│   │   └── Indexes
│   └── Project Settings (gear icon)
│       ├── General
│       ├── Service Accounts
│       └── Your apps
└── Done!
```

---

**After enabling Email/Password authentication, the error should disappear! Try signing up again.**
