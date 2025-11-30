// Sentiment Analysis for Reviews
export const analyzeSentiment = (text) => {
  if (!text) return { score: 0, sentiment: 'neutral', confidence: 0 };

  const lowerText = text.toLowerCase();

  // Positive words
  const positiveWords = [
    'excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome',
    'loved', 'perfect', 'best', 'beautiful', 'outstanding', 'incredible',
    'professional', 'helpful', 'friendly', 'kind', 'thoughtful', 'organized',
    'well-planned', 'smooth', 'enjoyable', 'memorable', 'unforgettable',
    'impressed', 'satisfied', 'recommend', 'worthy', 'special', 'unique',
    'delightful', 'superb', 'brilliant', 'exceptional', 'brilliant'
  ];

  // Negative words
  const negativeWords = [
    'terrible', 'horrible', 'awful', 'bad', 'poor', 'worst',
    'hate', 'hated', 'disgusting', 'pathetic', 'useless', 'disappointing',
    'rude', 'unfriendly', 'disorganized', 'chaotic', 'messy', 'dirty',
    'late', 'delayed', 'broken', 'damaged', 'uncomfortable', 'dangerous',
    'scam', 'fraud', 'waste', 'regret', 'avoid', 'never', 'complained'
  ];

  const words = lowerText.split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[.,!?;:]/g, '');

    if (positiveWords.includes(cleanWord)) positiveCount++;
    if (negativeWords.includes(cleanWord)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) return { score: 0, sentiment: 'neutral', confidence: 0 };

  const score = (positiveCount - negativeCount) / total;
  let sentiment = 'neutral';
  let confidence = Math.abs(score);

  if (score > 0.3) sentiment = 'positive';
  else if (score < -0.3) sentiment = 'negative';

  return {
    score: parseFloat(score.toFixed(2)),
    sentiment,
    confidence: parseFloat(confidence.toFixed(2)),
    positiveCount,
    negativeCount
  };
};

export const getSentimentEmoji = (sentiment) => {
  const emojis = {
    positive: '😊',
    negative: '😞',
    neutral: '😐'
  };
  return emojis[sentiment] || '😐';
};

export const getSentimentColor = (sentiment) => {
  const colors = {
    positive: '#28a745',
    negative: '#dc3545',
    neutral: '#ffc107'
  };
  return colors[sentiment] || '#999';
};
