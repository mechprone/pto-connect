import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      jsxImportSource: undefined,
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { 
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment'
          }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://pto-connect-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
    },
  },
});
