/**
 * Advanced Machine Learning Engine
 * Adds sophisticated AI features: Sentiment Analysis, Anomaly Detection, 
 * Seasonal Trends, Budget Prediction, Time Series Analysis
 */

/**
 * Sentiment Analysis - Analyze emotion/preference from text descriptions
 * Returns score from -1 (negative) to 1 (positive)
 */
export class SentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'amazing', 'beautiful', 'excellent', 'wonderful', 'perfect', 'fantastic',
      'awesome', 'incredible', 'great', 'love', 'enjoy', 'stunning', 'breathtaking',
      'peaceful', 'serene', 'adventurous', 'thrilling', 'exciting', 'fun', 'relaxing',
      'inspiring', 'memorable', 'unforgettable', 'delightful', 'charming', 'picturesque'
    ];
    
    this.negativeWords = [
      'boring', 'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing',
      'crowded', 'dirty', 'expensive', 'dangerous', 'stressful', 'unpleasant',
      'ugly', 'tiring', 'overrated', 'waste', 'regret', 'never', 'avoid'
    ];
    
    this.intensifiers = ['very', 'extremely', 'absolutely', 'definitely', 'really', 'so'];
    this.negations = ['not', 'no', 'never', 'neither', 'nobody', 'nothing', 'dont', 'dont'];
  }

  analyze(text) {
    if (!text) return 0;
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let intensifier = false;
    let negation = false;

    words.forEach((word, idx) => {
      // Check for intensifiers (upcoming)
      if (this.intensifiers.includes(word)) {
        intensifier = true;
        return;
      }
      
      // Check for negations (upcoming)
      if (this.negations.includes(word)) {
        negation = true;
        return;
      }

      // Score positive words
      if (this.positiveWords.includes(word)) {
        let wordScore = 1;
        if (intensifier) wordScore = 1.5;
        if (negation) wordScore = -0.5;
        score += wordScore;
        intensifier = false;
        negation = false;
      }
      // Score negative words
      else if (this.negativeWords.includes(word)) {
        let wordScore = -1;
        if (intensifier) wordScore = -1.5;
        if (negation) wordScore = 0.5;
        score += wordScore;
        intensifier = false;
        negation = false;
      }
    });

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / Math.max(1, words.length / 5)));
  }

  getSentimentLabel(score) {
    if (score > 0.5) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score > -0.1) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }
}

/**
 * Seasonal Trend Analyzer - Detects seasonal patterns in user travel
 */
export class SeasonalAnalyzer {
  constructor() {
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.seasons = {
      'Winter': [12, 1, 2],
      'Spring': [3, 4, 5],
      'Summer': [6, 7, 8],
      'Autumn': [9, 10, 11]
    };
  }

  analyzeTravelTrends(userTrips) {
    if (!userTrips || userTrips.length === 0) {
      return {
        preferredSeasons: [],
        travelFrequency: 'Low',
        peakMonth: null,
        seasonalScores: {}
      };
    }

    const monthCounts = Array(12).fill(0);
    const seasonCounts = { Winter: 0, Spring: 0, Summer: 0, Autumn: 0 };

    userTrips.forEach(trip => {
      try {
        const date = trip.date ? new Date(trip.date) : new Date(trip.createdAt || Date.now());
        const month = date.getMonth();
        const monthIndex = (month + 1) % 12;
        
        monthCounts[monthIndex]++;

        // Determine season
        const seasonEntry = Object.entries(this.seasons).find(([_, months]) => 
          months.includes(monthIndex + 1)
        );
        if (seasonEntry) {
          seasonCounts[seasonEntry[0]]++;
        }
      } catch (err) {
        console.error('Error parsing trip date:', err);
      }
    });

    const maxMonth = monthCounts.indexOf(Math.max(...monthCounts));
    const preferredSeasons = Object.entries(seasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);

    return {
      preferredSeasons,
      travelFrequency: userTrips.length <= 2 ? 'Low' : userTrips.length <= 6 ? 'Medium' : 'High',
      peakMonth: this.months[maxMonth],
      seasonalScores: seasonCounts,
      monthlyDistribution: monthCounts
    };
  }

