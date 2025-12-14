import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App' // Your main authentication logic
import AddProductPage from './components/AddProductPage'
import SettingsPage from './components/SettingsPage'

// This component determines which component to render based on the URL hash.
export default function Router() {
  return (
    // Use HashRouter since Electron loads files with a # hash, e.g., index.html#/add-product
    <HashRouter>
      <Routes>
        {/* 1. Default Route: Handles the main application flow (Login, Dashboard)
             This will render your App component when the URL is just / (or /#/)
        */}
        <Route path="/" element={<App />} />

        {/* 2. Add Product Route: Handles the new window path: /#/add-product
         */}
        <Route path="/add-product" element={<AddProductPage />} />

        <Route path="/settings" element={<SettingsPage />} />

        {/* 3. Optional: Add a user route for the next feature
         */}
        {/* <Route path="/add-user" element={<AddUserPage />} /> */}
      </Routes>
    </HashRouter>
  )
}
