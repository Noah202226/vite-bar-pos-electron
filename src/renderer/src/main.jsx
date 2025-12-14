import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Router from './Router'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <Router />
  </StrictMode>
)
