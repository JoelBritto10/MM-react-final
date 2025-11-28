# Scoped Group Chat System Documentation

## Database Schema

### Chat Messages Storage Structure

```javascript
localStorage.tripMessages = {
  "tripId_123": [
    {
      id: "timestamp_unique",           // Unique message ID
      userId: "user_id_456",            // Who sent the message
      username: "john_doe",             // Username (for display)
      message: "Hey everyone!",         // The actual message content
      timestamp: "2025-11-29T10:30:00Z", // ISO timestamp
      tripId: "tripId_123"              // Reference to trip (redundant but useful)
    },
    {
      id: "timestamp_unique_2",
      userId: "user_id_789",
      username: "jane_smith",
      message: "Looking forward to the trip!",
      timestamp: "2025-11-29T10:35:00Z",
      tripId: "tripId_123"
    }
  ],
  "tripId_456": [
    // Messages for different trip
  ]
}
```

### Related Data in localStorage

```javascript
localStorage.trips = [
  {
    id: "tripId_123",
    title: "Mountain Hiking Adventure",
    description: "...",
    location: "Colorado Rockies",
    date: "2025-12-15",
    hostId: "user_id_456",      // Trip creator
    hostName: "john_doe",
    participants: [             // Users who joined
      "user_id_789",
      "user_id_101"
    ],
    // ... other trip fields
  }
]

localStorage.users = [
  {
    id: "user_id_456",
    username: "john_doe",
    email: "john@example.com",
    // ... other user fields
  }
]

localStorage.currentUser = {
  // Currently logged-in user's full data
}
```

## Security Implementation

### Access Control Rules

The system enforces strict security through the `TripChat.js` component:

1. **Authentication Check**
   - User must be logged in (currentUser exists)
   - If not authenticated, redirect to `/login`

2. **Trip Membership Verification**
   ```javascript
   const isParticipant = currentTrip.participants && 
                        currentTrip.participants.includes(currentUser.id);
   const isHost = currentTrip.hostId === currentUser.id;
   
   if (!isParticipant && !isHost) {
     // Access denied
     return error message
   }
   ```

3. **Message Scoping**
   - Each trip's messages are stored separately in `localStorage.tripMessages[tripId]`
   - Only messages for the specific trip are loaded
   - Messages cannot be accessed cross-trip

### Security Limitations & Recommendations

**Current Implementation (Browser-based):**
- Uses localStorage which is client-side
- Security depends on browser's same-origin policy
- Suitable for single-user or trusted environments

**For Production:**
1. Move to a backend database (MongoDB, PostgreSQL)
2. Implement server-side authorization checks
3. Add JWT token validation
4. Use HTTPS encryption
5. Implement rate limiting on message sends
6. Add message validation and sanitization
7. Log access attempts for audit trails

## Component Interactions

### Data Flow

1. **User joins trip on Home.js**
   - User ID added to `trip.participants` array
   - Trip data updated in localStorage

2. **User clicks "Open Group Chat"**
   - Navigation to `/trip-chat/:tripId`
   - TripChat component loads with `tripId` parameter

3. **TripChat component initializes**
   - Verifies user is participant or host
   - Loads all messages for that tripId
   - Loads participant list
   - Displays chat interface

4. **User sends message**
   - Message object created with user info, content, timestamp
   - Message added to `localStorage.tripMessages[tripId]` array
   - Message displayed in real-time
   - Message persists across page refreshes

## File Structure

```
src/pages/
├── TripChat.js                 # Main trip chat component
├── TripChat.css                # Chat styling
├── Home.js                      # Updated with group chat button
├── Home.css                     # Updated button styling
└── ...existing pages

src/components/
└── ...existing components

App.js                           # Updated with TripChat route
```

## Key Features

### 1. Conditional Button Display (Home.js)

**For Trip Host:**
- Edit button
- Navigate button
- Group Chat button (always visible)

**For Non-Hosts:**
- Join Trip button (visible until joined)
- After joining, shows:
  - Group Chat button
  - Navigate button

### 2. Participant Management

- Hosts always have access
- Participants (those who joined) have access
- Non-participants cannot access the chat
- Participant list displayed with host indicator

### 3. Message Features

- Real-time display
- User attribution
- Timestamp for each message
- 500 character message limit
- Character counter
- Empty state messaging

### 4. UI/UX

- Beautiful gradient styling
- Scrollable message area
- Responsive design for mobile
- Back button to return to trips
- Trip info section in chat

## Usage Example

```javascript
// User flow:
1. User logs in → sees Home page
2. Sees trip "Mountain Hiking"
3. Clicks "Join Trip" → added to participants
4. "Join Trip" button changes to "Open Group Chat"
5. Clicks "Open Group Chat" → navigates to /trip-chat/tripId_123
6. Chat loads with trip name, participants, and messages
7. Types message → message appears in chat and persists
8. Clicks "Back" → returns to Home page
```

## Testing Checklist

- [ ] Non-member cannot access trip chat via URL
- [ ] Member can access and see all messages
- [ ] Messages appear immediately upon send
- [ ] Messages persist after page refresh
- [ ] Different trips have separate message threads
- [ ] Host always has chat access
- [ ] Join button becomes chat button when user joins
- [ ] Participant list shows all members
- [ ] Timestamps are formatted correctly
- [ ] Mobile layout is responsive

## Future Enhancements

1. **Real-time Updates**
   - WebSocket for live message updates
   - No need to refresh to see new messages

2. **Message Features**
   - Edit messages
   - Delete messages
   - Typing indicators
   - Message reactions/emojis

3. **User Features**
   - User online status
   - Message read receipts
   - Mention/@ tagging
   - Message search

4. **Media Support**
   - Image uploads in chat
   - File sharing
   - Link previews

5. **Moderation**
   - Message pinning
   - Spam filtering
   - User blocking
