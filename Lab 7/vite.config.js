import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-only: browser calls same origin (5173), Vite forwards to Lab 3 (4000).
    // Avoids CORS; you still must run `npm start` in Lab 3.
    proxy: {
      '/lab3graphql': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
})
