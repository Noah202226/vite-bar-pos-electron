import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  addProduct: (product) => ipcRenderer.invoke('db:add-product', product),

  // Auth handlers <--- NEW
  checkSession: () => ipcRenderer.invoke('auth:check-session'),
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  signup: (userData) => ipcRenderer.invoke('auth:signup', userData),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Window Handlers
  openAddProductWindow: () => ipcRenderer.invoke('window:open-add-product'),
  openSettingsWindow: () => ipcRenderer.invoke('window:open-settings'),

  // --- NEW DATABASE HANDLERS FOR CATEGORIES ---
  getCategories: () => ipcRenderer.invoke('db:get-categories'),
  addCategory: (name) => ipcRenderer.invoke('db:add-category', name),

  sendToPrinter: (data) => ipcRenderer.send('print-receipt', data),

  printHtml: (html) => ipcRenderer.invoke('print-html', html),

  // Add this line to bridge the function
  getTableOrder: (num) => ipcRenderer.invoke('db:get-table-order', num),

  // Also add the update handler for when we add items later
  updateOrderItems: (data) => ipcRenderer.invoke('db:update-order-items', data),

  // Use send for window commands
  openSettingsWindow: () => ipcRenderer.send('open-settings-window'),
  openAddProductWindow: () => ipcRenderer.send('open-add-product-window')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
