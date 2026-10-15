import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/wishlist': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/cart': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/orders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
