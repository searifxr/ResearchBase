import { Document } from '../types'

import {promises as fs} from 'fs';
import { pdfToText } from 'pdf-ts';

/**
 * Extratcs text from PDF

 * @param filepath 
 * @returns Promise<string>
 */
export async function extractTextFromPDF(filepath: string): Promise<string> {
    try{
        const dataBuffer = await fs.readFile(filepath);

        const data = await pdfToText(dataBuffer)

        return data;
    }
    catch(error){
        console.error(` Aysnc function "extractTextFromPDF" params:(filepath: string) returns Promise<string> failed. Error message: `, error)
        throw error;
    }
  //throw new Error('extractTextFromPDF not implemented yet')
}

/**
 * Extract text and create a Document record
 */
export async function processDocument(filepath: string, filename: string): Promise<{ document: Document; text: string }> {
  const text = await extractTextFromPDF(filepath)
  
  const document: Document = {
    id: generateDocumentId(),
    filename,
    filepath,
    uploadedAt: new Date(),
    totalChunks: 0 // Will be updated after chunking
  }
  
  return { document, text }
}

/**
 * Generate a unique document ID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`
}
