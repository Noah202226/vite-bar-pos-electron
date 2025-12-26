import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // --- Database / Product Handlers ---
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  addProduct: (data) => ipcRenderer.invoke('db:add-product', data),
  updateProduct: (id, data) => ipcRenderer.invoke('db:update-product', id, data),
  deleteProduct: (id, logData) => ipcRenderer.invoke('db:delete-product', id, logData),
  getInventoryLogs: () => ipcRenderer.invoke('db:get-inventory-logs'),

  getCategories: () => ipcRenderer.invoke('db:get-categories'),
  addCategory: (name) => ipcRenderer.invoke('db:add-category', name),
  deleteCategory: (id) => ipcRenderer.invoke('db:delete-category', id),

  // --- Auth ---
  checkSession: () => ipcRenderer.invoke('auth:check-session'),
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  signup: (userData) => ipcRenderer.invoke('auth:signup', userData),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getUserSessionSales: (data) => ipcRenderer.invoke('get-user-session-sales', data),

  // --- Orders ---
  getTableOrder: (num) => ipcRenderer.invoke('db:get-table-order', num),
  updateOrderItems: (data) => ipcRenderer.invoke('db:update-order-items', data),
  getFloorStatus: () => ipcRenderer.invoke('db:get-floor-status'),
  toggleReservation: (data) => ipcRenderer.invoke('db:toggle-reservation', data),
  checkoutOrder: (data) => ipcRenderer.invoke('db:checkout-order', data),

  printOrderReceipt: (orderData) => ipcRenderer.invoke('print-receipt', orderData),
  testThermalPrinter: () => ipcRenderer.invoke('print-test-thermal'),
  printReceipt: (htmlContent) => ipcRenderer.invoke('print-html', htmlContent),
  testPrintHtml: (html) => ipcRenderer.invoke('print-html', html),

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
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
