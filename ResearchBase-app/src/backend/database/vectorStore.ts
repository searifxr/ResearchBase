import { Embedding, SearchResult, TextChunk } from '../types'

/**
 * In-memory vector store (simple implementation)
 * 
 * YOUR TASK: Implement vector storage and similarity search
 * - Store embeddings with their chunks
 * - Perform cosine similarity search
 * - Return top-k most similar chunks
 * 
 * For production, consider:
 * - ChromaDB (local vector DB)
 * - Pinecone (cloud vector DB)
 * - PostgreSQL with pgvector extension
 */

interface StoredEmbedding {
  embedding: Embedding
  chunk: TextChunk
}

// In-memory storage (replace with real DB later)
const store: StoredEmbedding[] = []

/**
 * Add embeddings to the vector store
 */
export async function addEmbeddings(
  embeddings: Embedding[],
  chunks: TextChunk[]
): Promise<void> {
  if (embeddings.length !== chunks.length) {
    throw new Error('Embeddings and chunks arrays must have the same length')
  }

  for (let i = 0; i < embeddings.length; i++) {
    store.push({
      embedding: embeddings[i],
      chunk: chunks[i]
    })
  }

  console.log(`Added ${embeddings.length} embeddings to store. Total: ${store.length}`)
}

/**
 * Search for similar embeddings using cosine similarity
 */
export async function searchSimilar(
  queryVector: number[],
  topK: number = 5,
  documentIds?: string[]
): Promise<SearchResult[]> {
  let itemsToStore = store;
  if(documentIds && documentIds.length > 0){
    itemsToStore = store.filter(item => documentIds.includes(item.chunk.documentId))
  }

  const scoreResults = itemsToStore.map(item => {
    const socredSimilarity = cosineSimilarity(queryVector, item.embedding.vector);

    return {
        chunk: item.chunk,
        similarity: socredSimilarity
    }
  })

  scoreResults.sort((a,b) => b.similarity - a.similarity)

  return scoreResults.slice(0, topK)
  
  //throw new Error('searchSimilar not implemented yet')
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Clear all embeddings from the store
 */
export function clearStore(): void {
  store.length = 0
  console.log('Vector store cleared')
}

/**
 * Get store statistics
 */
export function getStoreStats() {
  return {
    totalEmbeddings: store.length,
    documents: [...new Set(store.map(s => s.chunk.documentId))]
  }
}
