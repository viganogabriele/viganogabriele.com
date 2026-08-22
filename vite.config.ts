import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { staticPages } from './scripts/static-pages.ts'
import { profile } from './src/data/profile.ts'

const cvVersion = createHash('sha256')
  .update(readFileSync(resolve(process.cwd(), 'public', profile.cvPath.slice(1))))
  .digest('hex')
  .slice(0, 12)

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_CV_VERSION': JSON.stringify(cvVersion),
  },
  plugins: [react(), tailwindcss(), staticPages({ cvVersion })],
  build: {
    manifest: true,
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
