import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        presets: [
          ['@babel/preset-react', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ],
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime')
    },
    dedupe: ['react', 'react-dom'],
    conditions: ['import', 'module', 'browser', 'default'],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        'top-level-await': true 
      }
    },
    force: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      extensions: ['.js', '.cjs']
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        },
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
      external: [],
      plugins: []
    },
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
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
