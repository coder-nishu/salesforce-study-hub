import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: fileURLToPath(new URL('./src/lib/buffer-shim.js', import.meta.url)),
    },
  },
})
