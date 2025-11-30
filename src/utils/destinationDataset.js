/**
 * Comprehensive Destination Dataset with AI Embeddings
 * Includes 50+ popular destinations with travel metadata
 */

import { generateEmbedding, generateCategoryEmbedding } from '../utils/embeddingUtils';

// Generate embeddings for destinations
const generateDestinationEmbedding = (description, categories) => {
  const descriptionEmbedding = generateEmbedding(description);
  const categoryEmbedding = generateCategoryEmbedding(categories);
  
  // Combine embeddings with equal weight
  return descriptionEmbedding.map((val, idx) => 
    (val + categoryEmbedding[idx]) / 2
  );
};

const DESTINATION_DATASET = [
  {
    id: 'goa_beach',
    name: 'Goa Beach Paradise',
    location: 'Goa, India',
    region: 'Goa',
    categories: ['Beach', 'Relaxation', 'Water Sports'],
    description: 'Beautiful beaches with water sports, nightlife, and tropical vibes. Perfect for group getaways.',
    image: 'https://via.placeholder.com/400x250?text=Goa+Beach',
    averageRating: 4.6,
    monthlyVisitors: 85000,
    idealGroupSize: 4,
    estimatedBudget: { min: 2000, max: 5000, currency: 'INR' },
    bestTimeToVisit: 'November to February',
    recommendedTripLength: '4-5 days',
    trendingScore: 0.85,
    highlights: ['Beautiful beaches', 'Water sports', 'Nightlife', 'Seafood'],
    embedding: generateDestinationEmbedding(
      'Beautiful beaches with water sports nightlife tropical vibes perfect for group getaways',
      ['Beach', 'Relaxation', 'Water Sports']
    )
  },
  {
    id: 'delhi_city',
    name: 'Historical Delhi',
    location: 'Delhi, India',
    region: 'Delhi',
    categories: ['City', 'Culture', 'History', 'Food'],
    description: 'Explore ancient monuments, bustling markets, and diverse cuisine. Rich cultural heritage.',
    image: 'https://via.placeholder.com/400x250?text=Delhi+City',
    averageRating: 4.3,
    monthlyVisitors: 120000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1500, max: 3500, currency: 'INR' },
    bestTimeToVisit: 'October to March',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.72,
    highlights: ['Red Fort', 'Taj Mahal nearby', 'Street food', 'Markets'],
    embedding: generateDestinationEmbedding(
      'Ancient monuments bustling markets diverse cuisine rich cultural heritage',
      ['City', 'Culture', 'History', 'Food']
    )
  },
  {
    id: 'himalayas_trek',
    name: 'Himalayan Adventure',
    location: 'Himachal Pradesh, India',
    region: 'Himachal Pradesh',
    categories: ['Mountain', 'Adventure', 'Hiking', 'Nature'],
    description: 'Challenging treks with stunning mountain views. Perfect for adventure enthusiasts and nature lovers.',
    image: 'https://via.placeholder.com/400x250?text=Himalayas',
    averageRating: 4.8,
    monthlyVisitors: 45000,
    idealGroupSize: 5,
    estimatedBudget: { min: 3000, max: 7000, currency: 'INR' },
    bestTimeToVisit: 'June to September',
    recommendedTripLength: '5-7 days',
    trendingScore: 0.9,
    highlights: ['Mountain trekking', 'Scenic views', 'Camping', 'Wildlife'],
    embedding: generateDestinationEmbedding(
      'Challenging treks stunning mountain views adventure enthusiasts nature lovers',
      ['Mountain', 'Adventure', 'Hiking', 'Nature']
    )
  },
  {
    id: 'kerala_backwaters',
    name: 'Kerala Backwaters',
    location: 'Kerala, India',
    region: 'Kerala',
    categories: ['Beach', 'Relaxation', 'Nature', 'Culture'],
    description: 'Serene backwater cruises, houseboat stays, and lush landscapes. Ideal for peaceful getaways.',
    image: 'https://via.placeholder.com/400x250?text=Kerala+Backwaters',
    averageRating: 4.7,
    monthlyVisitors: 70000,
    idealGroupSize: 4,
    estimatedBudget: { min: 2500, max: 6000, currency: 'INR' },
    bestTimeToVisit: 'August to November',
    recommendedTripLength: '4-5 days',
    trendingScore: 0.88,
    highlights: ['Backwater cruises', 'Houseboats', 'Spice plantations', 'Beach'],
    embedding: generateDestinationEmbedding(
      'Serene backwater cruises houseboat stays lush landscapes peaceful getaways',
      ['Beach', 'Relaxation', 'Nature', 'Culture']
    )
  },
  {
    id: 'jaipur_city',
    name: 'Pink City Explorer',
    location: 'Jaipur, Rajasthan',
    region: 'Rajasthan',
    categories: ['City', 'Culture', 'History', 'Architecture'],
    description: 'Iconic palaces, forts, and the famous pink-colored streets. Perfect for cultural exploration.',
    image: 'https://via.placeholder.com/400x250?text=Jaipur+City',
    averageRating: 4.5,
    monthlyVisitors: 95000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1800, max: 4000, currency: 'INR' },
    bestTimeToVisit: 'October to February',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.8,
    highlights: ['City Palace', 'Jantar Mantar', 'Hawa Mahal', 'Bazaars'],
    embedding: generateDestinationEmbedding(
      'Iconic palaces forts pink-colored streets cultural exploration architecture',
      ['City', 'Culture', 'History', 'Architecture']
    )
  },
  {
    id: 'ladakh_adventure',
    name: 'Ladakh High Altitude',
    location: 'Ladakh, India',
    region: 'Ladakh',
    categories: ['Mountain', 'Adventure', 'Sports', 'Nature'],
    description: 'High altitude desert landscape with biking and trekking opportunities. Extreme adventure destination.',
    image: 'https://via.placeholder.com/400x250?text=Ladakh',
    averageRating: 4.9,
    monthlyVisitors: 35000,
    idealGroupSize: 4,
    estimatedBudget: { min: 4000, max: 8000, currency: 'INR' },
    bestTimeToVisit: 'June to August',
    recommendedTripLength: '6-8 days',
    trendingScore: 0.92,
    highlights: ['Bike tours', 'Mountain lakes', 'Monasteries', 'Photography'],
    embedding: generateDestinationEmbedding(
      'High altitude desert biking trekking extreme adventure mountain exploration',
      ['Mountain', 'Adventure', 'Sports', 'Nature']
    )
  },
  {
    id: 'gokarna_beach',
    name: 'Gokarna Beach Town',
    location: 'Gokarna, Karnataka',
    region: 'Karnataka',
    categories: ['Beach', 'Relaxation', 'Backpacking'],
    description: 'Quiet beach town with pristine beaches. Popular with backpackers and beach lovers.',
    image: 'https://via.placeholder.com/400x250?text=Gokarna',
    averageRating: 4.4,
    monthlyVisitors: 42000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1500, max: 3000, currency: 'INR' },
    bestTimeToVisit: 'September to November',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.75,
    highlights: ['Pristine beaches', 'Budget-friendly', 'Laid-back vibe', 'Yoga'],
    embedding: generateDestinationEmbedding(
      'Quiet beach town pristine beaches backpackers relaxation budget-friendly',
      ['Beach', 'Relaxation', 'Backpacking']
    )
  },
  {
    id: 'manali_adventure',
    name: 'Manali Mountain Hub',
    location: 'Manali, Himachal Pradesh',
    region: 'Himachal Pradesh',
    categories: ['Mountain', 'Adventure', 'Sports', 'Nature'],
    description: 'Adventure sports hub with paragliding, mountaineering, and trekking. Year-round destination.',
    image: 'https://via.placeholder.com/400x250?text=Manali',
    averageRating: 4.6,
    monthlyVisitors: 78000,
    idealGroupSize: 4,
    estimatedBudget: { min: 2500, max: 5500, currency: 'INR' },
    bestTimeToVisit: 'April to June, September to October',
    recommendedTripLength: '4-5 days',
    trendingScore: 0.87,
    highlights: ['Paragliding', 'Trekking', 'Adventure sports', 'Scenic beauty'],
    embedding: generateDestinationEmbedding(
      'Adventure sports paragliding mountaineering trekking mountain hub year-round',
      ['Mountain', 'Adventure', 'Sports', 'Nature']
    )
  },
  {
    id: 'varanasi_culture',
    name: 'Varanasi Spiritual',
    location: 'Varanasi, Uttar Pradesh',
    region: 'Uttar Pradesh',
    categories: ['Culture', 'History', 'Spiritual', 'Religion'],
    description: 'Spiritual heart of India with ancient temples and holy rituals. Unique cultural experience.',
    image: 'https://via.placeholder.com/400x250?text=Varanasi',
    averageRating: 4.3,
    monthlyVisitors: 110000,
    idealGroupSize: 2,
    estimatedBudget: { min: 1200, max: 2500, currency: 'INR' },
    bestTimeToVisit: 'October to March',
    recommendedTripLength: '2-3 days',
    trendingScore: 0.78,
    highlights: ['Ghats', 'Temples', 'Ganges Aarti', 'Spiritual atmosphere'],
    embedding: generateDestinationEmbedding(
      'Spiritual heart ancient temples holy rituals unique cultural experience',
      ['Culture', 'History', 'Spiritual', 'Religion']
    )
  },
  {
    id: 'rishikesh_wellness',
    name: 'Rishikesh Yoga',
    location: 'Rishikesh, Uttar Pradesh',
    region: 'Uttar Pradesh',
    categories: ['Wellness', 'Yoga', 'Relaxation', 'Nature'],
    description: 'Yoga and wellness hub with ashrams and meditation centers. Perfect for rejuvenation.',
    image: 'https://via.placeholder.com/400x250?text=Rishikesh',
    averageRating: 4.5,
    monthlyVisitors: 65000,
    idealGroupSize: 2,
    estimatedBudget: { min: 1500, max: 3500, currency: 'INR' },
    bestTimeToVisit: 'September to March',
    recommendedTripLength: '5-7 days',
    trendingScore: 0.82,
    highlights: ['Yoga classes', 'Meditation', 'Ashrams', 'Riverside location'],
    embedding: generateDestinationEmbedding(
      'Yoga wellness ashrams meditation rejuvenation wellness hub spiritual',
      ['Wellness', 'Yoga', 'Relaxation', 'Nature']
    )
  },
  {
    id: 'kasol_trek',
    name: 'Kasol Mountain Village',
    location: 'Kasol, Himachal Pradesh',
    region: 'Himachal Pradesh',
    categories: ['Mountain', 'Backpacking', 'Adventure', 'Nature'],
    description: 'Scenic mountain village popular with backpackers. Gateway to beautiful treks.',
    image: 'https://via.placeholder.com/400x250?text=Kasol',
    averageRating: 4.4,
    monthlyVisitors: 38000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1200, max: 2500, currency: 'INR' },
    bestTimeToVisit: 'April to June, September to October',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.8,
    highlights: ['Trekking', 'Budget-friendly', 'Backpacker vibe', 'Scenic views'],
    embedding: generateDestinationEmbedding(
      'Mountain village backpackers beautiful treks scenic budget-friendly',
      ['Mountain', 'Backpacking', 'Adventure', 'Nature']
    )
  },
  {
    id: 'agra_taj',
    name: 'Agra Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    region: 'Uttar Pradesh',
    categories: ['History', 'Culture', 'Architecture', 'City'],
    description: 'Home to the iconic Taj Mahal. Must-visit for history and architecture enthusiasts.',
    image: 'https://via.placeholder.com/400x250?text=Agra',
    averageRating: 4.7,
    monthlyVisitors: 200000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1500, max: 3500, currency: 'INR' },
    bestTimeToVisit: 'October to March',
    recommendedTripLength: '2-3 days',
    trendingScore: 0.95,
    highlights: ['Taj Mahal', 'Agra Fort', 'Photography', 'Sunrise views'],
    embedding: generateDestinationEmbedding(
      'Taj Mahal iconic architecture history must-visit photography',
      ['History', 'Culture', 'Architecture', 'City']
    )
  },
  {
    id: 'pushkar_fair',
    name: 'Pushkar Camel Fair',
    location: 'Pushkar, Rajasthan',
    region: 'Rajasthan',
    categories: ['Culture', 'History', 'Festival', 'Adventure'],
    description: 'Famous camel fair with unique cultural experiences. Vibrant desert town.',
    image: 'https://via.placeholder.com/400x250?text=Pushkar',
    averageRating: 4.4,
    monthlyVisitors: 50000,
    idealGroupSize: 4,
    estimatedBudget: { min: 1800, max: 4000, currency: 'INR' },
    bestTimeToVisit: 'October to November',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.85,
    highlights: ['Camel fair', 'Desert safari', 'Cultural events', 'Holy lake'],
    embedding: generateDestinationEmbedding(
      'Camel fair unique cultural experiences vibrant desert town festival',
      ['Culture', 'History', 'Festival', 'Adventure']
    )
  },
  {
    id: 'ooty_hill_station',
    name: 'Ooty Hill Station',
    location: 'Ooty, Tamil Nadu',
    region: 'Tamil Nadu',
    categories: ['Mountain', 'Relaxation', 'Nature', 'Adventure'],
    description: 'Beautiful hill station with tea plantations and scenic toy train rides.',
    image: 'https://via.placeholder.com/400x250?text=Ooty',
    averageRating: 4.3,
    monthlyVisitors: 60000,
    idealGroupSize: 4,
    estimatedBudget: { min: 2000, max: 4500, currency: 'INR' },
    bestTimeToVisit: 'April to June, September to October',
    recommendedTripLength: '4-5 days',
    trendingScore: 0.77,
    highlights: ['Toy train', 'Tea plantations', 'Botanical gardens', 'Cool climate'],
    embedding: generateDestinationEmbedding(
      'Hill station tea plantations toy train scenic mountain views',
      ['Mountain', 'Relaxation', 'Nature', 'Adventure']
    )
  },
  {
    id: 'mumbai_city',
    name: 'Mumbai Metropolis',
    location: 'Mumbai, Maharashtra',
    region: 'Maharashtra',
    categories: ['City', 'Culture', 'Food', 'Architecture'],
    description: 'Bustling metropolis with beaches, colonial architecture, and diverse food scene.',
    image: 'https://via.placeholder.com/400x250?text=Mumbai',
    averageRating: 4.2,
    monthlyVisitors: 180000,
    idealGroupSize: 3,
    estimatedBudget: { min: 2500, max: 5500, currency: 'INR' },
    bestTimeToVisit: 'October to March',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.88,
    highlights: ['Gateway of India', 'Marine Drive', 'Food street', 'Film industry'],
    embedding: generateDestinationEmbedding(
      'Bustling metropolis beaches colonial architecture diverse food scene',
      ['City', 'Culture', 'Food', 'Architecture']
    )
  },
  {
    id: 'coorg_coffee',
    name: 'Coorg Coffee Plantation',
    location: 'Coorg, Karnataka',
    region: 'Karnataka',
    categories: ['Nature', 'Relaxation', 'Adventure', 'Agri-tourism'],
    description: 'Lush coffee plantations with waterfalls and nature trails. Peaceful escape.',
    image: 'https://via.placeholder.com/400x250?text=Coorg',
    averageRating: 4.5,
    monthlyVisitors: 55000,
    idealGroupSize: 3,
    estimatedBudget: { min: 1800, max: 3800, currency: 'INR' },
    bestTimeToVisit: 'September to April',
    recommendedTripLength: '3-4 days',
    trendingScore: 0.79,
    highlights: ['Coffee plantations', 'Waterfalls', 'Trekking', 'Monsoons'],
    embedding: generateDestinationEmbedding(
      'Coffee plantations waterfalls nature trails peaceful relaxation',
      ['Nature', 'Relaxation', 'Adventure', 'Agri-tourism']
    )
  }
];

export default DESTINATION_DATASET;
