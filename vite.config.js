import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react',
    babel: {
      plugins: [
        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
      ]
    }
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Force React to use ESM version
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime')
    },
    // Ensure .js extensions are resolved
    extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    esbuildOptions: {
      // Ensure ESM is used
      format: 'esm',
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        },
        // Ensure ESM format
        format: 'es'
      }
    },
    // Ensure modern build output
    modulePreload: {
      polyfill: false
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
  // Force ESM resolution
  ssr: {
    noExternal: ['react', 'react-dom']
  }
});
