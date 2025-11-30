import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TripSuggestions.css';
import AIRecommendationEngine from '../utils/aiRecommendationEngine';
import DESTINATION_DATASET from '../utils/destinationDataset';
import { generateEmbedding } from '../utils/embeddingUtils';
import { subscribeToTrips } from '../firebaseUtils';

function TripSuggestions({ currentUser }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [aiEngine] = useState(new AIRecommendationEngine(DESTINATION_DATASET));
  const [travelPersona, setTravelPersona] = useState('Explorer');
  const [noResults, setNoResults] = useState(false);
  const [userInsights, setUserInsights] = useState(null);
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false);

  // Extract region from location
  const extractRegion = useCallback((location) => {
    const parts = location.split(',');
    return parts[parts.length - 1]?.trim() || location;
  }, []);

  // Analyze user preferences from their trip history (both created and joined)
  const analyzeUserPreferences = useCallback((allTrips, userId) => {
    // Include both trips the user created AND trips they joined
    const userTrips = allTrips.filter(trip => 
      (trip.createdBy === userId) || (trip.participants && trip.participants.includes(userId))
    );

    const preferences = {
      favoriteCategories: [],
      favoriteRegions: [],
      budgetRange: { min: 0, max: 5000 },
      avgGroupSize: 3,
      preferredDuration: 'medium',
      categories: {},
      locations: {}
    };

    if (userTrips.length > 0) {
      const categoryCount = {};
      const locationCount = {};
      
      userTrips.forEach(trip => {
        if (trip.category) {
          categoryCount[trip.category] = (categoryCount[trip.category] || 0) + 1;
        }
        if (trip.location) {
          const region = extractRegion(trip.location);
          locationCount[region] = (locationCount[region] || 0) + 1;
        }
      });

      preferences.favoriteCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);
      
      preferences.favoriteRegions = Object.entries(locationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([region]) => region);

      preferences.categories = categoryCount;
      preferences.locations = locationCount;

      const avgSize = userTrips.reduce((sum, t) => sum + (t.participants?.length || 1), 0) / userTrips.length;
      preferences.avgGroupSize = Math.round(avgSize) || 3;
    }

    return preferences;
  }, [extractRegion]);

  // Generate AI suggestions using advanced engine
  const generateAISuggestionsWithEngine = useCallback((userProfile, filters, userTrips, engine) => {
    const tripsWithEmbeddings = userTrips.map(trip => ({
      ...trip,
      embedding: generateEmbedding(trip.category + ' ' + trip.location + ' ' + (trip.description || ''))
    }));

    const recs = engine.generateRecommendations(userProfile, filters, tripsWithEmbeddings);
    
    if (recs.length === 0) {
      setNoResults(true);
      setSuggestions([]);
    } else {
      setNoResults(false);
      setSuggestions(recs);
    }

    recs.forEach(rec => {
      engine.trackInteraction(rec.id, 'view');
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // Subscribe to Firebase trips instead of using localStorage
    const unsubscribe = subscribeToTrips((firebaseTrips) => {
      try {
        const storedTrips = firebaseTrips || [];
        
        const analyzedPreferences = analyzeUserPreferences(storedTrips, currentUser?.id);
        
        const userProfileEmbedding = generateEmbedding(
          (analyzedPreferences.favoriteCategories || []).join(' ') + ' ' +
          (analyzedPreferences.favoriteRegions || []).join(' ')
        );
        
        const enhancedUserProfile = {
          ...analyzedPreferences,
          embedding: userProfileEmbedding,
          id: currentUser?.id
        };
        
        setUserPreferences(enhancedUserProfile);
        
        generateAISuggestionsWithEngine(
          enhancedUserProfile, 
          selectedInterests, 
          storedTrips,
          aiEngine
        );
        
        const persona = aiEngine.generateTravelPersona(enhancedUserProfile, storedTrips);
        setTravelPersona(persona);
        // Generate comprehensive user insights
        const insights = aiEngine.generateUserInsights(enhancedUserProfile, storedTrips);
        setUserInsights(insights);

        // Chat groups and messages are now in Firebase
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading suggestions:', err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser, selectedInterests, aiEngine, analyzeUserPreferences, generateAISuggestionsWithEngine]);

  // Handle interest selection
  const handleInterestToggle = (category) => {
    setSelectedInterests(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Get message info for a destination
  const getDestinationMessageInfo = (destination) => {
    // Messages are now in Firebase
    return { count: 0, latestMessage: null, groupId: null };
  };

  if (loading) {
    return (
      <div className="container">
        <h1>🤖 AI Trip Suggestions</h1>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading AI suggestions...</div>
      </div>
    );
  }

  return (
    <div className="container suggestions-container">
      <div className="suggestions-header">
        <div>
          <h1>🤖 AI Trip Suggestions</h1>
          <p className="header-subtitle">Personalized recommendations based on your travel preferences</p>
          {travelPersona && <p className="travel-persona">Your travel style: <strong>{travelPersona}</strong></p>}
        </div>
      </div>

      {/* NEW: Advanced AI Insights Toggle */}
      {userInsights && (
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setShowAdvancedInsights(!showAdvancedInsights)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9em'
            }}
          >
            🧠 {showAdvancedInsights ? 'Hide' : 'Show'} Advanced AI Insights
          </button>
        </div>
      )}

      {/* NEW: Advanced AI Insights Display */}
      {showAdvancedInsights && userInsights && (
        <div className="advanced-insights-section">
          <h2>🧠 Advanced AI Insights</h2>
          <div className="insights-grid">
            {/* Budget Analysis */}
            {userInsights.budgetAnalysis && (
              <div className="insight-card">
                <h3>💰 Budget Pattern</h3>
                <p><strong>Category:</strong> {userInsights.budgetAnalysis.budgetCategory}</p>
                <p><strong>Average Budget:</strong> ₹{userInsights.budgetAnalysis.avgBudget}</p>
                <p><strong>Range:</strong> ₹{userInsights.budgetAnalysis.budgetRange.min} - ₹{userInsights.budgetAnalysis.budgetRange.max}</p>
                <p><strong>Trend:</strong> {userInsights.budgetAnalysis.budgetTrend}</p>
              </div>
            )}

            {/* Seasonal Trends */}
            {userInsights.seasonalTrends && userInsights.seasonalTrends.preferredSeasons.length > 0 && (
              <div className="insight-card">
                <h3>🌤️ Seasonal Preferences</h3>
                <p><strong>Peak Month:</strong> {userInsights.seasonalTrends.peakMonth}</p>
                <p><strong>Preferred Seasons:</strong> {userInsights.seasonalTrends.preferredSeasons.join(', ')}</p>
                <p><strong>Travel Frequency:</strong> {userInsights.seasonalTrends.travelFrequency}</p>
              </div>
            )}

            {/* Travel Frequency */}
            {userInsights.travelFrequency && (
              <div className="insight-card">
                <h3>📅 Travel Frequency</h3>
                <p><strong>Pattern:</strong> {userInsights.travelFrequency.frequency}</p>
                <p><strong>Days Between Trips:</strong> ~{userInsights.travelFrequency.daysAverageBetweenTrips} days</p>
                <p><strong>Trend:</strong> {userInsights.travelFrequency.trend}</p>
              </div>
            )}

            {/* Anomalies */}
            {userInsights.anomalies && userInsights.anomalies.totalAnomalyCount > 0 && (
              <div className="insight-card" style={{ backgroundColor: '#fff3cd' }}>
                <h3>⚠️ Unusual Patterns Detected</h3>
                <p><strong>Count:</strong> {userInsights.anomalies.totalAnomalyCount} anomal{userInsights.anomalies.totalAnomalyCount > 1 ? 'ies' : 'y'}</p>
                {userInsights.anomalies.anomalies.slice(0, 2).map((anomaly, idx) => (
                  <p key={idx} style={{ fontSize: '0.85em', marginTop: '5px' }}>
                    • {anomaly.tripName}: {anomaly.issues[0]?.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Preferences Display */}
      {userPreferences && (
        <div className="preferences-section">
          <h2>Your Travel Profile</h2>
          <div className="preferences-grid">
            {userPreferences.favoriteCategories && userPreferences.favoriteCategories.length > 0 && (
              <div className="preference-card">
                <h3>🏷️ Favorite Categories</h3>
                <div className="category-list">
                  {userPreferences.favoriteCategories.map((category) => (
                    <span key={category} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {userPreferences.favoriteRegions && userPreferences.favoriteRegions.length > 0 && (
              <div className="preference-card">
                <h3>📍 Favorite Regions</h3>
                <div className="region-list">
                  {userPreferences.favoriteRegions.map((region) => (
                    <span key={region} className="region-tag">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="preference-card">
              <h3>👥 Group Size</h3>
              <p className="preference-value">
                {userPreferences.avgGroupSize > 0 
                  ? `Average: ${userPreferences.avgGroupSize} members`
                  : 'No trips yet - Start exploring!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interest Filter */}
      <div className="filter-section">
        <h2>Filter by Interest (Real-time AI Re-ranking)</h2>
        <div className="interest-buttons">
          {['Beach', 'Mountain', 'City', 'Adventure', 'Culture', 'Sports'].map(interest => (
            <button
              key={interest}
              className={`interest-btn ${selectedInterests.includes(interest) ? 'active' : ''}`}
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="suggestions-section">
        <h2>
          {suggestions.length > 0 
            ? `🎯 ${suggestions.length} AI-Powered Recommendations`
            : noResults ? '❌ No suggestions found' : '📍 Loading recommendations...'}
        </h2>

        {suggestions.length > 0 ? (
          <div className="suggestions-grid">
            {suggestions.map((destination, index) => (
              <div key={destination.id} className="suggestion-card">
                {/* AI Match Badge */}
                <div className="ai-score-badge">
                  <span className="score-label">AI Match</span>
                  <span className="score-value">{destination.matchPercentage}%</span>
                </div>

                {/* Destination Image */}
                <div 
                  className="suggestion-image"
                  style={{ backgroundImage: `url('${destination.image}')` }}
                >
                  <div className="trip-rank">#{index + 1}</div>
                </div>

                {/* Destination Details */}
                <div className="suggestion-details">
                  <h3>{destination.name}</h3>
                  <p className="trip-category">
                    {destination.categories.join(', ')}
                  </p>
                  <p className="trip-location">📍 {destination.location}</p>
                  
                  <p className="trip-description">{destination.description}</p>

                  {/* AI Scoring Breakdown */}
                  <div className="ai-scores-breakdown">
                    <div className="score-item">
                      <span>Preference Match:</span>
                      <span className="score-num">{destination.aiScores.preferenceMatch.toFixed(1)}/40</span>
                    </div>
                    <div className="score-item">
                      <span>Group Size:</span>
                      <span className="score-num">{destination.aiScores.groupSizeCompatibility.toFixed(1)}/20</span>
                    </div>
                    <div className="score-item">
                      <span>Popularity:</span>
                      <span className="score-num">{destination.aiScores.popularity.toFixed(1)}/20</span>
                    </div>
                    <div className="score-item">
                      <span>Travel Style:</span>
                      <span className="score-num">{destination.aiScores.embeddingSimilarity.toFixed(1)}/20</span>
                    </div>
                    {/* NEW: Advanced ML Scores */}
                    {destination.aiScores.seasonalBoost !== undefined && (
                      <div className="score-item advanced-score">
                        <span>Seasonal Match:</span>
                        <span className="score-num">{destination.aiScores.seasonalBoost.toFixed(1)}</span>
                      </div>
                    )}
                    {destination.aiScores.budgetMatch !== undefined && (
                      <div className="score-item advanced-score">
                        <span>Budget Fit:</span>
                        <span className="score-num">{destination.aiScores.budgetMatch.toFixed(1)}</span>
                      </div>
                    )}
                    {destination.aiScores.sentimentAlignment !== undefined && (
                      <div className="score-item advanced-score">
                        <span>Vibe Match:</span>
                        <span className="score-num">{(destination.aiScores.sentimentAlignment * 10).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* NEW: Engagement Prediction */}
                  {destination.advancedInsights && destination.advancedInsights.engagementPrediction && (
                    <div className="engagement-prediction">
                      <p className="engagement-label">📊 Engagement Likelihood:</p>
                      <p className="engagement-value">{destination.advancedInsights.engagementPrediction.label}</p>
                      <div style={{ fontSize: '0.75em', marginTop: '4px', opacity: 0.9 }}>
                        {destination.advancedInsights.engagementPrediction.factors.slice(0, 2).map((factor, idx) => (
                          <div key={idx}>{factor.factor}: {factor.status}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why Recommended */}
                  <div className="ai-reasons">
                    <p className="reasons-label">💡 Why recommended:</p>
                    <ul>
                      {destination.explanation.slice(0, 2).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Trip Info Cards */}
                  <div className="trip-info-cards">
                    <div className="info-card">
                      <span className="info-label">Budget</span>
                      <span className="info-value">₹{destination.estimatedBudget.min}-{destination.estimatedBudget.max}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Best Time</span>
                      <span className="info-value">{destination.bestTimeToVisit}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Duration</span>
                      <span className="info-value">{destination.recommendedTripLength}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Ideal Group</span>
                      <span className="info-value">{destination.idealGroupSize} people</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="highlights">
                    <p className="highlights-label">Highlights:</p>
                    <div className="highlights-tags">
                      {destination.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="highlight-tag">{highlight}</span>
                      ))}
                    </div>
                  </div>

                  {/* Trip Stats */}
                  <div className="trip-stats">
                    <span>⭐ {destination.averageRating}/5</span>
                    <span>•</span>
                    <span>👥 ~{destination.monthlyVisitors.toLocaleString()} visitors/month</span>
                  </div>

                  {/* Messages Preview */}
                  {getDestinationMessageInfo(destination).count > 0 && (
                    <div className="messages-preview">
                      <div className="preview-header">💬 Discussion ({getDestinationMessageInfo(destination).count})</div>
                      {getDestinationMessageInfo(destination).latestMessage && (
                        <div className="preview-message">
                          <strong>{getDestinationMessageInfo(destination).latestMessage.username}:</strong>
                          <p>{getDestinationMessageInfo(destination).latestMessage.message.substring(0, 60)}...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Button */}
                  <div className="suggestion-actions">
                    <button 
                      className="btn-navigate"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(destination.location)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      📍 View Location
                    </button>
                    {(() => {
                      const messageInfo = getDestinationMessageInfo(destination);
                      return (
                        <button 
                          className="btn-chat"
                          onClick={() => {
                            let virtualGroupId = messageInfo.groupId;
                            
                            // If no existing group, create one
                            if (!virtualGroupId) {
                              virtualGroupId = `destination_${destination.id}_${Date.now()}`;
                              const virtualGroup = {
                                id: virtualGroupId,
                                name: `${destination.name} Discussion`,
                                description: `Real-time discussion about ${destination.name}`,
                                destination: destination.name,
                                location: destination.location,
                                category: destination.categories[0],
                                createdBy: currentUser?.id || currentUser?.uid,
                                participants: [currentUser?.id || currentUser?.uid],
                                createdAt: new Date().toISOString(),
                                isVirtualDestinationChat: true
                              };
                              
                              // Virtual groups are now handled in Firebase
                              // No need to store in localStorage anymore
                              console.log('Virtual group created:', virtualGroup);
                            }
                            
                            // Navigate to the group chat with the virtual group info
                            navigate(`/destination-chat/${virtualGroupId}`);
                          }}
                        >
                          💬 Chat {messageInfo.count > 0 ? `(${messageInfo.count})` : ''}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className="no-suggestions">
            <p>No trips match your selected interests yet.</p>
            <p>Try adjusting your filters or explore other categories!</p>
          </div>
        ) : null}
      </div>

      {/* AI Info */}
      <div className="ai-info-section">
        <h3>🤖 How AI Suggestions Work</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">📊</span>
            <p>Analyzes your trip history and preferences</p>
          </div>
          <div className="info-item">
            <span className="info-icon">🎯</span>
            <p>Matches similar categories and locations</p>
          </div>
          <div className="info-item">
            <span className="info-icon">👥</span>
            <p>Considers group size compatibility</p>
          </div>
          <div className="info-item">
            <span className="info-icon">⭐</span>
            <p>Scores trips based on popularity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripSuggestions;
