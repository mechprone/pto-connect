#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build with custom configuration...');

// Ensure we're using the correct Node version
console.log('Node version:', process.version);

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.VITE_CJS_IGNORE_WARNING = 'true';

// Check if React JSX runtime exists
const reactPath = path.join(__dirname, '..', 'node_modules', 'react');
const jsxRuntimePath = path.join(reactPath, 'jsx-runtime.js');
const cjsJsxRuntimePath = path.join(reactPath, 'cjs', 'react-jsx-runtime.production.min.js');

console.log('Checking React installation...');
console.log('React path exists:', fs.existsSync(reactPath));
console.log('JSX runtime (ESM) exists:', fs.existsSync(jsxRuntimePath));
console.log('JSX runtime (CJS) exists:', fs.existsSync(cjsJsxRuntimePath));

// Create a symlink if needed (this helps with module resolution)
if (!fs.existsSync(jsxRuntimePath) && fs.existsSync(cjsJsxRuntimePath)) {
  console.log('Creating ESM symlink for React JSX runtime...');
  try {
    const jsxRuntimeContent = `export * from './cjs/react-jsx-runtime.production.min.js';`;
    fs.writeFileSync(jsxRuntimePath, jsxRuntimeContent);
    console.log('Created JSX runtime ESM wrapper');
  } catch (error) {
    console.error('Failed to create JSX runtime wrapper:', error);
  }
}

// Run prebuild first
try {
  console.log('Running prebuild script...');
  execSync('node scripts/prebuild.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env }
  });
} catch (error) {
  console.error('Prebuild failed:', error);
}

// Run the build
try {
  console.log('Running Vite build...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
