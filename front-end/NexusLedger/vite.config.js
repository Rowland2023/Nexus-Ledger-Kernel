import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This matches the app.use('/api/v1/order', ...) in your index.js
      '/api': {
        target: 'http://127.0.0.1:3000', 
        changeOrigin: true,
        secure: false,
        // No rewrite needed since your backend actually uses the /api prefix
      },
    },
  },
});