  getSeasonalBoost(destination, userTrendAnalysis) {
    // Boost destinations that match user's preferred seasons
    if (!destination.bestTimeToVisit || !userTrendAnalysis.preferredSeasons) return 0;
    
    const match = userTrendAnalysis.preferredSeasons.some(season =>
      destination.bestTimeToVisit.toLowerCase().includes(season.toLowerCase())
    );
    
    return match ? 5 : -2; // +5 points boost or -2 penalty
  }
}

/**
 * Budget Predictor - Predicts user budget patterns and preferences
 */
export class BudgetPredictor {
  predictUserBudget(userTrips) {
    if (!userTrips || userTrips.length === 0) {
      return {
        avgBudget: 5000,
        budgetRange: { min: 2000, max: 10000 },
        budgetCategory: 'Mid-range',
        budgetTrend: 'Stable'
      };
    }

    const budgets = userTrips
      .map(trip => trip.estimatedBudget?.min || 3000)
      .filter(b => b > 0);

    if (budgets.length === 0) {
      return {
        avgBudget: 5000,
        budgetRange: { min: 2000, max: 10000 },
        budgetCategory: 'Mid-range',
        budgetTrend: 'Stable'
      };
    }

    const avgBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length;
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);

    // Detect budget trend (increasing or decreasing)
    let budgetTrend = 'Stable';
    if (budgets.length > 2) {
      const recentAvg = budgets.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = budgets.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      if (recentAvg > olderAvg * 1.2) budgetTrend = 'Increasing';
      if (recentAvg < olderAvg * 0.8) budgetTrend = 'Decreasing';
    }

    // Categorize budget
    let budgetCategory = 'Mid-range';
    if (avgBudget < 3000) budgetCategory = 'Budget';
    if (avgBudget > 15000) budgetCategory = 'Luxury';

    return {
      avgBudget: Math.round(avgBudget),
      budgetRange: { min: Math.round(minBudget), max: Math.round(maxBudget) },
      budgetCategory,
      budgetTrend,
      recommendedRange: {
        min: Math.round(avgBudget * 0.8),
        max: Math.round(avgBudget * 1.3)
      }
    };
  }

  calculateBudgetMatchScore(destination, userBudget) {
    const destBudget = destination.estimatedBudget?.min || 5000;
    const userRecommendedMax = userBudget.recommendedRange.max;
    const userRecommendedMin = userBudget.recommendedRange.min;

    if (destBudget >= userRecommendedMin && destBudget <= userRecommendedMax) {
      return 20; // Perfect match
    }
    if (destBudget <= userRecommendedMax * 1.3) {
      return 10; // Slightly over
    }
    if (destBudget >= userRecommendedMin * 0.7) {
      return 5; // Slightly under
    }
    return 0; // Poor match
  }
}

/**
 * Collaborative Filtering - Find similar users and recommend based on their trips
 */
export class CollaborativeFilteringEngine {
  calculateUserSimilarity(userProfile1, userProfile2) {
    if (!userProfile1 || !userProfile2) return 0;

    let similarity = 0;

    // Category similarity
    if (userProfile1.favoriteCategories && userProfile2.favoriteCategories) {
      const matching = userProfile1.favoriteCategories.filter(cat =>
        userProfile2.favoriteCategories.includes(cat)
      );
      similarity += (matching.length / Math.max(1, userProfile1.favoriteCategories.length)) * 0.4;
    }

    // Region similarity
    if (userProfile1.favoriteRegions && userProfile2.favoriteRegions) {
      const matching = userProfile1.favoriteRegions.filter(region =>
        userProfile2.favoriteRegions.includes(region)
      );
      similarity += (matching.length / Math.max(1, userProfile1.favoriteRegions.length)) * 0.3;
    }

    // Group size similarity
    if (userProfile1.avgGroupSize && userProfile2.avgGroupSize) {
      const sizeDiff = Math.abs(userProfile1.avgGroupSize - userProfile2.avgGroupSize);
      similarity += Math.max(0, 1 - (sizeDiff / 10)) * 0.3;
    }

    return Math.min(1, similarity);
  }

