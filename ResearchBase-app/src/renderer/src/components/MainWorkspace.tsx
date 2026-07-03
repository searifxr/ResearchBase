import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
}

function MainWorkspace(): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [documentsIngested, setDocumentsIngested] = useState(0)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // For now, show a message to use the browse button instead
    console.log('Drag and drop detected. Please use the browse button instead for now.')
    alert('Please use the "Browse Files" button to select PDFs')
  }

  const handleBrowseClick = async (): Promise<void> => {
    setIsProcessing(true)

    try {
      // Use Electron's dialog to select files
      const result = await window.electron.ipcRenderer.invoke('dialog:openFile')
      
      if (!result.canceled && result.filePaths.length > 0) {
        for (const filepath of result.filePaths) {
          const filename = filepath.split(/[\\/]/).pop() || 'unknown.pdf'
          
          console.log(`Ingesting: ${filename}`)
          const ingestResult = await window.api.ingestDocument(filepath, filename)

          if (ingestResult.success) {
            console.log('✅ Document ingested:', ingestResult.document)
            setDocumentsIngested((prev) => prev + 1)
          } else {
            console.error('❌ Ingestion failed:', ingestResult.error)
          }
        }
      }
    } catch (error) {
      console.error('Error browsing files:', error)
    }

    setIsProcessing(false)
  }

  const handleSubmitQuestion = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!question.trim() || isProcessing) return

    const userMessage: Message = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setIsProcessing(true)

    try {
      console.log('🔍 Sending query:', question)
      const result = await window.api.queryRAG(question)
      console.log('📦 Query result:', result)

      if (result.success) {
        console.log('✅ Answer received:', result.response.answer)
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.response.answer,
          sources: result.response.sources
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        console.error('❌ Query failed:', result.error)
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${result.error}`
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('💥 Error querying RAG:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error}`
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsProcessing(false)
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Container */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white">ResearchBase</h1>
          <p className="text-slate-400 mt-1">
            {documentsIngested > 0
              ? `${documentsIngested} document${documentsIngested > 1 ? 's' : ''} loaded`
              : 'Drop PDFs to get started'}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          {messages.length > 0 ? (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 text-xs opacity-70">
                          Sources: {msg.sources.length} chunks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 rounded-lg p-4">
                      <p className="animate-pulse">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="border-t border-slate-700 p-4">
                <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isProcessing || documentsIngested === 0}
                    className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !question.trim() || documentsIngested === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Drop Zone (shown when no messages)
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative w-full max-w-3xl h-96 
                  border-4 border-dashed rounded-2xl
                  flex flex-col items-center justify-center
                  transition-all duration-300 ease-in-out
                  cursor-pointer group
                  ${
                    isDragging
                      ? 'border-blue-400 bg-blue-500/10 scale-105'
                      : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/70'
                  }
                  ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    mb-6 transition-transform duration-300
                    ${isDragging ? 'scale-110' : 'group-hover:scale-105'}
                  `}
                >
                  <svg
                    className={`w-24 h-24 transition-colors ${
                      isDragging ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                {/* Text */}
                <div className="text-center px-6">
                  <p
                    className={`text-2xl font-semibold mb-2 transition-colors ${
                      isDragging ? 'text-blue-300' : 'text-white'
                    }`}
                  >
                    {isProcessing
                      ? 'Processing...'
                      : isDragging
                        ? 'Drop your PDFs here'
                        : 'Upload PDF Files'}
                  </p>
                  <p className="text-slate-400 text-sm mb-4">
                    Click below to browse and select research papers
                  </p>
                  <button
                    onClick={handleBrowseClick}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainWorkspace
