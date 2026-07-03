import 'dotenv/config'
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ingestDocument, queryRAG, getStoreStats } from '../backend'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // Enable file path access
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // File dialog handler
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })
    return result
  })

  // RAG Pipeline IPC Handlers
  
  // Handle PDF ingestion
  ipcMain.handle('rag:ingest', async (_event, filepath: string, filename: string) => {
    try {
      console.log(`[IPC] Ingesting document: ${filename}`)
      const document = await ingestDocument(filepath, filename)
      return { success: true, document }
    } catch (error) {
      console.error('[IPC] Ingestion failed:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // Handle RAG queries
  ipcMain.handle('rag:query', async (_event, question: string, documentIds?: string[]) => {
    try {
      console.log(`[IPC] Processing query: ${question}`)
      const response = await queryRAG({ question, documentIds })
      return { success: true, response }
    } catch (error) {
      console.error('[IPC] Query failed:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // Get store statistics
  ipcMain.handle('rag:stats', async () => {
    try {
      const stats = getStoreStats()
      return { success: true, stats }
    } catch (error) {
      console.error('[IPC] Stats failed:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
