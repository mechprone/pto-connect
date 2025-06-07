export function fixReactPlugin() {
  return {
    name: 'fix-react',
    enforce: 'pre',
    resolveId(id) {
      // Intercept React module resolution
      if (id === 'react' || id.startsWith('react/')) {
        return null; // Let Vite handle it normally
      }
    },
    load(id) {
      // If we're trying to load a CJS React file, redirect to ESM
      if (id.includes('react') && id.includes('/cjs/')) {
        // Return a simple module that re-exports React
        if (id.includes('react-jsx-runtime')) {
          return `export * from 'react/jsx-runtime.js';`;
        }
        if (id.includes('react-dom')) {
          return `export * from 'react-dom';`;
        }
        return `export * from 'react';`;
      }
    },
    transform(code, id) {
      // Fix any remaining CJS requires
      if (id.includes('node_modules') && code.includes('require')) {
        // Don't transform - let it fail so we can see what's happening
        return null;
      }
    }
  };
}
