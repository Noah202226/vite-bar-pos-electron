// ===================================
// FILE: src/renderer/src/components/Dashboard/Header.jsx (Updated)
// ===================================
import React from 'react'
import { useAuthStore } from '../../store/useAuthStore' // To access the current user's role

export default function Header({ onLogout }) {
  // Use Zustand to access the user object globally, instead of relying on props.
  // This cleans up the component's interface and makes the user role available.
  const user = useAuthStore((state) => state.user)

  // Define roles that have administrative access
  const isAdmin = user && (user.role === 'Admin' || user.role === 'Manager')

  // Helper function for button styling
  const buttonClass =
    'bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition'

  if (!user) return null // Should not happen if rendering Dashboard, but good practice

  const handleOpenAddProduct = () => {
    // Call the Main Process to open the new BrowserWindow
    window.api.openAddProductWindow()
  }

  const handleOpenSettings = () => {
    // Call the Main Process to open the new Settings BrowserWindow
    window.api.openSettingsWindow() // <--- CALLS NEW IPC HANDLER
  }
  return (
    <header className="flex justify-between items-center pb-4 border-b">
      {/* 1. Welcome and Role Information */}
      <h1 className="text-2xl font-bold text-blue-800 flex items-center">
        Welcome, <span className="text-blue-600 ml-2">{user.username}</span>
        <span className="text-lg font-medium text-gray-500 ml-2">({user.role})</span>
      </h1>

      {/* 2. Action Buttons */}
      <div className="flex space-x-3 items-center">
        {/* === ADMIN/MANAGER BUTTONS (Conditional Rendering) === */}
        {isAdmin && (
          <>
            {/* Add New Product Button */}
            <button
              onClick={handleOpenAddProduct} // Placeholder action
              className={buttonClass}
              title="Add a new product to the menu"
            >
              ➕ Product
            </button>

            {/* Add New User Button */}
            <button
              onClick={() => console.log('Open Add User Modal')} // Placeholder action
              className={buttonClass}
              title="Create a new user account"
            >
              👥 Add User
            </button>
          </>
        )}

        {/* === GENERAL UTILITY BUTTONS === */}

        {/* Settings Button (Accessible by everyone) */}
        <button
          onClick={handleOpenSettings} // Placeholder action
          className={buttonClass}
          title="Open application settings"
        >
          ⚙️ Settings
        </button>

        {/* === LOGOUT BUTTON === */}
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
          title="Log out of the application"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
