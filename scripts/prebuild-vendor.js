#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating vendor bundle for React...');

const vendorPath = path.join(__dirname, '..', 'src', 'vendor');
if (!fs.existsSync(vendorPath)) {
  fs.mkdirSync(vendorPath, { recursive: true });
}

// Create a vendor file that exports React and ReactDOM
const vendorContent = `
// Vendor bundle for React and ReactDOM
// This file is created by prebuild-vendor.js

// Import React
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

// Re-export everything
export { React, ReactDOM };

// Also export as default for convenience
export default { React, ReactDOM };

// Make them available globally for older code
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}
`;

fs.writeFileSync(path.join(vendorPath, 'react-vendor.js'), vendorContent);
console.log('Created src/vendor/react-vendor.js');

// Create an index file that imports the vendor bundle
const indexContent = `
// Import vendor bundle to ensure React is available
import './vendor/react-vendor.js';

// Re-export React for use in other files
export { React, ReactDOM } from './vendor/react-vendor.js';
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'react-imports.js'), indexContent);
console.log('Created src/react-imports.js');

console.log('\nVendor bundle created successfully!');
