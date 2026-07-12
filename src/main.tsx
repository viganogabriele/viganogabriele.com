import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { MotionProfileProvider } from './hooks/useMotionProfile.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <MotionProfileProvider><App /></MotionProfileProvider>
    </LazyMotion>
  </StrictMode>,
)
