import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/users': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/jobs': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/job-applications': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/programs': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/organisations': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
