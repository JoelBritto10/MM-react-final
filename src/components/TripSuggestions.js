import React, { useState, useEffect, useRef } from 'react';
import '../styles/TripSuggestions.css';

function TripSuggestions({ currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trips, setTrips] = useState([]);
  const messagesEndRef = useRef(null);

  const categories = [
    { id: 'all', name: '🌍 All', icon: '🌍' },
    { id: 'beach', name: '🏖️ Beach', icon: '🏖️' },
    { id: 'mountain', name: '⛰️ Mountain', icon: '⛰️' },
    { id: 'city', name: '🏙️ City', icon: '🏙️' },
    { id: 'adventure', name: '🎯 Adventure', icon: '🎯' },
    { id: 'culture', name: '🎭 Culture', icon: '🎭' },
    { id: 'sports', name: '⚽ Sports', icon: '⚽' }
  ];

  // Default suggestions fallback
  const defaultSuggestions = {
    beach: [
      "Maldives - Crystal clear waters, perfect for snorkeling",
      "Bali, Indonesia - Beautiful beaches with vibrant culture",
      "Goa, India - Relaxing beaches with vibrant nightlife",
      "Santorini, Greece - Stunning sunsets and white-washed buildings",
      "Caribbean Islands - Tropical paradise with pristine waters"
    ],
    mountain: [
      "Swiss Alps - World-class hiking and skiing",
      "Nepal - Trek to Everest base camp",
      "Colorado Rockies - Adventure sports and scenic beauty",
      "Himalayas, India - Spiritual and adventure tourism",
      "Patagonia - Dramatic mountain landscapes"
    ],
    city: [
      "Paris, France - City of love and art",
      "Tokyo, Japan - Modern meets traditional culture",
      "New York, USA - The city that never sleeps",
      "Barcelona, Spain - Architecture and Mediterranean coast",
      "Dubai, UAE - Modern luxury and desert adventures"
    ],
    adventure: [
      "New Zealand - Bungee jumping, hiking, and water sports",
      "Costa Rica - Zip-lining and jungle adventures",
      "Iceland - Hiking and natural wonders",
      "Switzerland - Alpine hiking and mountain biking",
      "Peru - Machu Picchu trekking and jungle exploration"
    ],
    culture: [
      "India - Taj Mahal, temples, and vibrant traditions",
      "Egypt - Ancient pyramids and historical sites",
      "Italy - Renaissance art and historical landmarks",
      "Mexico - Ancient ruins and colorful traditions",
      "Thailand - Temples, monasteries, and local culture"
    ],
    sports: [
      "Miami, USA - Basketball, water sports, and beach volleyball",
      "Barcelona, Spain - Football, cycling, and water activities",
      "Tokyo, Japan - Rugby, martial arts, and sumo wrestling",
      "Switzerland - Skiing, mountain biking, and mountaineering",
      "Australia - Surfing, cricket, and extreme sports paradise"
    ]
  };

  useEffect(() => {
    scrollToBottom();
  }, [questions]);

  useEffect(() => {
    loadTripsAndQuestions();
  }, [currentUser]);

  // Listen for storage changes (when new trips are created)
  useEffect(() => {
    const handleStorageChange = () => {
      loadTripsAndQuestions();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTripsAndQuestions = () => {
    // Load trips from localStorage
    const savedTrips = localStorage.getItem('trips') || '[]';
    try {
      setTrips(JSON.parse(savedTrips));
    } catch (error) {
      setTrips([]);
    }

    // Load questions from localStorage
    const saved = localStorage.getItem('tripSuggestions') || '[]';
    try {
      setQuestions(JSON.parse(saved));
    } catch (error) {
      setQuestions([]);
    }
  };

  const categorizeTrip = (trip) => {
    // First check if trip has explicit category
    if (trip.category && trip.category !== 'all') {
      return trip.category;
    }

    // Fall back to auto-detection based on keywords
    const title = (trip.title || '').toLowerCase();
    const location = (trip.location || '').toLowerCase();
    const combined = `${title} ${location}`;

    const beachKeywords = ['beach', 'sea', 'ocean', 'island', 'maldives', 'bali', 'goa', 'caribbean', 'hawaii', 'malibu', 'coast'];
    const mountainKeywords = ['mountain', 'hiking', 'trek', 'alps', 'peak', 'colorado', 'rockies', 'patagonia', 'himalaya', 'everest'];
    const cityKeywords = ['city', 'urban', 'paris', 'tokyo', 'york', 'barcelona', 'dubai', 'metro', 'downtown'];
    const adventureKeywords = ['adventure', 'extreme', 'sports', 'jumping', 'climbing', 'zip-line', 'safari', 'expedition'];
    const cultureKeywords = ['culture', 'temple', 'museum', 'historic', 'ancient', 'tradition', 'art', 'cultural'];
    const sportsKeywords = ['sport', 'football', 'soccer', 'cricket', 'rugby', 'basketball', 'tennis', 'skiing', 'surfing', 'cycling', 'marathon', 'race', 'gym', 'fitness'];

    if (beachKeywords.some(k => combined.includes(k))) return 'beach';
    if (mountainKeywords.some(k => combined.includes(k))) return 'mountain';
    if (cityKeywords.some(k => combined.includes(k))) return 'city';
    if (sportsKeywords.some(k => combined.includes(k))) return 'sports';
    if (adventureKeywords.some(k => combined.includes(k))) return 'adventure';
    if (cultureKeywords.some(k => combined.includes(k))) return 'culture';
    
    return 'all';
  };

  const getTripsBasedSuggestions = (category, question) => {
    // Get trips that match the category
    const matchingTrips = trips.filter(trip => {
      if (category === 'all') return true;
      return categorizeTrip(trip) === category;
    });

    // Generate suggestions based on existing trips and question
    const suggestions = [];

    // Suggest similar trips already created
    matchingTrips.slice(0, 2).forEach(trip => {
      suggestions.push(`📌 Similar trip: ${trip.title} (${trip.location})`);
    });

    // If fewer than 2 existing trips, add default suggestions
    if (matchingTrips.length < 2) {
      const catSuggestions = category === 'all' 
        ? Object.values(defaultSuggestions).flat()
        : defaultSuggestions[category] || [];
      
      const remaining = 2 - matchingTrips.length;
      catSuggestions.slice(0, remaining).forEach(sug => {
        suggestions.push(sug);
      });
    }

    // Add a custom suggestion based on the question
    const questionLower = question.toLowerCase();
    if (questionLower.includes('adventure')) {
      suggestions.push('💡 Consider trips with outdoor activities and hiking');
    } else if (questionLower.includes('relax') || questionLower.includes('beach')) {
      suggestions.push('💡 Look for destinations with water activities and resorts');
    } else if (questionLower.includes('culture') || questionLower.includes('history')) {
      suggestions.push('💡 Explore places with historical landmarks and local traditions');
    } else if (questionLower.includes('sport') || questionLower.includes('soccer') || questionLower.includes('football') || questionLower.includes('cricket') || questionLower.includes('fitness')) {
      suggestions.push('💡 Join sports-focused trips with athletic events and training');
    } else if (questionLower.includes('budget')) {
      suggestions.push('💡 Consider destinations with low cost of living');
    } else if (questionLower.includes('group')) {
      suggestions.push('💡 Join or create group trips for shared experiences');
    } else {
      suggestions.push('💡 Create a trip and share with the community!');
    }

    return suggestions.slice(0, 3);
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQ = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      question: newQuestion.trim(),
      category: selectedCategory,
      timestamp: new Date().toISOString(),
      responses: getTripsBasedSuggestions(selectedCategory, newQuestion)
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem('tripSuggestions', JSON.stringify(updated));
    setNewQuestion('');
  };

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  // Count of trips by category
  const getTripsCount = () => {
    const counts = {
      all: trips.length,
      beach: trips.filter(t => categorizeTrip(t) === 'beach').length,
      mountain: trips.filter(t => categorizeTrip(t) === 'mountain').length,
      city: trips.filter(t => categorizeTrip(t) === 'city').length,
      adventure: trips.filter(t => categorizeTrip(t) === 'adventure').length,
      culture: trips.filter(t => categorizeTrip(t) === 'culture').length,
      sports: trips.filter(t => categorizeTrip(t) === 'sports').length
    };
    return counts;
  };

  const tripCounts = getTripsCount();

  // Minimized state - show categories
  if (!isExpanded) {
    return (
      <div className="trip-suggestions-widget minimized">
        <button 
          onClick={() => setIsExpanded(true)}
          className="suggestion-toggle"
          title="Trip Suggestions"
        >
          <span className="icon">🗺️</span>
          <span className="label">Trip Ideas</span>
          <span className="trip-badge">{trips.length}</span>
        </button>
        
        <div className="quick-categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setIsExpanded(true);
              }}
              className="quick-cat-btn"
              title={`${cat.name} (${tripCounts[cat.id]})`}
            >
              {cat.icon}
              <span className="count">{tripCounts[cat.id]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Expanded state - show full interface
  return (
    <div className="trip-suggestions-widget expanded">
      {/* Header */}
      <div className="suggestions-header">
        <div className="header-content">
          <span className="icon">🗺️</span>
          <div className="header-text">
            <h3>Trip Suggestions</h3>
            <p>{trips.length} trips • {questions.length} questions</p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(false)}
          className="close-btn"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`tab ${selectedCategory === cat.id ? 'active' : ''}`}
            title={`${tripCounts[cat.id]} trips`}
          >
            {cat.icon}
            {cat.id !== 'all' && <span className="tab-count">{tripCounts[cat.id]}</span>}
          </button>
        ))}
      </div>

      {/* Questions & Suggestions */}
      <div className="questions-container">
        {filteredQuestions.length === 0 ? (
          <div className="empty-state">
            <p>🌟 No questions yet. Ask where you want to go!</p>
            {tripCounts[selectedCategory] > 0 && (
              <p className="tip">💡 {tripCounts[selectedCategory]} {categories.find(c => c.id === selectedCategory)?.name.split(' ')[1] || 'trip'}(s) available</p>
            )}
          </div>
        ) : (
          filteredQuestions.map(q => (
            <div key={q.id} className="question-item">
              <div className="q-header">
                <span className="username">{q.username}</span>
                <span className="time">
                  {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="question-text">❓ {q.question}</p>
              
              <div className="responses">
                {q.responses.map((resp, idx) => (
                  <div key={idx} className={`response-item ${resp.includes('📌') ? 'trip-match' : ''}`}>
                    <span className="response-icon">
                      {resp.includes('📌') ? '📌' : resp.includes('💡') ? '💡' : '✨'}
                    </span>
                    {resp}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleAskQuestion} className="suggestion-input-area">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={`Ask about ${selectedCategory === 'all' ? 'destinations' : categories.find(c => c.id === selectedCategory)?.name}...`}
          maxLength="200"
          className="suggestion-input"
        />
        <button type="submit" className="ask-btn" disabled={!newQuestion.trim()}>
          🚀
        </button>
      </form>
    </div>
  );
}

export default TripSuggestions;
