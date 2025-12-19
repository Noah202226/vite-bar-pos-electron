import { create } from 'zustand'

export const useOrderStore = create((set, get) => ({
  activeOrder: null,
  isLoading: false,
  floorStatus: [],

  loadTableOrder: async (tableNumber) => {
    set({ isLoading: true })
    try {
      // This calls the handler that performs Order.findOne({ tableNumber, status: 'open' })
      const order = await window.api.getTableOrder(tableNumber)

      set({
        activeOrder: order, // This now contains the items we just saved
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to load order:', error)
      set({ isLoading: false })
    }
  },
  // NEW: Refreshes the view of the whole restaurant
  fetchFloorStatus: async () => {
    try {
      const orders = await window.api.getFloorStatus('db:get-floor-status') // Ensure you expose this in preload!
      console.log('Store updated with:', orders)
      set({ floorStatus: orders })
    } catch (error) {
      console.error('Failed to fetch floor status', error)
    }
  },
  toggleReservation: async (tableNumber) => {
    await window.api.toggleReservation({ tableNumber })
    const { fetchFloorStatus } = get()
    await fetchFloorStatus() // Refresh the grid
  },

  addItem: async (product) => {
    const { activeOrder } = get()
    if (!activeOrder) return

    // Since we fixed the Main Process, product._id is now definitely a string.
    // We can just use it directly.
    const pId = product._id

    // Safety check: If it somehow still fails, stop it before saving bad data.
    if (typeof pId !== 'string' || pId === '[object Object]') {
      console.error('CRITICAL ERROR: Invalid Product ID', product)
      return
    }

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

    // Update UI
    set({
      activeOrder: { ...activeOrder, items: updatedItems, total: newTotal, subtotal: newTotal }
    })

    // Sync to Database
    try {
      await window.api.updateOrderItems({
        orderId: activeOrder._id,
        items: updatedItems,
        total: newTotal
      })

      await get().fetchFloorStatus()
    } catch (err) {
      console.error('Failed to sync order:', err)
    }
  },

  clearActiveOrder: () => set({ activeOrder: null }),

  // Logic to "Sent" items to kitchen (Place & Print)
  checkout: async () => {
    const { activeOrder, fetchFloorStatus, clearActiveOrder } = get()
    if (!activeOrder) return

    try {
      // 1. Mark as Paid in Database
      const result = await window.api.checkoutOrder({ orderId: activeOrder._id })

      if (result.error) throw new Error(result.error)

      // 2. Trigger Print (Using your existing printHtml or sendToPrinter)
      // We pass the full order details to the printer
      await window.api.printOrderReceipt(result)

      // 3. Cleanup UI
      clearActiveOrder()
      await fetchFloorStatus() // Update grid so table turns 'Empty'

      return { success: true }
    } catch (error) {
      console.error('Checkout failed:', error)
      return { success: false }
    }
  }
}))
