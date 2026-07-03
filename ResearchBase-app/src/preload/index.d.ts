import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ingestDocument: (filepath: string, filename: string) => Promise<any>
      queryRAG: (question: string, documentIds?: string[]) => Promise<any>
      getStats: () => Promise<any>
    }
  }
}

