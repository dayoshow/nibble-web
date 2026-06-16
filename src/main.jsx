import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1A1208',
          color: '#FFF8F0',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          borderRadius: '12px',
          padding: '12px 18px',
        },
        success: { iconTheme: { primary: '#2D6A2D', secondary: '#FFF8F0' } },
        error:   { iconTheme: { primary: '#D93025', secondary: '#FFF8F0' } },
      }}
    />
  </React.StrictMode>
)
