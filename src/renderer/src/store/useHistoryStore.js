import { create } from 'zustand'

export const useHistoryStore = create((set) => ({
  isOpen: false,
  selectedProductId: null,

  // Action to open drawer for a specific product
  openProductHistory: (productId) =>
    set({
      isOpen: true,
      selectedProductId: productId
    }),

  // Action to open drawer for ALL logs
  openGlobalHistory: () =>
    set({
      isOpen: true,
      selectedProductId: null
    }),

  // Action to close
  closeHistory: () =>
    set({
      isOpen: false,
      selectedProductId: null
    }),

  // Action to clear filter without closing
  clearFilter: () =>
    set({
      selectedProductId: null
    })
}))
