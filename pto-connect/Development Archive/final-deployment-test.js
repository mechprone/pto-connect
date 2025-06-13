#!/usr/bin/env node

/**
 * 🎯 Final Deployment Test
 * 
 * Quick test to verify the npm start fix worked
 */

import fetch from 'node-fetch';

const CONFIG = {
  checkInterval: 15 * 1000, // 15 seconds
  maxChecks: 20, // 5 minutes total
  endpoints: {
    backend: 'https://api.ptoconnect.com/api/health',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  }
};

let checkCount = 0;
let successCount = 0;

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    deploy: '🚀'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const quickTest = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'PTO-Final-Test/1.0' }
    });
    
    const operational = response.status === 200;
    log(`${name}: ${operational ? '✅ OK' : `❌ FAILED (${response.status})`}`, operational ? 'success' : 'error');
    return operational;
  } catch (error) {
    log(`${name}: ❌ FAILED - ${error.message}`, 'error');
    return false;
  }
};

const runTest = async () => {
  log('🎯 Starting Final Deployment Test', 'deploy');
  log('Testing npm start fix for nixpacks deployments...', 'info');
  
  while (checkCount < CONFIG.maxChecks) {
    checkCount++;
    
    log(`=== TEST ${checkCount}/${CONFIG.maxChecks} ===`, 'info');
    
    const backendOk = await quickTest(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await quickTest(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (backendOk && frontendOk && publicOk) {
      successCount++;
      log(`🎉 ALL SYSTEMS OPERATIONAL! (Success #${successCount})`, 'success');
      
      if (successCount >= 2) {
        // Need 2 consecutive successes to confirm stability
        const report = `# 🎉 DEPLOYMENT SUCCESS!

**Time:** ${new Date().toISOString()}  
**Tests:** ${checkCount}  
**Status:** ✅ ALL SYSTEMS FULLY OPERATIONAL  

## Final Results
- ✅ Backend API: Operational
- ✅ Frontend App: Operational  
- ✅ Public Site: Operational

## Fix Applied
- **Problem:** \`npx serve\` failing in Railway environment
- **Solution:** Changed to \`npm start\` using local serve dependency
- **Result:** All deployments now working correctly

## System Status
- 🎯 **Ready for comprehensive evaluation**
- 🎯 **Ready for user testing**
- 🎯 **Ready for feature development**

**🚀 PTO Connect system is now fully operational on Railway!**
`;
        
        console.log('\n' + report);
        process.exit(0);
      }
    } else {
      successCount = 0; // Reset success counter
      log(`Status: ${operational}/3 systems operational`, operational > 0 ? 'warning' : 'error');
    }
    
    if (checkCount < CONFIG.maxChecks) {
      log(`Next test in ${CONFIG.checkInterval/1000} seconds...`, 'info');
      await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
    }
  }
  
  // Final status
  log('⚠️ Test period complete - generating final report...', 'warning');
  
  const finalBackend = await quickTest(CONFIG.endpoints.backend, 'Backend');
  const finalFrontend = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
  const finalPublic = await quickTest(CONFIG.endpoints.public, 'Public');
  
  const report = `# 📊 Final Deployment Test Results

**Time:** ${new Date().toISOString()}  
**Tests:** ${checkCount}  
**Duration:** ${(checkCount * CONFIG.checkInterval) / 60000} minutes  

## Final Status
- ${finalBackend ? '✅' : '❌'} Backend API: ${finalBackend ? 'Operational' : 'Failed'}
- ${finalFrontend ? '✅' : '❌'} Frontend App: ${finalFrontend ? 'Operational' : 'Failed'}
- ${finalPublic ? '✅' : '❌'} Public Site: ${finalPublic ? 'Operational' : 'Failed'}

## Analysis
${finalBackend && finalFrontend && finalPublic ? 
  '✅ All systems working - npm start fix successful!' : 
  '⚠️ Some systems still failing - may need additional investigation'
}

## Next Steps
${finalBackend && finalFrontend && finalPublic ? 
  '🎯 Proceed with comprehensive system evaluation' : 
  '🔧 Additional debugging required for failed components'
}
`;
  
  console.log('\n' + report);
  process.exit(finalBackend && finalFrontend && finalPublic ? 0 : 1);
};

runTest().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