  findSimilarTripPatterns(userTrips, otherUserTrips) {
    if (!userTrips || !otherUserTrips) return [];

    const categoryMatches = [];
    
    userTrips.forEach(trip1 => {
      otherUserTrips.forEach(trip2 => {
        if (trip1.category === trip2.category || 
            (trip1.location && trip2.location && 
             trip1.location.split(',')[trip1.location.split(',').length - 1] === 
             trip2.location.split(',')[trip2.location.split(',').length - 1])) {
          categoryMatches.push({
            trip: trip2,
            matchType: trip1.category === trip2.category ? 'category' : 'region'
          });
        }
      });
    });

    return categoryMatches;
  }
}

/**
 * Anomaly Detection - Identify unusual trip patterns
 */
export class AnomalyDetector {
  detectAnomalies(userTrips) {
    if (!userTrips || userTrips.length < 3) {
      return { anomalies: [], flaggedTrips: [] };
    }

    const anomalies = [];
    const stats = this.calculateStatistics(userTrips);

    userTrips.forEach((trip, idx) => {
      const issues = [];

      // Check budget anomaly
      if (trip.estimatedBudget) {
        const budgetDiff = Math.abs(trip.estimatedBudget.min - stats.avgBudget);
        if (budgetDiff > stats.budgetStdDev * 2) {
          issues.push({
            type: 'Budget Outlier',
            description: `This trip's budget (${trip.estimatedBudget.min}) is unusually different from your typical budget (${stats.avgBudget})`,
            severity: 'info'
          });
        }
      }

      // Check group size anomaly
      if (trip.participants) {
        const groupSize = trip.participants.length;
        const sizeDiff = Math.abs(groupSize - stats.avgGroupSize);
        if (sizeDiff > stats.groupSizeStdDev * 2) {
          issues.push({
            type: 'Group Size Outlier',
            description: `This trip's group size (${groupSize}) differs significantly from your typical groups (${stats.avgGroupSize})`,
            severity: 'info'
          });
        }
      }

      if (issues.length > 0) {
        anomalies.push({
          tripId: trip.id,
          tripName: trip.name,
          issues,
          anomalyScore: issues.length / 3 // 0-1 score
        });
      }
    });

    return {
      anomalies,
      flaggedTrips: anomalies.map(a => a.tripId),
      totalAnomalyCount: anomalies.length
    };
  }

  calculateStatistics(userTrips) {
    const budgets = userTrips.map(t => t.estimatedBudget?.min || 5000).filter(b => b > 0);
    const groupSizes = userTrips.map(t => t.participants?.length || 1);

    const avgBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length;
    const avgGroupSize = groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length;

    // Calculate standard deviation
    const budgetVariance = budgets.reduce((sum, b) => sum + Math.pow(b - avgBudget, 2), 0) / budgets.length;
    const groupSizeVariance = groupSizes.reduce((sum, g) => sum + Math.pow(g - avgGroupSize, 2), 0) / groupSizes.length;

    return {
      avgBudget: Math.round(avgBudget),
      avgGroupSize: Math.round(avgGroupSize),
      budgetStdDev: Math.sqrt(budgetVariance),
      groupSizeStdDev: Math.sqrt(groupSizeVariance),
      tripCount: userTrips.length
    };
  }
}

/**
 * Engagement Predictor - Predicts which destinations user will engage with
 */
