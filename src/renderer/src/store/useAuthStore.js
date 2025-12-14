// ===================================
// FILE: src/renderer/src/store/useAuthStore.js
// ===================================
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // STATE
  user: null,
  isLoggedIn: false,
  view: 'loading', // State for the main application view ('loading', 'login', 'dashboard')

  // ACTIONS (Functions to modify the state)
  setUserAndLogin: (userData) =>
    set({
      user: userData,
      isLoggedIn: true,
      view: 'dashboard'
    }),

  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
      view: 'login'
    }),

  // Action to change the view (e.g., login -> signup)
  setView: (newView) => set({ view: newView }),

  // Action to initialize the view after session check
  setInitialView: (initialView) =>
    set((state) => {
      // Only set if we are still in the 'loading' state
      if (state.view === 'loading') {
        return { view: initialView }
      }
      return {}
    })
}))
