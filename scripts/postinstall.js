#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Running postinstall setup...');

// This script runs after npm install to ensure React modules are properly configured
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Fix React
const reactPath = path.join(nodeModulesPath, 'react');
if (fs.existsSync(reactPath)) {
  // Ensure index.js exists
  const indexPath = path.join(reactPath, 'index.js');
  if (!fs.existsSync(indexPath) && fs.existsSync(path.join(reactPath, 'cjs'))) {
    fs.writeFileSync(indexPath, `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
`);
    console.log('Created react/index.js');
  }

  // Ensure jsx-runtime.js exists
  const jsxRuntimePath = path.join(reactPath, 'jsx-runtime.js');
  if (!fs.existsSync(jsxRuntimePath) && fs.existsSync(path.join(reactPath, 'cjs'))) {
    fs.writeFileSync(jsxRuntimePath, `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-jsx-runtime.production.min.js');
} else {
  module.exports = require('./cjs/react-jsx-runtime.development.js');
}
`);
    console.log('Created react/jsx-runtime.js');
  }

  // Ensure jsx-dev-runtime.js exists
  const jsxDevRuntimePath = path.join(reactPath, 'jsx-dev-runtime.js');
  if (!fs.existsSync(jsxDevRuntimePath) && fs.existsSync(path.join(reactPath, 'cjs'))) {
    fs.writeFileSync(jsxDevRuntimePath, `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-jsx-dev-runtime.production.min.js');
} else {
  module.exports = require('./cjs/react-jsx-dev-runtime.development.js');
}
`);
    console.log('Created react/jsx-dev-runtime.js');
  }
}

// Fix React DOM
const reactDomPath = path.join(nodeModulesPath, 'react-dom');
if (fs.existsSync(reactDomPath)) {
  const indexPath = path.join(reactDomPath, 'index.js');
  if (!fs.existsSync(indexPath) && fs.existsSync(path.join(reactDomPath, 'cjs'))) {
    fs.writeFileSync(indexPath, `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react-dom.production.min.js');
} else {
  module.exports = require('./cjs/react-dom.development.js');
}
`);
    console.log('Created react-dom/index.js');
  }
}

console.log('Postinstall setup completed!');

// Run the ESM fix
try {
  require('./fix-react-esm.js');
} catch (error) {
  console.error('Failed to run ESM fix:', error.message);
}
