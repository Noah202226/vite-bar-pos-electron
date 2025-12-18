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
  placeOrder: async () => {
    const { activeOrder } = get()
    if (!activeOrder) return

    const updatedItems = activeOrder.items.map((item) => ({
      ...item,
      status: 'sent'
    }))

    set({ activeOrder: { ...activeOrder, items: updatedItems } })

    await window.api.updateOrderItems({
      orderId: activeOrder._id,
      items: updatedItems
    })

    // Trigger receipt printing via the IPC handler you already have
    // await window.api.printOrder(activeOrder)
  }
}))
