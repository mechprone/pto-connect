#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running prebuild setup...');

// Ensure React JSX runtime is accessible
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const reactPath = path.join(nodeModulesPath, 'react');

// Check if we need to create jsx-runtime.js
const jsxRuntimePath = path.join(reactPath, 'jsx-runtime.js');
const jsxDevRuntimePath = path.join(reactPath, 'jsx-dev-runtime.js');

if (!fs.existsSync(jsxRuntimePath)) {
  console.log('Creating jsx-runtime.js...');
  const content = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-jsx-runtime.production.min.js');
} else {
  module.exports = require('./cjs/react-jsx-runtime.development.js');
}
`;
  fs.writeFileSync(jsxRuntimePath, content);
  console.log('Created jsx-runtime.js');
}

if (!fs.existsSync(jsxDevRuntimePath)) {
  console.log('Creating jsx-dev-runtime.js...');
  const content = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-jsx-dev-runtime.production.min.js');
} else {
  module.exports = require('./cjs/react-jsx-dev-runtime.development.js');
}
`;
  fs.writeFileSync(jsxDevRuntimePath, content);
  console.log('Created jsx-dev-runtime.js');
}

console.log('Prebuild setup completed!');
