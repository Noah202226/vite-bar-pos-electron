import { create } from 'zustand'

export const useOrderStore = create((set, get) => ({
  activeOrder: null,
  isLoading: false,

  // Load order when table is selected
  loadTableOrder: async (tableNumber) => {
    set({ isLoading: true })
    const order = await window.api.getTableOrder(tableNumber)
    set({ activeOrder: order, isLoading: false })
  },

  // Add item to the current order
  addItem: async (product) => {
    const { activeOrder } = get()
    if (!activeOrder) return

    let updatedItems = [...activeOrder.items]
    const existingItemIndex = updatedItems.findIndex((i) => i.productId === product._id)

    if (existingItemIndex > -1) {
      updatedItems[existingItemIndex].quantity += 1
    } else {
      updatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        status: 'pending'
      })
    }

    // Update locally first for snappiness
    set({ activeOrder: { ...activeOrder, items: updatedItems } })

    // Sync to Database
    await window.api.updateOrderItems({
      orderId: activeOrder._id,
      items: updatedItems
    })
  }
}))
