// Core data structures for the RAG pipeline

/**
 * Represents a PDF document in the system
 */
export interface Document {
  id: string
  filename: string
  filepath: string
  uploadedAt: Date
  totalChunks: number
}

/**
 * A chunk of text from a document
 */
export interface TextChunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  metadata: ChunkMetadata
}

/**
 * Metadata for each chunk
 */
export interface ChunkMetadata {
  pageNumber?: number
  section?: string
  wordCount: number
}

/**
 * Vector embedding with its source chunk
 */
export interface Embedding {
  id: string
  chunkId: string
  vector: number[]
  metadata: ChunkMetadata
}

/**
 * Search result from vector store
 */
export interface SearchResult {
  chunk: TextChunk
  similarity: number
}

/**
 * RAG query request
 */
export interface RAGQuery {
  question: string
  topK?: number 
  documentIds?: string[] 
}

/**
 * RAG response
 */
export interface RAGResponse {
  answer: string
  sources: SearchResult[]
  tokensUsed?: number
}
