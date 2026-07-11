import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MotionProfileProvider } from './hooks/useMotionProfile.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionProfileProvider><App /></MotionProfileProvider>
  </StrictMode>,
)
