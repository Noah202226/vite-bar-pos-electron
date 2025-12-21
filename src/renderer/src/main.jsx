import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Router from './Router'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '2px solid #1e293b',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }
      }}
    />
    <Router />
  </StrictMode>
)
