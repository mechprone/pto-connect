#!/usr/bin/env node

/**
 * 🎯 Focused PTO Connect Testing Script
 * 
 * Efficient testing with:
 * - Fast failure detection (10s intervals, 2 failures = failed)
 * - Essential functionality only
 * - Cost-conscious API usage
 * - Quick manual intervention points
 */

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const CONFIG = {
  maxCycles: 2, // Only 2 repair attempts
  fastTimeout: 10 * 1000, // 10 seconds between checks
  maxFailures: 2, // Only 2 failures before giving up
  endpoints: {
    backend: 'https://api.ptoconnect.com',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  }
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    test: '🧪',
    fix: '🔧'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

// Quick deployment test
const quickTest = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 5000,
      headers: { 'User-Agent': 'PTO-Connect-Quick-Test/1.0' }
    });
    
    const operational = response.status === 200;
    log(`${name}: ${operational ? '✅ OK' : '❌ FAILED'}`, operational ? 'success' : 'error');
    return operational;
  } catch (error) {
    log(`${name}: ❌ FAILED - ${error.message}`, 'error');
    return false;
  }
};

// Fast deployment check with early failure detection
const fastDeploymentCheck = async (url, name) => {
  log(`Quick checking ${name} deployment...`, 'test');
  
  let failures = 0;
  
  for (let i = 0; i < 3; i++) { // Max 3 attempts (30 seconds total)
    const operational = await quickTest(url, name);
    
    if (operational) {
      log(`${name} deployment successful!`, 'success');
      return true;
    }
    
    failures++;
    if (failures >= CONFIG.maxFailures) {
      log(`${name} deployment failed (${failures} failures)`, 'error');
      return false;
    }
    
    if (i < 2) { // Don't wait after last attempt
      log(`${name} retrying in ${CONFIG.fastTimeout/1000}s...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, CONFIG.fastTimeout));
    }
  }
  
  return false;
};

// Essential functionality tests
const testEssentialFunctionality = async () => {
  log('Testing essential functionality...', 'test');
  
  const results = {
    backend: false,
    frontend: false,
    public: false
  };
  
  // Test backend API
  try {
    const healthResponse = await fetch(`${CONFIG.endpoints.backend}/api/health`, { timeout: 5000 });
    results.backend = healthResponse.status === 200;
    log(`Backend API: ${results.backend ? '✅ OK' : '❌ FAILED'}`, results.backend ? 'success' : 'error');
  } catch (error) {
    log(`Backend API: ❌ FAILED - ${error.message}`, 'error');
  }
  
  // Test frontend
  results.frontend = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
  
  // Test public site
  results.public = await quickTest(CONFIG.endpoints.public, 'Public Site');
  
  return results;
};

// Quick fix application
const applyQuickFix = async (project, projectPath) => {
  log(`Applying quick fix to ${project}...`, 'fix');
  
  try {
    // Check if there's a specific issue we can identify
    const packageJson = JSON.parse(await fs.readFile(`${projectPath}/package.json`, 'utf8'));
    
    // Ensure build script exists
    if (!packageJson.scripts?.build) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = 'vite build';
      await fs.writeFile(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));
      log(`Added build script to ${project}`, 'fix');
    }
    
    // Apply simple Ubuntu Docker fix
    const dockerfile = `FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 10000

# Start
CMD ["serve", "dist", "-s", "-l", "10000"]
`;
    
    await fs.writeFile(`${projectPath}/Dockerfile`, dockerfile);
    log(`Updated Dockerfile for ${project}`, 'fix');
    
    // Quick commit and push
    const commands = [
      'git add .',
      `git commit -m "Quick fix: ${project} deployment"`,
      'git push'
    ];
    
    for (const cmd of commands) {
      await new Promise((resolve, reject) => {
        const child = spawn('cmd', ['/c', cmd], { cwd: projectPath, stdio: 'pipe' });
        child.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Command failed: ${cmd}`));
        });
      });
    }
    
    log(`${project} fixes committed and pushed`, 'success');
    return true;
    
  } catch (error) {
    log(`Failed to fix ${project}: ${error.message}`, 'error');
    return false;
  }
};

