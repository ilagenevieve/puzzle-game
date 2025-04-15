import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.FRONTEND_PORT || 3000,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 4000}`,
        changeOrigin: true
      },
      '/socket.io': {
        target: `http://localhost:${process.env.PORT || 4000}`,
        ws: true
      },
      '/peerjs': {
        target: `http://localhost:${process.env.PEERJS_PORT || 9000}`,
        ws: true
      }
    }
  }
})