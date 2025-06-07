#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Fixing React package.json files...');

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

// Fix React package.json
const reactPackageJsonPath = path.join(nodeModulesPath, 'react', 'package.json');
const reactPackageJson = JSON.parse(fs.readFileSync(reactPackageJsonPath, 'utf8'));
delete reactPackageJson.exports;
fs.writeFileSync(reactPackageJsonPath, JSON.stringify(reactPackageJson, null, 2));
console.log('Fixed react/package.json');

// Fix React DOM package.json
const reactDomPackageJsonPath = path.join(nodeModulesPath, 'react-dom', 'package.json');
const reactDomPackageJson = JSON.parse(fs.readFileSync(reactDomPackageJsonPath, 'utf8'));
delete reactDomPackageJson.exports;
fs.writeFileSync(reactDomPackageJsonPath, JSON.stringify(reactDomPackageJson, null, 2));
console.log('Fixed react-dom/package.json');

console.log('React packages fixed!');
