#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating React module wrappers for Vercel...');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Create a wrapper for React that doesn't use CJS
const reactWrapperPath = path.join(__dirname, '..', 'react-wrapper.js');
const reactWrapperContent = `
// React wrapper to avoid CJS issues
import * as ReactProd from 'react/cjs/react.production.min.js';
import * as ReactDev from 'react/cjs/react.development.js';

const React = process.env.NODE_ENV === 'production' ? ReactProd : ReactDev;

export default React;
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
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  version
} = React;
`;

fs.writeFileSync(reactWrapperPath, reactWrapperContent);
console.log('Created react-wrapper.js');

// Create a wrapper for React DOM
const reactDomWrapperPath = path.join(__dirname, '..', 'react-dom-wrapper.js');
const reactDomWrapperContent = `
// React DOM wrapper to avoid CJS issues
import * as ReactDOMProd from 'react-dom/cjs/react-dom.production.min.js';
import * as ReactDOMDev from 'react-dom/cjs/react-dom.development.js';

const ReactDOM = process.env.NODE_ENV === 'production' ? ReactDOMProd : ReactDOMDev;

export default ReactDOM;
export const {
  createPortal,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_createPortal,
  unstable_renderSubtreeIntoContainer,
  version
} = ReactDOM;

// Client-specific exports
export const createRoot = ReactDOM.createRoot;
export const hydrateRoot = ReactDOM.hydrateRoot;
`;

fs.writeFileSync(reactDomWrapperPath, reactDomWrapperContent);
console.log('Created react-dom-wrapper.js');

console.log('\nModule wrappers created successfully!');
