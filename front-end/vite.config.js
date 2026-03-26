import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 🌐 Allow access from outside the container
    host: '0.0.0.0', 
    port: 5173, // Ensure this matches your docker-compose port mapping
    
    // 🔄 Ensure Hot Module Replacement (HMR) works in Docker/WSL
    watch: {
      usePolling: true,
    },

    // 📡 Proxy API calls to the Backend
    proxy: {
      '/api': {
        // ✅ Correct for Docker-to-Docker communication
        target: 'http://node-shared-kernel:3000', 
        changeOrigin: true,
        secure: false,
        // Optional: Remove /api prefix if your backend doesn't use it
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
});