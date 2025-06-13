import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@material-tailwind/react', 'framer-motion', 'lucide-react'],
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-table', 'axios'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
