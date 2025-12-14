// ===================================
// FILE: src/renderer/src/store/useCartStore.js (Updated)
// ===================================
import { create } from 'zustand'

export const useCartStore = create((set) => ({
  // NEW STATE FIELDS
  products: [], // All available products fetched from DB
  productsLoading: false,

  cartItems: [],
  totalPrice: 0,

  // NEW STATE FOR CATEGORIES
  categories: [],
  categoriesLoading: false,

  // NEW ACTION: Fetch categories
  fetchCategories: async () => {
    set({ categoriesLoading: true })
    try {
      const categoryList = await window.api.getCategories() // Call new IPC handler

      if (categoryList.error) {
        console.error('Error fetching categories:', categoryList.error)
        set({ categoriesLoading: false })
        return
      }

      set({ categories: categoryList, categoriesLoading: false })
    } catch (error) {
      console.error('IPC error during category fetch:', error)
      set({ categoriesLoading: false })
    }
  },
  // NEW ACTION: Manually set/update categories (Used after adding a new one)
  setCategories: (newCategories) => set({ categories: newCategories }),

  // NEW ACTION: Fetch products via IPC
  fetchProducts: async () => {
    set({ productsLoading: true })
    try {
      // Call the IPC handler you defined: 'db:get-products'
      const productList = await window.api.getProducts()

      if (productList.error) {
        console.error('Error fetching from DB:', productList.error)
        set({ productsLoading: false })
        return
      }

      // Store the successful product list in Zustand
      set({ products: productList, productsLoading: false })
    } catch (error) {
      console.error('IPC error during product fetch:', error)
      set({ productsLoading: false })
    }
  },

  // Existing actions (addItem, clearCart) remain the same
  addItem: (product, quantity = 1) =>
    set((state) => {
      // ... (Your existing addItem logic) ...
      const existingItem = state.cartItems.find((item) => item._id === product._id)

      let newItems
      if (existingItem) {
        newItems = state.cartItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        newItems = [...state.cartItems, { ...product, quantity }]
      }

      const newTotal = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

      return {
        cartItems: newItems,
        totalPrice: newTotal
      }
    }),

  clearCart: () => set({ cartItems: [], totalPrice: 0 })
}))
