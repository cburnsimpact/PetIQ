import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import axios from 'axios'

// Configure Axios base URL from Vite env var for production/static hosting
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://petiq-api.onrender.com'
axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


