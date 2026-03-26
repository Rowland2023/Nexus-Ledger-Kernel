import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // ✅ This is correct for Docker-to-Docker communication
        target: 'http://node-shared-kernel:3000', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
});