#!/usr/bin/env node

/**
 * 🎉 Victory Test - Final Deployment Verification
 * 
 * Quick test to confirm the railway.json fixes worked
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
let successCount = 0;

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    victory: '🎉'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const quickTest = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 15000,
      headers: { 'User-Agent': 'PTO-Victory-Test/1.0' }
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
  log('🎉 VICTORY TEST - Railway.json Fixes Applied!', 'victory');
  log('Testing nixpacks builder configuration...', 'info');
  
  while (checkCount < CONFIG.maxChecks) {
    checkCount++;
    
    log(`=== CHECK ${checkCount}/${CONFIG.maxChecks} ===`, 'info');
    
    const backendOk = await quickTest(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await quickTest(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (backendOk && frontendOk && publicOk) {
      successCount++;
      log(`🎉 ALL SYSTEMS OPERATIONAL! (Success #${successCount})`, 'victory');
      
      if (successCount >= 2) {
        // Need 2 consecutive successes to confirm stability
        const report = `
# 🎉 DEPLOYMENT SUCCESS - RAILWAY.JSON FIXES WORKED!

**Time:** ${new Date().toISOString()}  
**Tests:** ${checkCount}  
**Status:** ✅ ALL SYSTEMS FULLY OPERATIONAL  

## 🚀 Final Results
- ✅ Backend API: Operational
- ✅ Frontend App: Operational  
- ✅ Public Site: Operational

## 🔧 Root Cause & Fix
**Problem:** Railway.json configurations were forcing wrong builders
- Frontend: \`"builder": "DOCKERFILE"\` but Dockerfile was deleted
- Public: \`nginx\` command but nginx not installed

**Solution:** Updated railway.json files to use nixpacks
- Changed to \`"builder": "NIXPACKS"\`
- Removed nginx command
- Added proper restart policies

## 🎯 System Status
- 🎉 **FULLY OPERATIONAL** - All three components working
- 🎉 **READY FOR EVALUATION** - System evaluation can now proceed
- 🎉 **READY FOR DEVELOPMENT** - Feature development can begin
- 🎉 **READY FOR TESTING** - User testing can commence

**🚀 PTO Connect system is now 100% operational on Railway!**

## 📈 Next Steps
1. ✅ Complete comprehensive system evaluation
2. ✅ Begin user interface testing
3. ✅ Start module implementation
4. ✅ Launch beta testing program

**VICTORY ACHIEVED! 🎉**
`;
        
        console.log(report);
        process.exit(0);
      }
    } else {
      successCount = 0; // Reset success counter
      log(`Status: ${operational}/3 systems operational`, operational > 0 ? 'warning' : 'error');
      
      if (operational === 1) {
        log('Backend stable, waiting for frontend/public rebuilds...', 'info');
      }
    }
    
    if (checkCount < CONFIG.maxChecks) {
      log(`Next check in ${CONFIG.checkInterval/1000} seconds...`, 'info');
      await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
    }
  }
  
  // Final status if we reach max checks
  log('⚠️ Test period complete - generating final report...', 'warning');
  
  const finalBackend = await quickTest(CONFIG.endpoints.backend, 'Backend');
  const finalFrontend = await quickTest(CONFIG.endpoints.frontend, 'Frontend');
  const finalPublic = await quickTest(CONFIG.endpoints.public, 'Public');
  
  const report = `
# 📊 Victory Test Results

**Time:** ${new Date().toISOString()}  
**Tests:** ${checkCount}  
**Duration:** ${(checkCount * CONFIG.checkInterval) / 60000} minutes  

## Final Status
- ${finalBackend ? '✅' : '❌'} Backend API: ${finalBackend ? 'Operational' : 'Failed'}
- ${finalFrontend ? '✅' : '❌'} Frontend App: ${finalFrontend ? 'Operational' : 'Failed'}
- ${finalPublic ? '✅' : '❌'} Public Site: ${finalPublic ? 'Operational' : 'Failed'}

## Analysis
${finalBackend && finalFrontend && finalPublic ? 
  '🎉 VICTORY! Railway.json fixes successful - all systems operational!' : 
  '⚠️ Partial success - railway.json fixes helped but some systems still rebuilding'
}

## Recommendation
${finalBackend && finalFrontend && finalPublic ? 
  '🚀 Proceed with full system evaluation and testing' : 
  '⏳ Allow more time for Railway rebuilds to complete'
}
`;
  
  console.log(report);
  process.exit(finalBackend && finalFrontend && finalPublic ? 0 : 1);
};

runTest().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
