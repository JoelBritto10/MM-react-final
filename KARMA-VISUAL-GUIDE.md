# 📊 Karma Leaderboard - Visual Guide & Feature Overview

## What You'll See on the Karma Page

### 1. Your Personal Stats Card (Top)
```
┌─────────────────────────────────────────┐
│         🏆 Karma Leaderboard            │
├─────────────────────────────────────────┤
│  Your Karma Points                      │
│           245                           │
│  From 15 reviews                        │
│  🏆 Legend                              │
└─────────────────────────────────────────┘
```

### 2. Leaderboard Rankings
```
┌──────────────────────────────────────────────────────────┐
│  🥇 Top Contributors                                     │
├──────────────────────────────────────────────────────────┤
│  🥇 John Doe                    350 pts  🏆 Legend      │
│      ↳ 22 reviews received                               │
├──────────────────────────────────────────────────────────┤
│  🥈 Sarah Johnson                280 pts  🏆 Legend     │
│      ↳ 18 reviews received                               │
├──────────────────────────────────────────────────────────┤
│  🥉 Mike Chen                     245 pts  🏆 Legend    │
│      ↳ 15 reviews received                               │
├──────────────────────────────────────────────────────────┤
│  #4 Emma Wilson                  180 pts  ⛰️ Adventurer │
│      ↳ 12 reviews received                               │
└──────────────────────────────────────────────────────────┘
```

## Features Breakdown

### 🎯 Medal System
- **🥇 First Place** - Highest karma host
- **🥈 Second Place** - Second highest
- **🥉 Third Place** - Third highest
- **#N** - Rank number for positions 4+

### 📈 Review Count Tracking
Shows under each username:
- "X reviews received" - Total reviews the user got as a host
- Updates in real-time as new reviews are submitted

### 🌈 Color-Coded Karma Points
- **Purple** (👑 Master 500+) - Top tier
- **Gold** (🏆 Legend 200+) - Second tier
- **Coral** (⛰️ Adventurer 100+) - Third tier
- **Blue** (🗺️ Explorer 50+) - Fourth tier
- **Green** (🌱 Beginner 0+) - New members

## How Karma is Calculated From Reviews

### Step 1: Submit Review
User leaves a 5-star review with comment:
```
Title: "Amazing trip!"
Comment: "Had an amazing and wonderful time. The host was 
          professional and organized everything perfectly!"
```

### Step 2: Sentiment Analysis
System analyzes the text:
- **Positive keywords found**: "amazing" (2x), "wonderful", "professional", "organized", "perfectly" = 5 words
- **Negative keywords found**: 0 words

### Step 3: Calculate Karma
```
Base karma:       5 stars = +10 points
Positive bonus:   5 positive words = +5 points (max capped at 5)
Negative penalty: 0 negative words = -0 points
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL KARMA:      +15 points ✅
```

### Step 4: Update Leaderboard
Host's karma increases by 15 points:
- Ranking may change if they overtake others
- Review count increases by 1
- Badges may upgrade (e.g., 100 pts → ⛰️ Adventurer badge awarded)

## Badge Progression Example

### Sarah's Journey to Master Badge

**Week 1 - New Host**
```
Sarah creates first trip
20 people join
15 submit reviews (mostly 5⭐)
Karma: 0 + 150 = 150 → ⛰️ Adventurer Badge! 🎉
```

**Week 2 - Growing Host**
```
Another trip with 12 participants
11 reviews received (high quality)
Karma: 150 + 110 = 260 → 🏆 Legend Badge! 🎉
```

**Week 3-4 - Consistent Excellence**
```
3 more trips, 45 total reviews across all trips
Maintains high ratings and positive sentiment
Karma: 260 + 250+ = 500+ → 👑 Master Badge! 🎉
```

## Real-Time Updates (Every 5 Seconds)

The leaderboard automatically refreshes every 5 seconds:

**Timeline:**
```
00:00 - You submit review: 5⭐ "Excellent trip!"
        System calculates: +12 karma points
        
00:02 - You refresh Karma page
        (no change yet - refresh interval)
        
00:05 - Leaderboard auto-refreshes
        Host's karma updates: 230 → 242 pts ✅
        Rankings recalculate
        
00:10 - Another review submitted
        Leaderboard refreshes again with new data
```

