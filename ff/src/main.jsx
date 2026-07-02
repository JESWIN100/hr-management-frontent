import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PrivilegeProvider } from './context/PrivilegeContext.jsx'

createRoot(document.getElementById('root')).render(
  <PrivilegeProvider>
    <App />
  </PrivilegeProvider>
)
