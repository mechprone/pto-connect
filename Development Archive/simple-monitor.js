#!/usr/bin/env node

/**
 * 🔍 Simple Deployment Monitor
 * 
 * Checks deployments every 20 seconds and reports status
 */

import fetch from 'node-fetch';

const CONFIG = {
  checkInterval: 20 * 1000, // 20 seconds
  maxChecks: 15, // 5 minutes total
  endpoints: {
    backend: 'https://api.ptoconnect.com/api/health',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  }
};

let checkCount = 0;

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const quickTest = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 8000,
      headers: { 'User-Agent': 'PTO-Simple-Monitor/1.0' }
    });
    
    const operational = response.status === 200;
    log(`${name}: ${operational ? '✅ OK' : `❌ FAILED (${response.status})`}`, operational ? 'success' : 'error');
    return operational;
  } catch (error) {
    log(`${name}: ❌ FAILED - ${error.message}`, 'error');
    return false;
  }
};

const monitor = async () => {
  log('🔍 Starting Simple Deployment Monitor', 'info');
  log('Checking deployments every 20 seconds...', 'info');
  
  while (checkCount < CONFIG.maxChecks) {
    checkCount++;
    
    log(`=== CHECK ${checkCount}/${CONFIG.maxChecks} ===`, 'info');
    
    const backendOk = await quickTest(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await quickTest(CONFIG.endpoints.public, 'Public');
    
    if (backendOk && frontendOk && publicOk) {
      log('🎉 ALL SYSTEMS OPERATIONAL!', 'success');
      
      const report = `# ✅ Deployment Success Report

**Time:** ${new Date().toISOString()}  
**Checks:** ${checkCount}  
**Status:** ALL SYSTEMS OPERATIONAL  

## Results
- ✅ Backend API: Operational
- ✅ Frontend App: Operational  
- ✅ Public Site: Operational

## Changes Applied
- Switched from Docker to nixpacks
- Fixed build dependencies
- Added fallback configurations

**🎯 System ready for testing and development!**
`;
      
      console.log('\n' + report);
      process.exit(0);
    }
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    log(`Status: ${operational}/3 systems operational`, operational === 3 ? 'success' : 'warning');
    
    if (checkCount < CONFIG.maxChecks) {
      log(`Next check in ${CONFIG.checkInterval/1000} seconds...`, 'info');
      await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
    }
  }
  
  log('⚠️ Monitoring complete - generating final report...', 'warning');
  
  const finalBackend = await quickTest(CONFIG.endpoints.backend, 'Backend');
  const finalFrontend = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
  const finalPublic = await quickTest(CONFIG.endpoints.public, 'Public');
  
  const report = `# 📊 Final Deployment Status

**Time:** ${new Date().toISOString()}  
**Checks:** ${checkCount}  
**Duration:** ${(checkCount * CONFIG.checkInterval) / 1000} seconds  

## Final Results
- ${finalBackend ? '✅' : '❌'} Backend API: ${finalBackend ? 'Operational' : 'Failed'}
- ${finalFrontend ? '✅' : '❌'} Frontend App: ${finalFrontend ? 'Operational' : 'Failed'}
- ${finalPublic ? '✅' : '❌'} Public Site: ${finalPublic ? 'Operational' : 'Failed'}

## Next Steps
${finalBackend && finalFrontend && finalPublic ? 
  '✅ All systems working - ready for testing!' : 
  '⚠️ Some systems still failing - may need additional fixes'
}
`;
  
  console.log('\n' + report);
  process.exit(finalBackend && finalFrontend && finalPublic ? 0 : 1);
};

monitor().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
