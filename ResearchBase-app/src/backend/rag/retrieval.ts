import { RAGQuery, SearchResult } from "../types";
import { generateQueryEmbedding } from "./embeddings";
import { searchSimilar } from "../database/vectorStore";


/**
 * Retrieve releveant chunks for a query
 * 
 * This is the "R" in RAG
 */
export async function retrieveRelevantChunks(query: RAGQuery): Promise<SearchResult[]> {
    try{
        const queryVector = await generateQueryEmbedding(query.question);

        const topK = query.topK || 5
        const results = await searchSimilar(queryVector,topK,query.documentIds);

        console.log(`Retrieved ${results.length}`)

        return results
    }
    catch(error){
        console.error('Failed to retrieveRelevantChunk. Error: ',error)
        throw error
    }

  

    
}

export function formatContextForLLM(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant context found.'
  }
  
  let context = 'Relevant context from documents:\n\n'
  
  results.forEach((result, index) => {
    context += `[${index + 1}] (Similarity: ${result.similarity.toFixed(3)})\n`
    context += `${result.chunk.content}\n\n`
  })
  
  return context
}