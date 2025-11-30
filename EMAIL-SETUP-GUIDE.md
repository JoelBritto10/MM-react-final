# 📧 Email Configuration Setup Guide

## Overview
This guide explains how to set up email notifications for trip joins and other events in MapMates.

## Architecture
- **Frontend**: Stores notification data in Firestore when users join trips
- **Cloud Functions**: Automatically sends emails when notifications are created
- **Email Service**: Uses Gmail (Nodemailer) to send emails

## Step-by-Step Setup

### 1. Enable Cloud Functions in Firebase
```bash
cd functions
npm install
```

### 2. Set Up Email Service (Gmail)

#### Option A: Using Gmail Account (Recommended for Testing)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - **Copy this password - you'll need it**

#### Option B: Using Gmail Business Account
- Same steps as above
- Works with G Suite accounts

#### Option C: Using SendGrid (Alternative)
1. Sign up at https://sendgrid.com
2. Create an API key
3. Update the transporter in `functions/index.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### 3. Deploy Cloud Functions

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Set Environment Variables**
   ```bash
   firebase functions:config:set gmail.user="your-email@gmail.com"
   firebase functions:config:set gmail.password="your-16-char-app-password"
   ```

4. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

### 4. Verify Deployment

1. Go to Firebase Console → Cloud Functions
2. You should see `sendTripJoinEmail` function listed
3. Check the Logs tab for deployment status

## Testing Email Functionality

### Test Trip Join Email

1. In your app, join a trip
2. Check if notification is created:
   - Firebase Console → Firestore → notifications collection
   - Look for recent document

3. Check email was sent:
   - Your inbox for the confirmation email
   - Or check Cloud Functions logs: `firebase functions:log`

### Manual Testing

You can test manually by creating a notification document:

1. Go to Firebase Console → Firestore
2. Create a new document in `notifications` collection:
   ```json
   {
     "type": "trip_join_confirmation",
     "userEmail": "test@example.com",
     "userName": "Test User",
     "tripTitle": "Beach Adventure",
     "tripLocation": "Maldives",
     "tripDate": "December 25, 2025",
     "hostName": "John Doe",
     "createdAt": "2025-12-01T10:00:00Z"
   }
   ```

3. Check your email for the confirmation

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` | Gmail address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password (16 chars) | `abcd efgh ijkl mnop` |
| `SENDGRID_API_KEY` | SendGrid API Key (if using SendGrid) | `SG.xxxxx...` |

## Troubleshooting

### Issue: Emails not sending
**Solution:**
1. Check Cloud Functions logs: `firebase functions:log`
2. Verify environment variables are set correctly
3. Ensure the email service is configured
4. Check spam/junk folders

### Issue: "Authentication failed"
**Solution:**
1. Verify your Gmail app password (not regular password)
2. Ensure 2FA is enabled on your Gmail account
3. Re-generate the app password and update in Firebase

### Issue: Function deployment fails
**Solution:**
1. Check you have `functions/package.json` with dependencies
2. Run `npm install` in the functions folder
3. Ensure Node.js 18+ is available
4. Check Firebase CLI version: `firebase --version`

### Issue: Notifications created but emails not sent
**Solution:**
1. Check if environment variables are deployed: `firebase functions:config:get`
2. Redeploy with correct config: `firebase deploy --only functions`
3. Check Cloud Functions execution logs for errors

## File Structure

```
functions/
├── index.js (Contains sendTripJoinEmail function)
├── package.json (Dependencies including nodemailer)
└── .env (Local environment variables - not committed)

src/
├── firebaseUtils.js (sendTripJoinConfirmation function)
└── pages/
    └── Home.js (Calls sendTripJoinConfirmation on trip join)
```

## Email Templates

Currently, two email templates are available:

### 1. Trip Join Confirmation
- Triggers: When user joins a trip
- Contains: Trip details, location, date, host name
- Sent to: User's registered email

### 2. Welcome Email (Optional)
- Triggers: When new user signs up
- Contains: Welcome message, getting started tips
- Sent to: New user's email

## Monitoring & Logs

### View Cloud Functions Logs
```bash
firebase functions:log
```

### View Specific Function Logs
```bash
firebase functions:log --function=sendTripJoinEmail
```

### View Errors
```bash
firebase functions:log --function=sendTripJoinEmail | grep "error"
```

## Security Best Practices

1. **Never commit credentials** to git
2. **Use environment variables** for sensitive data
3. **Restrict email sending** to verified notifications
4. **Rate limit** if high volume expected
5. **Monitor costs** - emails through Gmail are free, but function executions count toward quota

## Costs

- **Cloud Functions**: Free tier includes 2 million invocations/month
- **Gmail**: Free (limited to 500 emails/day from app)
- **SendGrid**: Free tier up to 100 emails/day

## Next Steps

1. Set up email service (Gmail with App Password)
2. Configure environment variables
3. Deploy Cloud Functions
4. Test by joining a trip
5. Monitor logs and email delivery

## Support

If you encounter issues:
1. Check Cloud Functions logs
2. Verify Firestore notifications collection has data
3. Ensure email service credentials are correct
4. Check Firebase documentation: https://firebase.google.com/docs/functions
