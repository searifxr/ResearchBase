import { TextChunk, Embedding } from '../types'
import { InferenceClient } from '@huggingface/inference'

const EMBEDDING_MODEL_ID = "BAAI/bge-large-en-v1.5"

// Lazy initialization - create client when first needed
let hf: InferenceClient | null = null
function getClient(): InferenceClient {
  if (!hf) {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY environment variable is not set')
    }
    hf = new InferenceClient(apiKey)
  }
  return hf
}

export async function generateEmbedding(chunk: TextChunk): Promise<Embedding> {
    const client = getClient()
    
    const response = await client.featureExtraction({
        model: EMBEDDING_MODEL_ID,
        inputs: chunk.content
    })

    return {
        id: `emb_${chunk.id}`,
        chunkId: chunk.id,
        vector: response as number[],
        metadata: chunk.metadata
    };

    //throw new Error('generateEmbedding not implemented yet')
}

/**
 * Generate embeddings for multiple chunks (batch processing)
 */
export async function generateEmbeddings(chunks: TextChunk[]): Promise<Embedding[]> {
    const client = getClient()
    const textsToEmbed = chunks.map(s => s.content)

    const response = await client.featureExtraction({
        model: EMBEDDING_MODEL_ID,
        inputs: textsToEmbed
    })

    const vectors = response as number[][]

    return chunks.map((chunk, index) => ({
        id: `emb_${chunk.id}`,
        chunkId: chunk.id,
        vector: vectors[index],
        metadata: chunk.metadata
    }));
}

/**
 * Generate embedding for a query string
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const client = getClient()
  const queryWithInstruction = `Represent this sentence for searching relevant passages: ${query}`;
  
  const response = await client.featureExtraction({
    model: EMBEDDING_MODEL_ID,
    inputs: queryWithInstruction,
  });
  
  return response as number[];
  
  //throw new Error('generateQueryEmbedding not implemented yet')
}
