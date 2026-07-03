import { SearchResult, RAGResponse } from '../types'
import { formatContextForLLM } from './retrieval'
import { InferenceClient } from '@huggingface/inference'

const LLM_MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"

// Lazy initialization for LLM client
let hfLLM: InferenceClient | null = null
function getLLMClient(): InferenceClient {
  if (!hfLLM) {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY environment variable is not set')
    }
    hfLLM = new InferenceClient(apiKey)
  }
  return hfLLM
}

/**
 * Generate answer using LLM with retrieved context
 * 
 * This is the "G" in RAG - Generation
 * Takes the question and relevant chunks, asks LLM to answer based on context
 * 
 * YOUR TASK: Implement LLM generation
 * - Build a prompt with context and question
 * - Call HuggingFace LLM API (or OpenAI, Anthropic, etc.)
 * - Return the generated answer
 */
export async function generateAnswer(
  question: string,
  relevantChunks: SearchResult[]
): Promise<RAGResponse> {
  try {
    const client = getLLMClient()
    
    // Format the context from retrieved chunks
    const context = formatContextForLLM(relevantChunks)
    
    // Build the prompt
    const prompt = buildPrompt(question, context)
    
    // Call the LLM
    const response = await client.textGeneration({
      model: LLM_MODEL_ID,
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.3,
        top_p: 0.9,
        return_full_text: false
      }
    })
    
    return {
      answer: response.generated_text.trim(),
      sources: relevantChunks,
      tokensUsed: response.details?.generated_tokens
    }
    
  } catch (error) {
    console.error('Failed to generate answer:', error)
    throw error
  }
}

/**
 * Build the prompt for the LLM
 */
export function buildPrompt(question: string, context: string): string {
  return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert research assistant specializing in academic literature analysis. Your job is to analyze the provided research paper text and output a highly structured, deep-dive breakdown. You must follow the exact layout requested by the user and maintain a professional, academic tone. Do not include any introductory fluff (e.g., "Sure, here is the breakdown")—start directly with the content.<|eot_id|><|start_header_id|>user<|end_header_id|>
Please analyze the following research paper section and answer the user's question based on it.

### RESEARCH PAPER SECTION (CONTEXT):
"${context}"

### USER QUESTION:
"${question}"

Provide your analysis using this exact structural format:

## 1. Executive Summary
[Provide a clear, concise summary of this specific section of the research paper]

## 2. Core Keywords
[List 5-8 vital keywords extracted directly from the text, separated by commas]

## 3. Scientific Categorization
* **Primary Science Field:** [e.g., Quantum Physics, Molecular Biology, Behavioral Psychology]
* **Subtopic:** [The specific niche branch of science this research belongs to]

## 4. Key Terminology & Definitions
[Provide a markdown table defining the most important technical words found in the text that are highly relevant to its specific scientific domain]
| Term | Domain-Specific Definition |
| :--- | :--- |

## 5. "Read the Paper" Deep Insights (Broad to Niche)
* **Macro Context (Broad):** [An overarching insight or foundational principle mentioned in the text that anchors this research]
* **Micro Nuance (Niche):** [An extremely specific detail, data point, methodology quirk, or specific finding from the text that proves an in-depth, thorough reading of the material]
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
}
