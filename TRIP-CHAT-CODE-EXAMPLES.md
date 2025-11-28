# Scoped Trip Group Chat - Code Examples & Usage Guide

## Quick Start Example

### Scenario: User Flow

```
User A (Host) → Creates Trip "Beach Volleyball" → invites friends
User B → Sees trip on home page → Clicks "Join Trip"
User C → Sees trip on home page → Clicks "Join Trip"
User B → Clicks "Open Group Chat" → enters chat room
User C → Clicks "Open Group Chat" → enters same chat room
User B sends message → "Let's meet at 9 AM tomorrow!"
User C sees message immediately
Both can continue conversation
```

## Code Examples

### 1. Conditional Button Rendering (Home.js)

```javascript
// When displaying a trip card:
const isCurrentUserHost = currentUser?.id === trip.hostId;
const isCurrentUserParticipant = trip.participants?.includes(currentUser?.id);

<div className="trip-actions">
  {isCurrentUserHost ? (
    // Host can always access group chat
    <>
      <Link to={`/trip-chat/${trip.id}`} className="btn btn-chat">
        💬 Group Chat
      </Link>
      <Link to={`/edit-trip/${trip.id}`} className="btn btn-primary">
        Edit
      </Link>
    </>
  ) : (
    // Non-host: show Join or Chat button
    <>
      {!isCurrentUserParticipant ? (
        // Not yet joined
        <button onClick={() => handleJoinTrip(trip)} className="btn btn-join">
          ➕ Join Trip
        </button>
      ) : (
        // Already joined - show chat
        <Link to={`/trip-chat/${trip.id}`} className="btn btn-chat">
          💬 Open Group Chat
        </Link>
      )}
    </>
  )}
</div>
```

### 2. Security Access Control (TripChat.js)

```javascript
useEffect(() => {
  // Step 1: Authentication
  if (!currentUser) {
    navigate('/login');
    return;
  }

  // Step 2: Load trip
  const trips = JSON.parse(localStorage.getItem('trips')) || [];
  const currentTrip = trips.find(t => t.id === tripId);

  if (!currentTrip) {
    setError('Trip not found');
    return;
  }

  // Step 3: Membership verification (SECURITY CHECK)
  const isParticipant = currentTrip.participants?.includes(currentUser.id);
  const isHost = currentTrip.hostId === currentUser.id;

  if (!isParticipant && !isHost) {
    // Non-members cannot access
    setError('Access denied: You are not a member of this trip');
    return;
  }

  // Step 4: Load trip and messages
  setTrip(currentTrip);
  const allMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
  setMessages(allMessages[tripId] || []);
  
  setLoading(false);
}, [tripId, currentUser, navigate]);
```

### 3. Sending a Message

```javascript
const handleSendMessage = (e) => {
  e.preventDefault();

  // Validation
  if (!newMessage.trim()) return;
  if (!currentUser) {
    alert('Please log in');
    return;
  }

  // Create message
  const message = {
    id: Date.now().toString(),              // Unique ID
    userId: currentUser.id,                 // Who sent it
    username: currentUser.username,         // Display name
    message: newMessage.trim(),             // Content
    timestamp: new Date().toISOString(),    // When
    tripId: tripId                          // Which trip
  };

  // Save to storage
  const allMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
  if (!allMessages[tripId]) {
    allMessages[tripId] = [];
  }
  allMessages[tripId].push(message);
  localStorage.setItem('tripMessages', JSON.stringify(allMessages));

  // Update UI
  setMessages(prev => [...prev, message]);
  setNewMessage('');
};
```

### 4. Loading Messages for Specific Trip

```javascript
// Load ONLY messages for this trip
const loadTripMessages = (tripId) => {
  try {
    const allMessages = JSON.parse(localStorage.getItem('tripMessages')) || {};
    const tripMessages = allMessages[tripId] || [];
    
    // Sorted by timestamp (oldest first)
    return tripMessages.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

// Usage
const messages = loadTripMessages(tripId);
```

## Data Flow Diagrams

### Message Storage Structure

```
localStorage
│
└─ tripMessages
   │
   ├─ "trip_001"  (array of messages)
   │  ├─ { id: "1", userId: "user_a", message: "Hello!" }
   │  ├─ { id: "2", userId: "user_b", message: "Hi there!" }
   │  └─ { id: "3", userId: "user_a", message: "How are you?" }
   │
   ├─ "trip_002"  (different trip, different messages)
   │  ├─ { id: "4", userId: "user_c", message: "Great trip!" }
   │  └─ { id: "5", userId: "user_d", message: "I'm excited!" }
   │
   └─ "trip_003"  (empty, no messages yet)
      └─ []
```

### Component Interaction Flow

```
Home.js (Trip Card)
   ↓
User clicks "Open Group Chat"
   ↓
Navigate to /trip-chat/:tripId
   ↓
TripChat.js loads
   ↓
   ├─ Check authentication
   ├─ Load trip details
   ├─ Verify membership (SECURITY)
   ├─ Load messages for tripId
   ├─ Load participants
   │
   └─ Render chat UI
      ├─ Participants list
      ├─ Messages container
      └─ Message input form
```

## Real-World Scenarios

### Scenario 1: New Trip Creation

```javascript
// Trip created
const newTrip = {
  id: "trip_beach_2025",
  title: "Beach Cleanup",
  hostId: "user_alice",
  hostName: "Alice",
  participants: [],  // Initially empty
  // ... other fields
};

// Alice can immediately access chat (she's the host)
// Home page shows: [Edit] [Group Chat] buttons

// When Bob joins
trip.participants.push("user_bob");
// Home page shows: [Open Group Chat] [Navigate] buttons

// Bob can now access the chat
// He sees Alice's previous messages (if any)
```

