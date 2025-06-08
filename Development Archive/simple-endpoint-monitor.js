#!/usr/bin/env node

/**
 * 🔍 Simple Endpoint Monitor
 * 
 * Tests endpoints without touching repo directories
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
  testDuration: 30 * 60 * 1000 // 30 minutes
};

let results = {
  startTime: new Date(),
  checks: 0,
  services: {
    backend: { up: 0, down: 0, status: 'unknown' },
    frontend: { up: 0, down: 0, status: 'unknown' },
    public: { up: 0, down: 0, status: 'unknown' }
  }
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    victory: '🎉'
  }[type] || '📝';
  
  const logEntry = `${prefix} [${timestamp}] ${message}`;
  console.log(logEntry);
  
  fs.appendFileSync('endpoint-monitor.log', logEntry + '\n');
};

const testEndpoint = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'PTO-Monitor/1.0' }
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
    
    if (isWorking) {
      results.services[service].up++;
      if (results.services[service].status === 'down') {
        log(`${name} RECOVERED! 🎉`, 'success');
      }
      results.services[service].status = 'up';
      log(`${name}: ✅ Working`, 'success');
    } else {
      results.services[service].down++;
      results.services[service].status = 'down';
      log(`${name}: ❌ Failed (${response.status})`, 'error');
    }
    
    return isWorking;
    
  } catch (error) {
    const service = name.toLowerCase();
    results.services[service].down++;
    results.services[service].status = 'down';
    log(`${name}: ❌ Error - ${error.message}`, 'error');
    return false;
  }
};

const generateReport = () => {
  const runtime = new Date() - results.startTime;
  const minutes = Math.floor(runtime / (1000 * 60));
  
  const report = `
# 🔍 Endpoint Monitor Report

**Runtime:** ${minutes} minutes  
**Total Checks:** ${results.checks}  

## Service Status
- **Backend:** ${results.services.backend.status} (${results.services.backend.up}/${results.services.backend.up + results.services.backend.down})
- **Frontend:** ${results.services.frontend.status} (${results.services.frontend.up}/${results.services.frontend.up + results.services.frontend.down})
- **Public:** ${results.services.public.status} (${results.services.public.up}/${results.services.public.up + results.services.public.down})

**Current Status:** ${results.services.backend.status === 'up' && results.services.frontend.status === 'up' && results.services.public.status === 'up' ? '🎉 ALL SYSTEMS OPERATIONAL' : '⚠️ MONITORING IN PROGRESS'}
`;

  fs.writeFileSync('ENDPOINT_MONITOR_REPORT.md', report);
  return report;
};

const runMonitor = async () => {
  log('🔍 Simple Endpoint Monitor STARTED', 'info');
  log('Monitoring without touching repo directories', 'info');
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < CONFIG.testDuration) {
    results.checks++;
    
    // Test all services
    const backendOk = await testEndpoint(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await testEndpoint(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await testEndpoint(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (operational === 3) {
      log('🎉 ALL SYSTEMS OPERATIONAL', 'victory');
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
  log('🔍 Monitoring completed', 'success');
};

// Start monitoring
runMonitor().catch(error => {
  log(`Monitor error: ${error.message}`, 'error');
  generateReport();
  process.exit(1);
});
