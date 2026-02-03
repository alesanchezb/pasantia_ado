import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // 1. Importar

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* 2. Envolver el componente App */}
      <App />
    </AuthProvider>
  </StrictMode>,
)
