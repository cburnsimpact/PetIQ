import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import axios from 'axios'

// Configure Axios base URL
// - In development, use relative paths so Vite proxy forwards to the local API
// - In production/static hosting, set VITE_API_BASE_URL to your API origin
axios.defaults.baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
axios.defaults.withCredentials = false

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


