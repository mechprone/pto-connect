#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating ESM wrappers for React...');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Create ESM wrapper for React
const reactPath = path.join(nodeModulesPath, 'react');
const reactIndexPath = path.join(reactPath, 'index.mjs');

const reactESMContent = `
// ESM wrapper for React
import * as ReactCJS from './cjs/react.production.min.js';
export default ReactCJS.default || ReactCJS;
export const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_act,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
} = ReactCJS.default || ReactCJS;
`;

fs.writeFileSync(reactIndexPath, reactESMContent);
console.log('Created react/index.mjs');

// Create ESM wrapper for React DOM
const reactDomPath = path.join(nodeModulesPath, 'react-dom');
const reactDomIndexPath = path.join(reactDomPath, 'index.mjs');

const reactDomESMContent = `
// ESM wrapper for React DOM
import * as ReactDOMCJS from './cjs/react-dom.production.min.js';
const ReactDOM = ReactDOMCJS.default || ReactDOMCJS;
export default ReactDOM;
export const {
  createPortal,
  createRoot,
  findDOMNode,
  flushSync,
  hydrate,
  hydrateRoot,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_renderSubtreeIntoContainer,
  version
} = ReactDOM;
`;

fs.writeFileSync(reactDomIndexPath, reactDomESMContent);
console.log('Created react-dom/index.mjs');

// Update package.json files to include ESM exports
const reactPackageJsonPath = path.join(reactPath, 'package.json');
const reactPackageJson = JSON.parse(fs.readFileSync(reactPackageJsonPath, 'utf8'));
reactPackageJson.exports = {
  '.': {
    'import': './index.mjs',
    'require': './index.js'
  },
  './jsx-runtime': './jsx-runtime.js',
  './jsx-dev-runtime': './jsx-dev-runtime.js',
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
  './client': './client.js',
  './server': './server.js',
  './package.json': './package.json'
};
fs.writeFileSync(reactDomPackageJsonPath, JSON.stringify(reactDomPackageJson, null, 2));
console.log('Updated react-dom/package.json');

console.log('\nESM wrappers created successfully!');