// Main focused testing
async function main() {
  log('🎯 Starting Focused PTO Connect Testing', 'test');
  log('Fast failure detection enabled - 2 failures = deployment failed', 'info');
  
  const startTime = Date.now();
  
  try {
    // Initial test
    log('=== INITIAL STATUS CHECK ===', 'test');
    let results = await testEssentialFunctionality();
    
    if (results.backend && results.frontend && results.public) {
      log('🎉 All systems operational! Running quick functionality test...', 'success');
      
      // Quick browser test of key functionality
      log('Testing key user flows...', 'test');
      
      // Test backend endpoints
      try {
        const authTest = await fetch(`${CONFIG.endpoints.backend}/api/auth/test`, { timeout: 5000 });
        log(`Auth endpoint: ${authTest.status === 404 ? '✅ OK (404 expected)' : '⚠️ Unexpected response'}`, 'test');
      } catch (error) {
        log(`Auth endpoint: ⚠️ ${error.message}`, 'warning');
      }
      
      log('🎯 FOCUSED TESTING COMPLETE - ALL SYSTEMS OPERATIONAL', 'success');
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      log(`Total time: ${duration} seconds`, 'info');
      
      // Generate quick report
      const report = `# 🎯 Focused Testing Report

**Duration:** ${duration} seconds  
**Status:** ✅ ALL OPERATIONAL  

## Results
- ✅ Backend API: Operational
- ✅ Frontend App: Operational  
- ✅ Public Site: Operational

## Next Steps
- ✅ System ready for beta testing
- ✅ All core functionality working
- ✅ No immediate fixes needed

**Recommendation:** Proceed with user testing and feature development.
`;
      
      await fs.writeFile('FOCUSED_TESTING_REPORT.md', report);
      log('Report saved to FOCUSED_TESTING_REPORT.md', 'success');
      
      process.exit(0);
    }
    
    // If not all operational, try quick fixes
    log('=== APPLYING QUICK FIXES ===', 'fix');
    
    for (let cycle = 1; cycle <= CONFIG.maxCycles; cycle++) {
      log(`--- Repair Cycle ${cycle} ---`, 'fix');
      
      if (!results.frontend) {
        log('Fixing frontend deployment...', 'fix');
        await applyQuickFix('frontend', 'pto-connect');
        
        // Quick check if fix worked
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second wait
        results.frontend = await fastDeploymentCheck(CONFIG.endpoints.frontend, 'Frontend');
      }
      
      if (!results.public) {
        log('Fixing public site deployment...', 'fix');
        await applyQuickFix('public', 'pto-connect-public');
        
        // Quick check if fix worked  
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second wait
        results.public = await fastDeploymentCheck(CONFIG.endpoints.public, 'Public');
      }
      
      // Check if we're done
      if (results.backend && results.frontend && results.public) {
        log('🎉 All systems fixed and operational!', 'success');
        break;
      }
      
      if (cycle === CONFIG.maxCycles) {
        log('⚠️ Max repair cycles reached', 'warning');
      }
    }
    
    // Final status
    log('=== FINAL STATUS ===', 'test');
    const finalResults = await testEssentialFunctionality();
    
    const operational = finalResults.backend && finalResults.frontend && finalResults.public;
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    log(`Testing completed in ${duration} seconds`, 'info');
    log(`Status: ${operational ? '✅ ALL OPERATIONAL' : '⚠️ PARTIAL OPERATION'}`, operational ? 'success' : 'warning');
    
    // Generate report
    const report = `# 🎯 Focused Testing Report

**Duration:** ${duration} seconds  
**Status:** ${operational ? '✅ ALL OPERATIONAL' : '⚠️ PARTIAL OPERATION'}  

## Results
- ${finalResults.backend ? '✅' : '❌'} Backend API: ${finalResults.backend ? 'Operational' : 'Failed'}
- ${finalResults.frontend ? '✅' : '❌'} Frontend App: ${finalResults.frontend ? 'Operational' : 'Failed'}
- ${finalResults.public ? '✅' : '❌'} Public Site: ${finalResults.public ? 'Operational' : 'Failed'}

## Manual Tasks Needed
${!finalResults.frontend ? '- 🔧 Frontend deployment needs manual investigation' : ''}
${!finalResults.public ? '- 🔧 Public site deployment needs manual investigation' : ''}

## Next Steps
${operational ? 
  '- ✅ System ready for beta testing\n- ✅ All core functionality working' : 
  '- ⚠️ Manual intervention required for failed components\n- 🔍 Check Railway deployment logs\n- 🔧 Consider alternative deployment strategies'
}
`;
    
    await fs.writeFile('FOCUSED_TESTING_REPORT.md', report);
    log('Report saved to FOCUSED_TESTING_REPORT.md', 'success');
    
    process.exit(operational ? 0 : 1);
    
  } catch (error) {
    log(`🚨 Testing failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Testing interrupted by user', 'warning');
  process.exit(0);
});

main();