### Scenario 2: Multiple Trips

```javascript
// User is member of 3 trips
localStorage.trips = [
  { id: "trip_1", title: "Hiking", ... },
  { id: "trip_2", title: "Beach", ... },
  { id: "trip_3", title: "Skiing", ... }
];

// Messages are kept separate
localStorage.tripMessages = {
  "trip_1": [
    { id: "1", message: "Trail is icy today" },
    { id: "2", message: "Bring snow gear" }
  ],
  "trip_2": [
    { id: "3", message: "Water is 72°F" },
    { id: "4", message: "Bring sunscreen" }
  ],
  "trip_3": [
    // Empty - no messages yet
  ]
};

// When user opens trip_1 chat, they see ONLY trip_1 messages
// When they switch to trip_2, they see ONLY trip_2 messages
```

### Scenario 3: Security Test

```javascript
// Alice creates trip_001
// Bob is NOT a participant

// Attack attempt: Bob tries to access via URL
// URL: /trip-chat/trip_001

// TripChat.js checks:
const trip = trips.find(t => t.id === "trip_001");
const isParticipant = trip.participants?.includes("user_bob");  // FALSE
const isHost = trip.hostId === "user_bob";                      // FALSE

// Result: Error message "Access denied"
// Bob cannot see messages, cannot send messages
```

## API Reference

### TripChat Component

```javascript
<TripChat currentUser={currentUser} />

// Props:
// - currentUser: { id, username, email, ... }
//   Must be authenticated to access

// Loads from:
// - localStorage.trips (to find trip details)
// - localStorage.users (to find participant names)
// - localStorage.tripMessages (to find messages)
// - Route param :tripId (to know which trip)
```

### Message Object Structure

```javascript
{
  id: string,              // "1234567890" (Date.now())
  userId: string,          // "user_abc123"
  username: string,        // "john_doe"
  message: string,         // "Hey everyone!"
  timestamp: string,       // "2025-11-29T15:30:00Z" (ISO)
  tripId: string          // "trip_xyz789"
}
```

### Storage Keys

```javascript
// Key: 'trips'
// Value: Array of all trips with participants array

// Key: 'tripMessages'
// Value: Object with tripId as keys, message arrays as values

// Key: 'users'
// Value: Array of all users

// Key: 'currentUser'
// Value: Currently logged-in user object
```

## Testing Code Examples

### Test 1: Verify Messages Persist

```javascript
// Test code to add to TripChat.js temporarily
useEffect(() => {
  console.log('=== DEBUG: Trip Chat Loaded ===');
  console.log('Current Trip ID:', tripId);
  console.log('Current User:', currentUser);
  console.log('Trip Details:', trip);
  console.log('Messages:', messages);
  console.log('Participants:', participants);
}, [tripId, trip, messages, participants]);
```

### Test 2: Check Security

```javascript
// In browser console:
const tripMessages = JSON.parse(localStorage.getItem('tripMessages'));
console.log('All messages:', tripMessages);

// Try accessing different trips' messages
console.log('Trip 1 messages:', tripMessages['trip_1']);
console.log('Trip 2 messages:', tripMessages['trip_2']);

// Verify separation
```

### Test 3: Verify Participants

```javascript
// Check who can access
const trip = JSON.parse(localStorage.getItem('trips')).find(t => t.id === 'trip_1');
console.log('Host ID:', trip.hostId);
console.log('Participants:', trip.participants);

// Verify current user is in one of these lists
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const hasAccess = trip.hostId === currentUser.id || 
                  trip.participants?.includes(currentUser.id);
console.log('Can access:', hasAccess);
```

## Performance Considerations

### For 100+ Messages

```javascript
// Implement pagination
const [messagesPage, setMessagesPage] = useState(0);
const ITEMS_PER_PAGE = 50;

const displayedMessages = messages.slice(
  messagesPage * ITEMS_PER_PAGE,
  (messagesPage + 1) * ITEMS_PER_PAGE
);

// Add pagination buttons
<button onClick={() => setMessagesPage(p => p + 1)}>
  Load more messages
</button>
```

### Storage Size Optimization

```javascript
// Compress old messages periodically
const archiveOldMessages = (tripId, daysToKeep = 90) => {
  const allMessages = JSON.parse(localStorage.getItem('tripMessages'));
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  allMessages[tripId] = allMessages[tripId].filter(msg => 
    new Date(msg.timestamp) > cutoffDate
  );
  
  localStorage.setItem('tripMessages', JSON.stringify(allMessages));
};
```

## Debugging Tips

1. **Check Console for Errors**
   - F12 → Console tab
   - Look for red error messages

2. **Check localStorage**
   - F12 → Application → localStorage
   - Verify tripMessages data exists

3. **Check Authentication**
   - Console: `JSON.parse(localStorage.getItem('currentUser'))`
   - Should show logged-in user

4. **Check Trip Membership**
   ```javascript
   const trip = JSON.parse(localStorage.getItem('trips'))[0];
   const user = JSON.parse(localStorage.getItem('currentUser'));
   console.log('Is member?', trip.participants.includes(user.id));
   ```

5. **Clear Cache if Needed**
   - F12 → Application → Clear Site Data
   - Refresh page

## Next Steps

1. Deploy to production with backend database
2. Add WebSocket for real-time updates
3. Implement message search functionality
4. Add file/image sharing
5. Create moderation tools
6. Add encryption for messages
7. Implement read receipts
8. Add typing indicators
