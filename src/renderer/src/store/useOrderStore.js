import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import { usePrintStore } from './usePrintStore'

/**
 * useOrderStore: THE DINING ROOM MANAGER
 * Handles: Dine-in tables, live syncing with the database, and Sales Reports.
 */
export const useOrderStore = create((set, get) => ({
  sessionTotal: 0,
  sessionCount: 0,

  // --- STATE: DINE-IN DATA ---
  activeOrder: null, // The specific order/bill for the table currently being viewed
  isLoading: false, // UI helper for when loading a specific table's data
  floorStatus: [], // Array representing all tables (occupied, empty, or reserved)
  salesData: [], // Data storage for the Sales Report charts/tables

  // Fetch sales specifically for THIS user's current session
  fetchUserSessionSales: async () => {
    const { user } = useAuthStore.getState()

    // We use the lastLogin timestamp stored when the user signed in
    if (!user || !user.lastLogin) return

    try {
      const data = await window.api.getUserSessionSales({
        username: user.username,
        loginTime: user.lastLogin
      })

      set({
        sessionTotal: data.total,
        sessionCount: data.count
      })
    } catch (error) {
      console.error('Session fetch error:', error)
    }
  },

  // --- ACTION: FETCH SALES REPORT ---
  fetchSalesReport: async (startDate, endDate) => {
    try {
      const data = await window.api.getSalesReport(startDate, endDate)
      set({ salesData: data })
    } catch (error) {
      set({ salesData: [] })
    }
  },

  // --- ACTION: LOAD TABLE ORDER ---
  loadTableOrder: async (tableNumber) => {
    set({ isLoading: true })
    try {
      const order = await window.api.getTableOrder(tableNumber)
      if (!order) {
        set({ activeOrder: { tableNumber, items: [], total: 0, subtotal: 0 }, isLoading: false })
      } else {
        set({ activeOrder: order, isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  // --- ACTION: REFRESH FLOOR ---
  fetchFloorStatus: async () => {
    try {
      const orders = await window.api.getFloorStatus('db:get-floor-status')
      set({ floorStatus: orders })
    } catch (error) {
      console.error('Failed to fetch floor status', error)
    }
  },

  // --- ACTION: TOGGLE RESERVATION ---
  toggleReservation: async (tableNumber) => {
    await window.api.toggleReservation({ tableNumber })
    await get().fetchFloorStatus()
  },

  // --- ACTION: ADD ITEM (Active Table Only) ---
  // Use this when the user is inside the Order View
  addItem: async (product) => {
    const { activeOrder } = get()
    const { user } = useAuthStore.getState()

    if (!activeOrder) return

    const pId = product._id
    if (typeof pId !== 'string' || pId === '[object Object]') return

    let updatedItems = [...activeOrder.items]
    const existingItemIndex = updatedItems.findIndex((i) => i.productId === pId)

    if (existingItemIndex > -1) {
      updatedItems[existingItemIndex].quantity += 1
    } else {
      updatedItems.push({
        productId: pId,
        name: product.name,
        price: product.price,
        quantity: 1,
        status: 'pending'
      })
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    set({
      activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
    })

    try {
      await window.api.updateOrderItems({
        orderId: activeOrder._id,
        items: updatedItems,
        total: newTotal,
        currentUser: user?.username,
        inventoryUpdate: {
          productId: product._id,
          adjustment: -1,
          tableNumber: activeOrder.tableNumber
        }
      })
      await get().fetchFloorStatus()
    } catch (err) {
      console.error('Failed to sync order:', err)
    }
  },

  // --- NEW ACTION: ADD TO SPECIFIC ORDER (For Takeout/Remote) ---
  // Use this when adding items from the Inventory List to a specific table (e.g., 'TAKEOUT')
  addToOrder: async (tableIdentifier, productDetails) => {
    const { user } = useAuthStore.getState()
    const { activeOrder, fetchFloorStatus } = get()

    try {
      let targetOrder = await window.api.getTableOrder(tableIdentifier)
      if (!targetOrder) {
        targetOrder = { tableNumber: tableIdentifier, items: [], total: 0 }
      }

      const pId = productDetails.id || productDetails._id
      const qtyToAdd = productDetails.quantity || 1
      let updatedItems = [...(targetOrder.items || [])]

      const existingItemIndex = updatedItems.findIndex((i) => i.productId === pId)
      if (existingItemIndex > -1) {
        updatedItems[existingItemIndex].quantity += qtyToAdd
      } else {
        updatedItems.push({
          productId: pId,
          name: productDetails.name,
          price: productDetails.price,
          quantity: qtyToAdd,
          status: 'pending'
        })
      }

      const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // ONE SINGLE CALL to the API that handles both the Order and the Inventory
      await window.api.updateOrderItems({
        orderId: targetOrder._id,
        tableNumber: tableIdentifier,
        items: updatedItems,
        total: newTotal,
        currentUser: user?.username || 'Staff',
        inventoryUpdate: {
          productId: pId,
          adjustment: -qtyToAdd,
          tableNumber: tableIdentifier,
          type: 'SOLD', // This triggers the "Sold" log in your monitoring
          reason: 'Inventory Quick Add'
        }
      })

      if (activeOrder?.tableNumber === tableIdentifier) {
        set({
          activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
        })
      }

      await fetchFloorStatus()
    } catch (error) {
      console.error('Failed to add to order:', error)
      throw error // Throw so the component toast catches it
    }
  },

  // --- ACTION: VOID ITEM ---
  voidItem: async (productId) => {
    const { activeOrder, fetchFloorStatus } = get()
    const { user } = useAuthStore.getState()

    if (!activeOrder) return

    const itemToVoid = activeOrder.items.find((item) => item.productId === productId)
    if (!itemToVoid) return

    let updatedItems = activeOrder.items
      .map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: item.quantity - 1 }
        }
        return item
      })
      .filter((item) => item.quantity > 0)

    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    set({
      activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
    })

    try {
      await window.api.updateOrderItems({
        orderId: activeOrder._id,
        items: updatedItems,
        total: newTotal,
        currentUser: user?.username || 'Unknown',
        inventoryUpdate: {
          productId: productId,
          adjustment: 1, // Return stock
          tableNumber: activeOrder.tableNumber,
          type: 'VOID_DELETE'
        }
      })
      await fetchFloorStatus()
    } catch (error) {
      console.error('Void failed:', error)
    }
  },

  // --- ACTION: CLEAR SELECTION ---
  clearActiveOrder: () => set({ activeOrder: null }),

  // --- ACTION: CHECKOUT / PAY ---
  checkout: async (tenderedAmount, changeAmount) => {
    const { activeOrder, fetchFloorStatus } = get()
    const { user } = useAuthStore.getState()
    const printReceipt = usePrintStore.getState().printReceipt

    if (!activeOrder) return

    const cleanId = (id) => {
      if (!id) return null
      return typeof id === 'string' ? id : id.toString()
    }

    try {
      const finalizedOrder = await window.api.checkoutOrder({
        orderId: cleanId(activeOrder._id),
        transactBy: user?.username || 'Admin',
        userId: cleanId(user?._id),
        tendered: tenderedAmount,
        change: changeAmount
      })

      if (finalizedOrder.error) throw new Error(finalizedOrder.error)

      await printReceipt({
        items: finalizedOrder.items,
        total: finalizedOrder.total,
        tableNumber: finalizedOrder.tableNumber,
        orderId: finalizedOrder.orderNumber || finalizedOrder._id,
        paymentType: 'Cash',
        tendered: tenderedAmount,
        change: changeAmount
      })

      set({ activeOrder: null })
      await fetchFloorStatus()
      // Refresh session stats after every successful payment
      await get().fetchUserSessionSales()
    } catch (error) {
      console.error('Checkout Error:', error)
    }
  }
}))
