#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== PTO Connect Build Test ===\n');

// Check Node version
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm --version').toString().trim());

// Check if node_modules exists
const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
console.log('\nnode_modules exists:', nodeModulesExists);

if (!nodeModulesExists) {
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install --legacy-peer-deps', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

// Check React installation
const reactPath = path.join(__dirname, '..', 'node_modules', 'react');
const jsxRuntimePath = path.join(reactPath, 'jsx-runtime.js');
const cjsPath = path.join(reactPath, 'cjs');

console.log('\n=== React Installation Check ===');
console.log('React installed:', fs.existsSync(reactPath));
console.log('jsx-runtime.js exists:', fs.existsSync(jsxRuntimePath));
console.log('CJS folder exists:', fs.existsSync(cjsPath));

if (fs.existsSync(cjsPath)) {
  const cjsFiles = fs.readdirSync(cjsPath).filter(f => f.includes('jsx-runtime'));
  console.log('CJS jsx-runtime files:', cjsFiles);
}

// Test different build commands
console.log('\n=== Testing Build Commands ===');

const buildCommands = [
  { name: 'Standard build', cmd: 'npm run build' },
  { name: 'Vercel build', cmd: 'npm run build:vercel' }
];

for (const { name, cmd } of buildCommands) {
  console.log(`\nTesting: ${name}`);
  console.log(`Command: ${cmd}`);
  
  try {
    // Clean dist directory
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
    
    // Run build
    const startTime = Date.now();
    execSync(cmd, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'production' }
    });
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ ${name} succeeded in ${buildTime}s`);
    
    // Check output
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      console.log(`Output files: ${files.length} files generated`);
    }
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
  }
}

console.log('\n=== Build Test Complete ===');
