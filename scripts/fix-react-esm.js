#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating ESM wrappers for React...');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Create ESM wrapper for React
const reactPath = path.join(nodeModulesPath, 'react');
const reactIndexPath = path.join(reactPath, 'index.mjs');

// Simple ESM wrapper that re-exports the CommonJS module
const reactESMContent = `
// ESM wrapper for React
// This avoids the CJS path resolution issue by using dynamic import
export * from './index.js';
export { default } from './index.js';
`;

fs.writeFileSync(reactIndexPath, reactESMContent);
console.log('Created react/index.mjs');

// Create ESM wrapper for React DOM
const reactDomPath = path.join(nodeModulesPath, 'react-dom');
const reactDomIndexPath = path.join(reactDomPath, 'index.mjs');

const reactDomESMContent = `
// ESM wrapper for React DOM
// This avoids the CJS path resolution issue by using dynamic import
export * from './index.js';
export { default } from './index.js';
`;

fs.writeFileSync(reactDomIndexPath, reactDomESMContent);
console.log('Created react-dom/index.mjs');

// Create ESM wrapper for react-dom/client
const reactDomClientPath = path.join(reactDomPath, 'client.mjs');
const reactDomClientContent = `
// ESM wrapper for React DOM Client
export { createRoot, hydrateRoot } from './client.js';

// Also provide as default for convenience
import { createRoot, hydrateRoot } from './client.js';
export default { createRoot, hydrateRoot };
`;

fs.writeFileSync(reactDomClientPath, reactDomClientContent);
console.log('Created react-dom/client.mjs');

// Create ESM wrapper for jsx-runtime
const jsxRuntimePath = path.join(reactPath, 'jsx-runtime.mjs');
const jsxRuntimeContent = `
// ESM wrapper for React JSX Runtime
export * from './jsx-runtime.js';
`;
fs.writeFileSync(jsxRuntimePath, jsxRuntimeContent);
console.log('Created react/jsx-runtime.mjs');

// Create ESM wrapper for jsx-dev-runtime
const jsxDevRuntimePath = path.join(reactPath, 'jsx-dev-runtime.mjs');
const jsxDevRuntimeContent = `
// ESM wrapper for React JSX Dev Runtime
export * from './jsx-dev-runtime.js';
`;
fs.writeFileSync(jsxDevRuntimePath, jsxDevRuntimeContent);
console.log('Created react/jsx-dev-runtime.mjs');

// Update package.json files to include ESM exports
const reactPackageJsonPath = path.join(reactPath, 'package.json');
const reactPackageJson = JSON.parse(fs.readFileSync(reactPackageJsonPath, 'utf8'));
reactPackageJson.exports = {
  '.': {
    'import': './index.mjs',
    'require': './index.js'
  },
  './jsx-runtime': {
    'import': './jsx-runtime.mjs',
    'require': './jsx-runtime.js'
  },
  './jsx-dev-runtime': {
    'import': './jsx-dev-runtime.mjs',
    'require': './jsx-dev-runtime.js'
  },
  './package.json': './package.json'
};
fs.writeFileSync(reactPackageJsonPath, JSON.stringify(reactPackageJson, null, 2));
console.log('Updated react/package.json');

const reactDomPackageJsonPath = path.join(reactDomPath, 'package.json');
const reactDomPackageJson = JSON.parse(fs.readFileSync(reactDomPackageJsonPath, 'utf8'));
reactDomPackageJson.exports = {
  '.': {
    'import': './index.mjs',
    'require': './index.js'
  },
  './client': {
    'import': './client.mjs',
    'require': './client.js'
  },
  './server': './server.js',
  './package.json': './package.json'
};
fs.writeFileSync(reactDomPackageJsonPath, JSON.stringify(reactDomPackageJson, null, 2));
console.log('Updated react-dom/package.json');

console.log('\nESM wrappers created successfully!');
