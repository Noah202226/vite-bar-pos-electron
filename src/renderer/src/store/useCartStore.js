import { create } from 'zustand'

/**
 * useCartStore: THE CASHIER & INVENTORY
 * Handles: Master product list, Categories, and Quick Takeout orders.
 */
export const useCartStore = create((set) => ({
  // --- STATE: PRODUCT LIST ---
  products: [], // The "Master Catalog" - all items available in your shop
  productsLoading: false, // UI helper to show a spinner while loading the list from DB

  // --- STATE: TAKEOUT CART ---
  cartItems: [], // The temporary "shopping bag" for Takeout/Walk-in customers
  totalPrice: 0, // Running total cost of items currently in the takeout cart

  // --- STATE: CATEGORIES ---
  categories: [], // List of menu categories (e.g., Coffee, Pastries, Pasta)
  categoriesLoading: false, // UI helper for the category loading state

  // --- ACTION: FETCH CATEGORIES ---
  // Connects to DB to get the category names for your filter tabs
  fetchCategories: async () => {
    set({ categoriesLoading: true })
    try {
      const categoryList = await window.api.getCategories()
      if (categoryList.error) {
        set({ categoriesLoading: false })
        return
      }
      set({ categories: categoryList, categoriesLoading: false })
    } catch (error) {
      set({ categoriesLoading: false })
    }
  },

  // --- ACTION: UPDATE CATEGORIES ---
  // Manually refreshes the local list (used after you create a new category)
  setCategories: (newCategories) => set({ categories: newCategories }),

  // --- ACTION: FETCH PRODUCTS ---
  // Pulls the entire menu from the database to display on your inventory/sales screen
  fetchProducts: async () => {
    set({ productsLoading: true })
    try {
      const productList = await window.api.getProducts()
      if (productList.error) {
        set({ productsLoading: false })
        return
      }
      set({ products: productList, productsLoading: false })
    } catch (error) {
      set({ productsLoading: false })
    }
  },

  // --- ACTION: ADD TO TAKEOUT ---
  // Puts an item into the 'cartItems' (Takeout).
  // NOTE: This does NOT save to the database yet. It only stays in app memory.
  addItem: (product, quantity = 1) =>
    set((state) => {
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
      return { cartItems: newItems, totalPrice: newTotal }
    }),

  // --- ACTION: CLEAR CART ---
  // Resets the takeout bag to empty (used after checkout or when canceling)
  clearCart: () => set({ cartItems: [], totalPrice: 0 })
}))