## Sentiment Analysis Examples

### Example 1: Positive Review ✅
```
Rating: 5⭐
Comment: "Had an absolutely amazing time! The host was 
         wonderful and made everything so special and 
         memorable. Highly recommend!"

Sentiment Analysis:
- Positive: amazing, wonderful, special, memorable, recommend = 5 words
- Negative: 0 words

Karma: 10 (base) + 5 (sentiment bonus) = +15 points
```

### Example 2: Mixed Review ⚖️
```
Rating: 4⭐
Comment: "Great experience overall but some communication 
         issues at the beginning. Still very good!"

Sentiment Analysis:
- Positive: Great, very good = 2 words
- Negative: issues = 1 word

Karma: 10 (base) + 2 (sentiment bonus) - 1 (penalty) = +11 points
```

### Example 3: Negative Review ❌
```
Rating: 1⭐
Comment: "Terrible experience. Host was unprofessional 
         and the trip was poorly organized. Total waste."

Sentiment Analysis:
- Positive: 0 words
- Negative: Terrible, unprofessional, poorly, waste = 4 words

Karma: -1 (base) - 3 (penalty capped at 3) = -4 points
```

## Key Information Section

The page displays complete information about:

1. **Base Karma from Reviews**
   - 5⭐ = +10 pts
   - 4⭐ = +10 pts
   - 3⭐ = +5 pts
   - 2⭐ = 0 pts
   - 1⭐ = -1 pts

2. **Sentiment-Based Bonuses & Penalties**
   - ✨ Positive bonus: +1 to +5 for high ratings with positive keywords
   - 😞 Negative penalty: -1 to -3 for reviews with negative keywords

3. **Badge Milestone Tiers**
   - 🌱 Beginner: 0-49 points
   - 🗺️ Explorer: 50-99 points
   - ⛰️ Adventurer: 100-199 points
   - 🏆 Legend: 200-499 points
   - 👑 Master: 500+ points

4. **Tips to Earn More Karma**
   - Host well-organized and memorable trips
   - Be responsive and communicative with participants
   - Follow through on trip promises and details
   - Create safe and enjoyable experiences
   - Encourage genuine, detailed reviews from participants

## Mobile Responsive

The Karma page adapts to all screen sizes:

### Desktop (1024px+)
- Full leaderboard visible
- All details displayed
- Multiple columns for comparison

### Tablet (768px-1023px)
- Leaderboard wrapped slightly
- User info stacked vertically
- All information still visible

### Mobile (< 768px)
- Full-width layout
- Simplified card display
- Swipe-friendly sizing
- Touch-optimized interactions

## Data Persistence

All karma data is stored in your browser's localStorage:

```javascript
// Users array (with karma)
users: [
  { id: "1", username: "John", karma: 350 },
  { id: "2", username: "Sarah", karma: 280 }
]

// Trip reviews (source of karma calculation)
tripReviews: {
  "trip-1": [
    { rating: 5, title: "Great!", comment: "Amazing...", userId: "1" }
  ]
}
```

When a new review is submitted:
1. Review is saved to localStorage
2. Karma calculated and added to user
3. Leaderboard reads updated values
4. UI refreshes to show changes

## Troubleshooting

### Issue: Karma not updating
**Solution:** Wait 5 seconds for auto-refresh, or refresh the page manually

### Issue: Review count shows 0
**Solution:** Make sure you're viewing as the host of the trip. Reviews are counted per host.

### Issue: Karma went down
**Solution:** This can happen with:
- Low star ratings (-1 for 1⭐)
- Negative sentiment analysis (-1 to -3 points)
- Mixed reviews (positive rating but negative words)

### Issue: Badge didn't change
**Solution:** Wait for leaderboard to refresh, then refresh page. Badge updates based on current karma total.

---

**Last Updated**: November 29, 2025  
**Feature Status**: ✅ Live and Working  
**Auto-Refresh Interval**: Every 5 seconds
