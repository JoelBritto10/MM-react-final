/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCreate} = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Configure email transporter
// Use environment variables: EMAIL_USER and EMAIL_PASSWORD
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Cloud Function: Send email when notification is created
exports.sendTripJoinEmail = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log('No data associated with the event');
    return null;
  }

  const notification = snapshot.data();
  const notificationId = event.params.notificationId;

  // Only send emails for trip_join_confirmation notifications
  if (notification.type !== 'trip_join_confirmation') {
    return null;
  }

  const {
    userEmail,
    userName,
    tripTitle,
    tripLocation,
    tripDate,
    hostName
  } = notification;

  try {
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Trip Confirmation: ${tripTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Trip Confirmed!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333; margin-top: 0;">
              Hi <strong>${userName}</strong>,
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Congratulations! You've successfully joined a trip on MapMates.
            </p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #667eea;">Trip Details:</h3>
              <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${tripLocation}</p>
              <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${tripDate}</p>
              <p style="margin: 8px 0;"><strong>🎯 Trip:</strong> ${tripTitle}</p>
              <p style="margin: 8px 0;"><strong>👤 Host:</strong> ${hostName}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1976d2;">
                <strong>💡 Next Steps:</strong><br/>
                Log in to MapMates to connect with other participants and share trip details!
              </p>
            </div>
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              © 2025 MapMates. All rights reserved.<br/>
              Questions? Contact us at support@mapmates.com
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    logger.log('✅ Email sent to:', userEmail);
    
    // Update notification as sent
    await admin.firestore().collection('notifications').doc(notificationId).update({
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  } catch (error) {
    logger.error('❌ Error sending email:', error);
    
    // Log error to notifications
    await admin.firestore().collection('notifications').doc(notificationId).update({
      emailSent: false,
      emailError: error.message,
      emailAttemptedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw error;
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
