import { TextChunk, Document } from '../types'

export function chunkText(
  text: string, 
  document: Document,
  chunkSize: number = 1000,
  overlap: number = 100
): TextChunk[] {
  // TODO: Implement text chunking logic
  
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence'})
  const segments = segmenter.segment(text)
  const sentences = Array.from(segments).map(s => s.segment);

  const chunks: TextChunk[] = []
  let currentChunk = ""
  let chunkIndex = 0;

  for(let i = 0; i < sentences.length; i++){
    const sentence = sentences[i];

    if(sentence.length + currentChunk.length <= chunkSize){
      currentChunk += sentence;
    }

    /**
     * export interface TextChunk {
       id: string
       documentId: string
       content: string
       chunkIndex: number
       metadata: ChunkMetadata
     }
     */
    else{
        chunks.push({
          id: `${generateChunkId(document.id, chunkIndex)}`,
          documentId: `${document.id}`,
          content: currentChunk.trim(),
          chunkIndex: chunkIndex,
          metadata: {
            wordCount: countWords(currentChunk)
          }
        });
        
        chunkIndex++;
        
        currentChunk = sentence;
        let overlapLength = sentence.length;
        let backtrack = i - 1;

        while(backtrack >= 0 && overlapLength < overlap){
          const prevSentence = sentences[backtrack];
          currentChunk = prevSentence + currentChunk;
          overlapLength += prevSentence.length;

          backtrack--;
        }

    }
  }

  if(currentChunk.trim().length > 0){
    chunks.push({
      id: generateChunkId(document.id, chunkIndex),
      documentId: document.id,
      content: currentChunk,
      chunkIndex: chunkIndex,
      metadata: {
        wordCount: countWords(currentChunk)
      }
    })
  }
  
  return chunks

  //throw new Error('chunkText not implemented yet')
}

/**
 * Count words in text (helper function)
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}

/**
 * Generate a unique chunk ID
 */
function generateChunkId(documentId: string, index: number): string {
  return `${documentId}_chunk_${index}`
}
