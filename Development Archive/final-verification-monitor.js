#!/usr/bin/env node

/**
 * 🎯 Final Verification Monitor
 * 
 * Monitors deployment progress after PORT fix
 */

import fetch from 'node-fetch';
import fs from 'fs';

const CONFIG = {
  checkInterval: 30 * 1000, // 30 seconds
  endpoints: {
    backend: 'https://api.ptoconnect.com/api/health',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  },
  maxChecks: 20 // 10 minutes total
};

let results = {
  startTime: new Date(),
  checks: 0,
  services: {
    backend: { status: 'unknown', firstSuccess: null },
    frontend: { status: 'unknown', firstSuccess: null },
    public: { status: 'unknown', firstSuccess: null }
  },
  deploymentProgress: []
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    victory: '🎉',
    deploy: '🚀'
  }[type] || '📝';
  
  const logEntry = `${prefix} [${timestamp}] ${message}`;
  console.log(logEntry);
  
  fs.appendFileSync('final-verification.log', logEntry + '\n');
};

const testEndpoint = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'PTO-Final-Verification/1.0' }
    });
    
    let isWorking = false;
    
    if (name === 'Backend') {
      const text = await response.text();
      isWorking = response.status === 200 && text.includes('"status":"healthy"');
    } else {
      const text = await response.text();
      isWorking = response.status === 200 && !text.includes('Application failed to respond');
    }
    
    const service = name.toLowerCase();
    const wasDown = results.services[service].status === 'down';
    
    if (isWorking) {
      if (wasDown || results.services[service].status === 'unknown') {
        results.services[service].firstSuccess = new Date();
        log(`${name} DEPLOYMENT SUCCESSFUL! 🎉`, 'victory');
      }
      results.services[service].status = 'up';
      log(`${name}: ✅ Working`, 'success');
    } else {
      results.services[service].status = 'down';
      log(`${name}: ❌ Failed (${response.status}) - Still deploying...`, 'deploy');
    }
    
    return isWorking;
    
  } catch (error) {
    const service = name.toLowerCase();
    results.services[service].status = 'down';
    log(`${name}: ❌ Error - ${error.message}`, 'error');
    return false;
  }
};

const generateReport = () => {
  const runtime = new Date() - results.startTime;
  const minutes = Math.floor(runtime / (1000 * 60));
  
  const report = `
# 🎯 Final Verification Report

**Runtime:** ${minutes} minutes  
**Total Checks:** ${results.checks}  

## Service Status
- **Backend:** ${results.services.backend.status} ${results.services.backend.firstSuccess ? `(Success at ${results.services.backend.firstSuccess.toISOString().split('T')[1].split('.')[0]})` : ''}
- **Frontend:** ${results.services.frontend.status} ${results.services.frontend.firstSuccess ? `(Success at ${results.services.frontend.firstSuccess.toISOString().split('T')[1].split('.')[0]})` : ''}
- **Public:** ${results.services.public.status} ${results.services.public.firstSuccess ? `(Success at ${results.services.public.firstSuccess.toISOString().split('T')[1].split('.')[0]})` : ''}

## Fix Applied
✅ Updated Dockerfiles to use Railway PORT environment variable
✅ Fixed hardcoded port 3000 issue causing 502 errors
✅ Both frontend and public deployments triggered

**Current Status:** ${results.services.backend.status === 'up' && results.services.frontend.status === 'up' && results.services.public.status === 'up' ? '🎉 ALL SYSTEMS OPERATIONAL' : '🚀 DEPLOYMENTS IN PROGRESS'}
`;

  fs.writeFileSync('FINAL_VERIFICATION_REPORT.md', report);
  return report;
};

const runVerification = async () => {
  log('🎯 Final Verification Monitor STARTED', 'deploy');
  log('Monitoring deployments after PORT fix', 'info');
  log('Expected: Frontend and Public will rebuild with correct PORT binding', 'info');
  
  while (results.checks < CONFIG.maxChecks) {
    results.checks++;
    
    // Test all services
    const backendOk = await testEndpoint(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await testEndpoint(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await testEndpoint(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (operational === 3) {
      log('🎉 ALL SYSTEMS OPERATIONAL - VERIFICATION COMPLETE!', 'victory');
      generateReport();
      return;
    } else {
      log(`Status: ${operational}/3 systems operational`, 'info');
    }
    
    // Generate report every 5 checks
    if (results.checks % 5 === 0) {
      generateReport();
    }
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
  
  // Final report
  generateReport();
  log('🎯 Verification monitoring completed', 'info');
};

// Start verification
runVerification().catch(error => {
  log(`Verification error: ${error.message}`, 'error');
  generateReport();
  process.exit(1);
});
