import { create } from 'zustand'

export const useOrderStore = create((set, get) => ({
  activeOrder: null,
  isLoading: false,

  loadTableOrder: async (tableNumber) => {
    set({ isLoading: true })
    try {
      const order = await window.api.getTableOrder(tableNumber)
      set({ activeOrder: order, isLoading: false })
    } catch (error) {
      console.error('Failed to load order:', error)
      set({ isLoading: false })
    }
  },

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

    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    set({
      activeOrder: {
        ...activeOrder,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal
      }
    })

    await window.api.updateOrderItems({
      orderId: activeOrder._id,
      items: updatedItems
    })
  }
}))
