import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // --- Database / Product Handlers ---
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  addProduct: (data) => ipcRenderer.invoke('db:add-product', data),
  getCategories: () => ipcRenderer.invoke('db:get-categories'),
  addCategory: (name) => ipcRenderer.invoke('db:add-category', name),

  // --- Auth ---
  checkSession: () => ipcRenderer.invoke('auth:check-session'),
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  signup: (userData) => ipcRenderer.invoke('auth:signup', userData),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // --- Orders ---
  getTableOrder: (num) => ipcRenderer.invoke('db:get-table-order', num),
  updateOrderItems: (data) => ipcRenderer.invoke('db:update-order-items', data),
  getFloorStatus: () => ipcRenderer.invoke('db:get-floor-status'),
  toggleReservation: (data) => ipcRenderer.invoke('db:toggle-reservation', data),
  checkoutOrder: (data) => ipcRenderer.invoke('db:checkout-order', data),
  printOrderReceipt: (orderData) => ipcRenderer.invoke('print-receipt', orderData),

  // --- REPORTING (Data Fetching) ---
  // This fetches the data arrays
  getSalesReport: (start, end) => ipcRenderer.invoke('db:get-sales-report', { start, end }),

  // --- WINDOW MANAGEMENT (UI Triggers) ---
  // These only tell Main process to open a new window
  openAddProductWindow: () => ipcRenderer.send('window:open-add-product'),
  openSettingsWindow: () => ipcRenderer.send('window:open-settings'),
  openSalesReport: () => ipcRenderer.send('window:open-sales-report')
}

if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
