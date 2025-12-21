import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Router from './Router'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }
      }}
    />
    <Router />
  </StrictMode>
)
