import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './vn.css';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
