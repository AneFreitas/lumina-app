import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initializeFirebaseAnalytics } from './firebase.js'
import './index.css' // Pode deixar este arquivo vazio se estiver usando o Tailwind via CDN

initializeFirebaseAnalytics().catch(() => null)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
