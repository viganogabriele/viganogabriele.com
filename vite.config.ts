import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { staticPages } from './scripts/static-pages.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), staticPages()],
  build: {
    target: ["chrome111", "edge111", "firefox114", "safari16.4"],
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Stable vendor chunks: content edits stop invalidating the whole
        // 400KB+ entry — returning visitors re-download only the app code.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'motion'
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react-vendor'
          return undefined
        },
      },
    },
  },
})
