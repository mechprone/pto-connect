#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Adding React imports to all JSX files...');

function addReactImport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if React is already imported
  if (content.includes('import React') || content.includes('require(\'react\')')) {
    return false;
  }
  
  // Add React import at the beginning
  const newContent = `import React from 'react';\n${content}`;
  fs.writeFileSync(filePath, newContent);
  return true;
}

function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      count += processDirectory(filePath);
    } else if (file.endsWith('.jsx')) {
      if (addReactImport(filePath)) {
        console.log(`Updated: ${filePath}`);
        count++;
      }
    }
  }
  
  return count;
}

const srcPath = path.join(__dirname, '..', 'src');
const updatedCount = processDirectory(srcPath);

console.log(`\nUpdated ${updatedCount} files with React imports.`);
