#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running prebuild setup...');

// Ensure React JSX runtime is accessible
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const reactPath = path.join(nodeModulesPath, 'react');

// Create main react entry if needed
const reactIndexPath = path.join(reactPath, 'index.js');
if (!fs.existsSync(reactIndexPath)) {
  console.log('Creating react/index.js...');
  const content = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
`;
  fs.writeFileSync(reactIndexPath, content);
  console.log('Created react/index.js');
}

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

// Also handle react-dom
const reactDomPath = path.join(nodeModulesPath, 'react-dom');
const reactDomIndexPath = path.join(reactDomPath, 'index.js');

if (!fs.existsSync(reactDomIndexPath)) {
  console.log('Creating react-dom/index.js...');
  const content = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-dom.production.min.js');
} else {
  module.exports = require('./cjs/react-dom.development.js');
}
`;
  fs.writeFileSync(reactDomIndexPath, content);
  console.log('Created react-dom/index.js');
}

console.log('Prebuild setup completed!');
