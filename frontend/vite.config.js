import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 👈 add this

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 👈 this enables @/ to mean /src
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api.ptoconnect.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
