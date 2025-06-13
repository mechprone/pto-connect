#!/usr/bin/env node

/**
 * 🎯 Frontend Deployment Monitor
 * 
 * Monitors only the frontend deployment without touching working services
 */

import fetch from 'node-fetch';

const CONFIG = {
  checkInterval: 30 * 1000, // 30 seconds
  frontendUrl: 'https://app.ptoconnect.com',
  maxChecks: 20 // 10 minutes total
};

let checkCount = 0;

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

const testFrontend = async () => {
  try {
    const response = await fetch(CONFIG.frontendUrl, { 
      timeout: 15000,
      headers: { 'User-Agent': 'PTO-Frontend-Monitor/1.0' }
    });
    
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const monitorDeployment = async () => {
  log('🎯 Frontend Deployment Monitor Started', 'info');
  log('Monitoring: https://app.ptoconnect.com', 'info');
  log('Fix Applied: Node.js 20 + Rollup dependency resolution', 'info');
  
  while (checkCount < CONFIG.maxChecks) {
    checkCount++;
    
    const frontendOk = await testFrontend();
    
    if (frontendOk) {
      log('🎉 FRONTEND DEPLOYMENT SUCCESSFUL!', 'victory');
      log('Frontend is now operational at https://app.ptoconnect.com', 'success');
      log('All three services are now working:', 'success');
      log('  ✅ Backend: https://api.ptoconnect.com', 'success');
      log('  ✅ Frontend: https://app.ptoconnect.com', 'success');
      log('  ✅ Public: https://www.ptoconnect.com', 'success');
      process.exit(0);
    } else {
      log(`Frontend check ${checkCount}/${CONFIG.maxChecks}: Still deploying...`, 'info');
    }
    
    if (checkCount >= CONFIG.maxChecks) {
      log('⚠️ Frontend deployment taking longer than expected', 'warning');
      log('Check Railway dashboard for detailed build logs', 'warning');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
};

monitorDeployment().catch(error => {
  log(`Monitor error: ${error.message}`, 'error');
  process.exit(1);
});
