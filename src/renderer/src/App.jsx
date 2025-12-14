import React, { useEffect } from 'react'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import Dashboard from './components/Dashboard/Dashboard'
import { useAuthStore } from './store/useAuthStore' // <--- NEW IMPORT

function App() {
  // 1. Get state and actions from the Zustand store
  const { user, view, setView, setInitialView, setUserAndLogin, logout } = useAuthStore()

  // 2. Simplied handlers that use the store actions
  const handleLoginSuccess = (userData) => {
    // This calls the action we defined in the store
    setUserAndLogin(userData)
  }

  const handleSignupSuccess = (userData) => {
    // This calls the action we defined in the store
    setUserAndLogin(userData)
  }

  const handleLogout = async () => {
    await window.api.logout()
    // This calls the action we defined in the store
    logout()
  }

  // Effect to check session on application startup
  useEffect(() => {
    async function checkCurrentSession() {
      const sessionResult = await window.api.checkSession()

      if (sessionResult.isLoggedIn) {
        // Update the store with logged-in data
        setUserAndLogin(sessionResult.user)
      } else {
        // Set the view to 'login'
        setInitialView('login')
      }
    }

    checkCurrentSession()
  }, [setUserAndLogin, setInitialView]) // Dependency array should include store actions

  // --------------------
  // CONDITIONAL RENDERING (No change, uses 'view' from store)
  // --------------------

  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    )
  }

  if (view === 'login')
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {/* Button to switch to signup view */}
        <div className="absolute bottom-0 left-0 p-4">
          <button
            onClick={() => setView('signup')} // <--- Uses setView from store
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Create Admin/First User
          </button>
        </div>
      </>
    )

  if (view === 'signup') {
    return (
      <SignupPage onReturnToLogin={() => setView('login')} onSignupSuccess={handleSignupSuccess} />
    )
  }

  // If view is 'dashboard'
  return (
    // Pass user and onLogout down to Dashboard component
    <Dashboard user={user} onLogout={handleLogout} />
  )
}

export default App
