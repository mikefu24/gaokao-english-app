import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Suppress known Node.js-only modules from @anthropic-ai/sdk
    rollupOptions: {
      external: [],
    },
  },
  // Silence Node built-in externalization warnings (expected for browser SDK usage)
  optimizeDeps: {
    exclude: [],
  },
})
