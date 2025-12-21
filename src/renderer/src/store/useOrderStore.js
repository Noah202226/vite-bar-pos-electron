import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'

/**
 * useOrderStore: THE DINING ROOM MANAGER
 * Handles: Dine-in tables, live syncing with the database, and Sales Reports.
 */
export const useOrderStore = create((set, get) => ({
  // --- STATE: DINE-IN DATA ---
  activeOrder: null, // The specific order/bill for the table currently being viewed
  isLoading: false, // UI helper for when loading a specific table's data
  floorStatus: [], // Array representing all tables (occupied, empty, or reserved)
  salesData: [], // Data storage for the Sales Report charts/tables

  // --- ACTION: FETCH SALES REPORT ---
  // Retrieves historical sales data from the DB for a specific date range
  fetchSalesReport: async (startDate, endDate) => {
    try {
      const data = await window.api.getSalesReport(startDate, endDate)
      set({ salesData: data })
    } catch (error) {
      set({ salesData: [] })
    }
  },

  // --- ACTION: LOAD TABLE ORDER ---
  // When you click a Table, this finds its "Open" bill in the database
  loadTableOrder: async (tableNumber) => {
    set({ isLoading: true })
    try {
      const order = await window.api.getTableOrder(tableNumber)
      if (!order) {
        // If no bill exists, create a fresh "temporary" object for UI
        set({ activeOrder: { tableNumber, items: [], total: 0, subtotal: 0 }, isLoading: false })
      } else {
        set({ activeOrder: order, isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  // --- ACTION: REFRESH FLOOR ---
  // Updates the colors of the tables (Red = Occupied, Gray = Empty)
  fetchFloorStatus: async () => {
    try {
      const orders = await window.api.getFloorStatus('db:get-floor-status')
      set({ floorStatus: orders })
    } catch (error) {
      console.error('Failed to fetch floor status', error)
    }
  },

  // --- ACTION: TOGGLE RESERVATION ---
  // Marks a table as "Reserved" in the database
  toggleReservation: async (tableNumber) => {
    await window.api.toggleReservation({ tableNumber })
    await get().fetchFloorStatus()
  },

  // --- ACTION: ADD ITEM TO TABLE ---
  // CRITICAL: This adds an item AND immediately saves it to the Database.
  // This ensures that if the app closes, the table's bill is safe.
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
        status: 'pending' // Kitchen hasn't cooked this yet
      })
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Update the screen immediately
    set({
      activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
    })

    // Sync to Database immediately
    try {
      await window.api.updateOrderItems({
        orderId: activeOrder._id,
        items: updatedItems,
        total: newTotal,
        currentUser: user?.username, // Pass for Monitoring
        inventoryUpdate: {
          productId: product._id,
          adjustment: -1, // SALE
          tableNumber: activeOrder.tableNumber
        }
      })
      await get().fetchFloorStatus()
    } catch (err) {
      console.error('Failed to sync order:', err)
    }
  },

  voidItem: async (productId) => {
    const { activeOrder, fetchFloorStatus } = get()
    const { user } = useAuthStore.getState()

    if (!activeOrder) return

    // 1. Find the item
    const itemToVoid = activeOrder.items.find((item) => item.productId === productId)
    if (!itemToVoid) return

    // 2. Calculate updated items list
    let updatedItems = activeOrder.items
      .map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: item.quantity - 1 }
        }
        return item
      })
      .filter((item) => item.quantity > 0) // Remove from array if 0

    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // 3. Update local state for instant UI feedback
    set({
      activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
    })

    // 4. Sync to DB, Add Stock Back, and Log to Monitoring
    try {
      await window.api.updateOrderItems({
        orderId: activeOrder._id,
        items: updatedItems,
        total: newTotal,
        currentUser: user?.username || 'Unknown',
        inventoryUpdate: {
          productId: productId,
          adjustment: 1, // RETURNS 1 to currentStock
          tableNumber: activeOrder.tableNumber,
          type: 'VOID_DELETE'
        }
      })

      // Refresh floor to ensure table status is accurate
      await fetchFloorStatus()

      // IMPORTANT: Refresh Product Inventory UI if it's open
      // if (useCartStore.getState().fetchProducts) await useCartStore.getState().fetchProducts()
    } catch (error) {
      console.error('Void failed:', error)
    }
  },

  // --- ACTION: CLEAR SELECTION ---
  // Simply deselects the current table in the UI
  clearActiveOrder: () => set({ activeOrder: null }),

  // --- ACTION: CHECKOUT / PAY ---
  // Finalizes the bill, marks it as "Paid", prints the receipt, and clears the table
  checkout: async () => {
    const { activeOrder, fetchFloorStatus } = get()
    const { user } = useAuthStore.getState()

    if (!activeOrder) return

    // Helper to safely get a string ID
    const cleanId = (id) => {
      if (!id) return null
      return typeof id === 'string' ? id : id.toString()
    }

    try {
      const finalizedOrder = await window.api.checkoutOrder({
        orderId: cleanId(activeOrder._id),
        transactBy: user?.username || 'Admin',
        userId: cleanId(user?._id) // Clean string conversion here
      })

      if (finalizedOrder.error) throw new Error(finalizedOrder.error)

      await window.api.printOrderReceipt(finalizedOrder)
      await window.api.printReceipt(finalizedOrder)
      set({ activeOrder: null })
      await fetchFloorStatus()
    } catch (error) {
      console.error('Checkout Error:', error)
    }
  }
}))
