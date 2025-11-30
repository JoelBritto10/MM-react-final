/**
 * Embedding Utilities for AI Similarity Calculations
 * Implements cosine similarity and embedding normalization
 */

/**
 * Calculate cosine similarity between two embedding vectors
 * Ranges from -1 (opposite) to 1 (identical)
 * @param {Array} vecA - First embedding vector
 * @param {Array} vecB - Second embedding vector
 * @returns {number} - Cosine similarity score (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Calculate magnitudes
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Return cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Normalize to 0-1 range (convert from -1 to 1 range)
  return (similarity + 1) / 2;
}

/**
 * Normalize a vector to unit length
 * @param {Array} vector - Input vector
 * @returns {Array} - Normalized vector
 */
export function normalizeVector(vector) {
  if (!vector || vector.length === 0) {
    return vector;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude === 0) {
    return vector;
  }

  return vector.map(val => val / magnitude);
}

/**
 * Generate simple embedding from text description
 * Uses TF-IDF-like approach for quick approximation
 * @param {string} text - Text to embed
 * @returns {Array} - 50-dimensional embedding vector
 */
export function generateEmbedding(text) {
  if (!text) {
    return Array(50).fill(0);
  }

  // Simple hash-based embedding for demo purposes
  const words = text.toLowerCase().split(/\s+/).slice(0, 100);
  const embedding = Array(50).fill(0);

  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    
    const position = Math.abs(hash) % 50;
    embedding[position] += Math.sin(hash / 1000) * 0.1;
  });

  return normalizeVector(embedding);
}

/**
 * Generate embedding from category tags
 * @param {Array} categories - Array of category strings
 * @returns {Array} - Embedding vector
 */
export function generateCategoryEmbedding(categories) {
  if (!categories || categories.length === 0) {
    return Array(50).fill(0);
  }

  const embedding = Array(50).fill(0);
  
  categories.forEach((category, idx) => {
    // Each category gets a unique position pattern
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = ((hash << 5) - hash) + category.charCodeAt(i);
    }
    
    const basePos = Math.abs(hash) % 50;
    const spread = Math.abs(hash % 7) + 1;
    
    for (let i = 0; i < spread; i++) {
      const pos = (basePos + i) % 50;
      embedding[pos] += 0.3 / (i + 1);
    }
  });

  return normalizeVector(embedding);
}

/**
 * Calculate weighted average of multiple embeddings
 * @param {Array<Array>} embeddings - Array of embedding vectors
 * @param {Array<number>} weights - Optional weights for each embedding
 * @returns {Array} - Weighted average embedding
 */
export function weightedAverageEmbedding(embeddings, weights = null) {
  if (!embeddings || embeddings.length === 0) {
    return Array(50).fill(0);
  }

  const dimension = embeddings[0].length;
  const result = Array(dimension).fill(0);
  
  const finalWeights = weights || Array(embeddings.length).fill(1 / embeddings.length);
  
  embeddings.forEach((embedding, idx) => {
    const weight = finalWeights[idx];
    for (let i = 0; i < dimension; i++) {
      result[i] += embedding[i] * weight;
    }
  });

  return normalizeVector(result);
}

/**
 * Calculate Euclidean distance between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Euclidean distance
 */
export function euclideanDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return Infinity;
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

/**
 * Batch calculate similarity between query vector and multiple candidate vectors
 * @param {Array} queryVector - Query embedding
 * @param {Array<Array>} candidates - Array of candidate embeddings
 * @returns {Array<number>} - Array of similarity scores
 */
export function batchCosineSimilarity(queryVector, candidates) {
  return candidates.map(candidate => cosineSimilarity(queryVector, candidate));
}

/**
 * Find k nearest neighbors in embedding space
 * @param {Array} queryVector - Query embedding
 * @param {Array<{embedding: Array}>} candidates - Array of objects with embedding property
 * @param {number} k - Number of neighbors to return
 * @returns {Array} - K nearest neighbors with similarity scores
 */
export function kNearestNeighbors(queryVector, candidates, k = 5) {
  const similarities = candidates.map((candidate, idx) => ({
    index: idx,
    similarity: cosineSimilarity(queryVector, candidate.embedding),
    ...candidate
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}
