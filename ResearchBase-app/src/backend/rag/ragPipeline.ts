import { Document, RAGQuery, RAGResponse } from '../types'
import { processDocument } from '../analysis/textExtractor'
import { chunkText } from '../analysis/textChunker'
import { generateEmbeddings } from './embeddings'
import { addEmbeddings } from '../database/vectorStore'
import { retrieveRelevantChunks } from './retrieval'
import { generateAnswer } from './generation'

/**
 * Main RAG Pipeline Orchestrator
 * 
 * This file coordinates the entire RAG workflow:
 * 1. Ingest documents (extract text, chunk, embed, store)
 * 2. Query documents (retrieve relevant chunks, generate answer)
 */

/**
 * Ingest a PDF document into the RAG system
 * 
 * Steps:
 * 1. Extract text from PDF
 * 2. Chunk the text
 * 3. Generate embeddings for chunks
 * 4. Store embeddings in vector DB
 */
export async function ingestDocument(
  filepath: string,
  filename: string
): Promise<Document> {
  console.log(`📄 Ingesting document: ${filename}`)
  
  try {

    console.log('  1/4 Extracting text...')
    const { document, text } = await processDocument(filepath, filename)
    

    console.log('  2/4 Chunking text...')
    const chunks = chunkText(text, document)
    document.totalChunks = chunks.length

    console.log(`  3/4 Generating embeddings for ${chunks.length} chunks...`)
    const embeddings = await generateEmbeddings(chunks)
    

    console.log('  4/4 Storing embeddings...')
    await addEmbeddings(embeddings, chunks)
    
    console.log(`✅ Document ingested successfully: ${document.id}`)
    return document
    
  } catch (error) {
    console.error(`❌ Failed to ingest document: ${filename}`, error)
    throw error
  }
}

/**
 * Query the RAG system
 * 
 * Steps:
 * 1. Retrieve relevant chunks using vector search
 * 2. Generate answer using LLM with context
 */
export async function queryRAG(query: RAGQuery): Promise<RAGResponse> {
  console.log(`🔍 Processing query: "${query.question}"`)
  
  try {
 
    console.log('  1/2 Retrieving relevant chunks...')
    const relevantChunks = await retrieveRelevantChunks(query)
    
    if (relevantChunks.length === 0) {
      return {
        answer: 'I could not find any relevant information to answer your question.',
        sources: [],
        tokensUsed: 0
      }
    }

    console.log('  2/2 Generating answer...')
    const response = await generateAnswer(query.question, relevantChunks)
    
    console.log('✅ Answer generated successfully')
    return response
    
  } catch (error) {
    console.error('❌ Failed to process query', error)
    throw error
  }
}
