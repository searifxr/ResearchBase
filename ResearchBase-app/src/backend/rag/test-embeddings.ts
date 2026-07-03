// AI generated code. Its 1 AM 😭😭😭😭😭
import { config } from 'dotenv'
config()

// Now import modules that use process.env
import { generateEmbedding } from './embeddings'
import { TextChunk } from '../types'

async function testEmbeddings() {
  console.log('🧪 Testing embedding generation...')
  console.log('🔑 API Key:', process.env.HUGGINGFACE_API_KEY ? 'Loaded ✅' : 'Missing ❌')
  console.log('🔑 Key starts with:', process.env.HUGGINGFACE_API_KEY?.substring(0, 10))
  // Create a mock chunk
  const testChunk: TextChunk = {
    id: 'test_chunk_1',
    documentId: 'test_doc_1',
    content: 'This is a test sentence for embedding generation.',
    chunkIndex: 0,
    metadata: {
      wordCount: 9
    }
  }
  
  try {
    console.log('📝 Input text:', testChunk.content)
    
    const embedding = await generateEmbedding(testChunk)
    
    console.log('✅ Success!')
    console.log('Embedding ID:', embedding.id)
    console.log('Vector length:', embedding.vector.length)
    console.log('First 10 values:', embedding.vector.slice(0, 10))
    
  } catch (error) {
    console.error('❌ Failed:', error)
  }
}

testEmbeddings()
