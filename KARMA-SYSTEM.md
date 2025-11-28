# Karma System - Trip Reviews & Host Recognition

## Overview
The karma system rewards trip hosts based on member satisfaction. After a trip ends, members can rate their experience, and the host receives karma points accordingly.

## How It Works

### 1. Host Ends the Trip
- On the Home page, trip hosts see an **"🛑 End Trip"** button
- Clicking it marks the trip as ended and notifies members they can now rate
- Trip shows a **"✅ Trip Ended"** badge

### 2. Members Rate the Trip
After a trip ends, members who joined see a **"⭐ Rate Trip"** button:
- Clicking opens the Trip Review page
- Members select a rating from 1-5 stars
- Members can add optional comments (500 char limit)
- Click **"Submit Review"** to complete

### 3. Karma Points Awarded

**Excellent Ratings (4-5 stars):**
- Host receives **+10 Karma Points**
- 🚀 Excellent trip
- 😊 Very good trip

**Average/OK Ratings (1-3 stars):**
- Host receives **+5 Karma Points**
- 😞 Poor trip
- 😕 OK trip
- 😐 Average trip

### 4. Security & Validation
- ✅ Only participants who joined the trip can review it
- ✅ Hosts cannot rate their own trips
- ✅ Each member can only review a trip once
- ✅ Reviews are stored in localStorage under `tripReviews`

### 5. Karma Leaderboard
Users can view their karma status on the **Karma page**:
- Current karma points
- Rank among all users
- Badges based on karma milestones:
  - 🌱 Beginner: 0+ points
  - 🗺️ Explorer: 50+ points
  - ⛰️ Adventurer: 100+ points
  - 🏆 Legend: 200+ points
  - 👑 Master: 500+ points

## Data Storage

### Reviews Storage (`tripReviews`)
```javascript
{
  "tripId": [
    {
      "id": "timestamp",
      "userId": "user123",
      "username": "John Doe",
      "tripId": "trip456",
      "rating": 5,
      "comment": "Amazing trip!",
      "timestamp": "ISO date"
    }
  ]
}
```

### User Karma Update
When a review is submitted:
- User's karma field is updated in `users` array
- Host's karma is recalculated with new points
- currentUser localStorage is also updated if applicable

## User Interface

### Home Page - Trip Card Changes
- Hosts: New "🛑 End Trip" button (only when trip is active)
- Members: New "⭐ Rate Trip" button (only after trip ends)
- Ended trips show "✅ Trip Ended" badge

### Trip Review Page
- Shows trip details (title, location, host)
- 5 rating options with emoji and karma point display
- Optional comment textarea with character counter
- Success message after submission
- Automatic redirect to Home page after 2 seconds

### Karma Page
- Updated "How to Earn Karma" section
- Shows karma earned from member reviews
- Displays karma breakdown

## Files Created/Modified

### New Files
- `TripReview.js` - Trip rating component
- `TripReview.css` - Review page styling

### Modified Files
- `App.js` - Added TripReview route
- `Home.js` - Added handleEndTrip(), updated trip card rendering
- `Home.css` - Added .btn-end, .btn-review, .trip-ended-badge styles
- `Karma.js` - Updated karma earning explanation

## Features
✅ Post-trip member reviews
✅ Karma point rewards for hosts
✅ Security validations (no self-rating, one review per member)
✅ Comment system for feedback
✅ Visual badges and leaderboard
✅ Responsive design for mobile
✅ Real-time karma updates