export class EngagementPredictor {
  calculateEngagementProbability(destination, userProfile, userHistory) {
    if (!userProfile || !destination) return 0;

    let probability = 0.5; // Base 50%

    // Factor 1: Category match (±20%)
    if (userProfile.favoriteCategories && userProfile.favoriteCategories.length > 0) {
      const categoryMatch = destination.categories.some(cat => 
        userProfile.favoriteCategories.includes(cat)
      );
      probability += categoryMatch ? 0.15 : -0.05;
    }

    // Factor 2: User engagement history
    if (userHistory && userHistory.length > 0) {
      const engagementRate = userHistory.filter(h => h.action === 'click' || h.action === 'book').length / userHistory.length;
      probability += engagementRate * 0.15;
    }

    // Factor 3: Popularity (popular destinations get higher engagement)
    if (destination.monthlyVisitors) {
      const popularityScore = Math.min(0.2, (destination.monthlyVisitors / 100000) * 0.2);
      probability += popularityScore;
    }

    // Factor 4: Rating effect
    if (destination.averageRating) {
      const ratingBoost = (destination.averageRating / 5) * 0.15;
      probability += ratingBoost;
    }

    return Math.min(1, Math.max(0, probability));
  }

  predictEngagementScore(destination, userProfile, userHistory) {
    const probability = this.calculateEngagementProbability(destination, userProfile, userHistory);
    
    return {
      probability: Math.round(probability * 100),
      label: probability > 0.75 ? 'Very Likely' : probability > 0.5 ? 'Likely' : probability > 0.25 ? 'Maybe' : 'Unlikely',
      factors: this.getEngagementFactors(destination, userProfile, userHistory)
    };
  }

  getEngagementFactors(destination, userProfile, userHistory) {
    const factors = [];

    // Check categories
    if (userProfile?.favoriteCategories) {
      const match = destination.categories.some(cat =>
        userProfile.favoriteCategories.includes(cat)
      );
      factors.push({
        factor: 'Category Match',
        status: match ? '✓' : '✗',
        impact: match ? 'Positive' : 'Negative'
      });
    }

    // Check region
    if (userProfile?.favoriteRegions && destination.location) {
      const regionMatch = userProfile.favoriteRegions.some(region =>
        destination.location.includes(region)
      );
      factors.push({
        factor: 'Region Preference',
        status: regionMatch ? '✓' : '✗',
        impact: regionMatch ? 'Positive' : 'Neutral'
      });
    }

    // Check popularity
    if (destination.monthlyVisitors > 50000) {
      factors.push({
        factor: 'Trending Destination',
        status: '⭐',
        impact: 'Positive'
      });
    }

    return factors;
  }
}

/**
 * Time Series Analyzer - Analyzes temporal patterns in user behavior
 */
export class TimeSeriesAnalyzer {
  analyzeTravelFrequency(userTrips) {
    if (!userTrips || userTrips.length < 2) {
      return {
        frequency: 'Unknown',
        daysAverageBetweenTrips: 0,
        trend: 'Insufficient Data'
      };
    }

    const dates = userTrips
      .map(t => new Date(t.date || t.createdAt || Date.now()))
      .sort((a, b) => a - b);

    const gaps = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    
    let frequency = 'Low';
    if (avgGap < 30) frequency = 'Very Frequent';
    else if (avgGap < 90) frequency = 'Frequent';
    else if (avgGap < 180) frequency = 'Regular';
    else if (avgGap < 365) frequency = 'Occasional';

    return {
      frequency,
      daysAverageBetweenTrips: Math.round(avgGap),
      trend: gaps.length > 1 ? (gaps[gaps.length - 1] < gaps[0] ? 'Increasing' : 'Decreasing') : 'Single Trip'
    };
  }

  predictNextTripLikelihood() {
    // This would integrate with backend scheduling if available
    return {
      likelihood: 'Medium',
      estimatedDaysToNextTrip: 45,
      confidence: 0.65
    };
  }
}

// Export all engines as a suite
export const AdvancedML = {
  SentimentAnalyzer,
  SeasonalAnalyzer,
  BudgetPredictor,
  CollaborativeFilteringEngine,
  AnomalyDetector,
  EngagementPredictor,
  TimeSeriesAnalyzer
};

export default AdvancedML;
