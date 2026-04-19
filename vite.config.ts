import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Фронт всегда ходит в /api/... Префикс /api стрипается на уровне прокси (в dev — здесь, в проде — nginx).
// SPA-пути (/ads/42 и прочие) остаются за React Router'ом, не конфликтуют с API.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/api/ads': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/api/search': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // Сносим dist сами (см. скрипт build в package.json) — в примонтированной ФС
    // автоматический emptyOutDir иногда падает.
    emptyOutDir: false,
  },
})
