/**
 * Backend API - Main entry point
 * 
 * Export all public functions that the main process will use
 */

// Export types
export type {
  Document,
  TextChunk,
  Embedding,
  SearchResult,
  RAGQuery,
  RAGResponse
} from './types'

// Export main RAG pipeline functions
export { ingestDocument, queryRAG } from './rag/ragPipeline'

// Export utility functions
export { clearStore, getStoreStats } from './database/vectorStore'

// Export individual components (for testing/advanced usage)
export { extractTextFromPDF, processDocument } from './analysis/textExtractor'
export { chunkText } from './analysis/textChunker'
export { generateEmbedding, generateEmbeddings, generateQueryEmbedding } from './rag/embeddings'
export { retrieveRelevantChunks, formatContextForLLM } from './rag/retrieval'
export { generateAnswer } from './rag/generation'
