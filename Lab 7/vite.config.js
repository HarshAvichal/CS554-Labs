import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /lab3graphql → Lab 3 on :4000 (same-origin in dev; run Lab 3 separately).
    proxy: {
      '/lab3graphql': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
})
