import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { connectDB } from './db/connection'

import { registerIpcHandlers } from './ipc-handlers'
import { PosPrinter } from 'electron-pos-printer'

// --- NEW: Function to create the Add Product window ---
function createAddProductWindow() {
  const addProductWindow = new BrowserWindow({
    width: 600,
    height: 700,
    show: false, // Don't show until ready
    title: 'Add New Product',
    parent: global.mainWindow, // Link it to the main window (optional)
    modal: true, // Prevents interaction with the main window until closed (optional)
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Load the same renderer entry point. Vite's routing will handle which component to show.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    addProductWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/add-product')
  } else {
    addProductWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/add-product'
    })
  }

  addProductWindow.on('ready-to-show', () => {
    addProductWindow.show()
  })

  return addProductWindow
}

// --- NEW: Function to create the Settings window ---
// export function createSettingsWindow() {
//   const settingsWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     show: false,
//     title: 'Application Settings and Admin Panel',
//     parent: global.mainWindow,
//     modal: true,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   // Load the same renderer entry point, but with a new hash route
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     settingsWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/settings')
//   } else {
//     settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/settings' })
//   }

//   settingsWindow.on('ready-to-show', () => {
//     settingsWindow.show()
//     // Maaari mo ring buksan ang DevTools para sa debugging:
//     // settingsWindow.webContents.openDevTools()
//   })

//   return settingsWindow
// }

export function createFeatureWindow(parent, route, width = 800, height = 600) {
  const featureWindow = new BrowserWindow({
    parent: parent, // Links it to the main dashboard
    modal: true, // Blocks interaction with dashboard until closed
    width: width,
    height: height,
    frame: false, // Makes it look cleaner (no standard windows top bar)
    resizable: false,
    backgroundColor: '#0f172a', // Slate-900
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mj')
    }
  })

  // Load the specific route for the feature
  if (process.env.NODE_ENV === 'development') {
    featureWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/#/${route}`)
  } else {
    featureWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: route })
  }

  featureWindow.once('ready-to-show', () => featureWindow.show())
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    fullscreen: true, // Forces the window to fill the screen
    autoHideMenuBar: true, // Removes the File/Edit/View menu
    backgroundColor: '#020617', // Slate-950 to match your theme
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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

  // 1. REGISTER IPC HANDLERS HERE
  registerIpcHandlers() // <--- CRITICAL: CALL THE FUNCTION HERE

  // ipcMain.handle('print-html', async (_, html) => {
  //   const printWindow = new BrowserWindow({
  //     width: 300,
  //     height: 600,
  //     show: false,
  //     webPreferences: {
  //       sandbox: false
  //     }
  //   })

  //   await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  //   printWindow.webContents.print(
  //     {
  //       silent: true,
  //       printBackground: true,
  //       margins: { marginType: 'none' },
  //       scaleFactor: 100, // 👈 prevent auto scaling
  //       pageSize: {
  //         width: 58000,
  //         height: 200000
  //       }
  //     },
  //     () => {
  //       printWindow.close()
  //     }
  //   )
  // })

  connectDB()

  global.mainWindow = createWindow()

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
