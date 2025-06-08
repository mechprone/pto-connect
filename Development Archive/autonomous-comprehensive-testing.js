#!/usr/bin/env node

/**
 * 🤖 Autonomous Comprehensive Testing System
 * 
 * Incorporates all lessons learned from the evaluation:
 * - Continuous monitoring with intelligent repair
 * - Comprehensive testing across all systems
 * - Automated issue detection and resolution
 * - Full evaluation reporting
 */

import fetch from 'node-fetch';
import { execSync } from 'child_process';
import fs from 'fs';

const CONFIG = {
  checkInterval: 60 * 1000, // 1 minute
  endpoints: {
    backend: 'https://api.ptoconnect.com/api/health',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  },
  testDuration: 8 * 60 * 60 * 1000, // 8 hours
  maxRepairAttempts: 3
};

let testResults = {
  startTime: new Date(),
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0,
  repairsApplied: 0,
  services: {
    backend: { uptime: 0, downtime: 0, lastStatus: null },
    frontend: { uptime: 0, downtime: 0, lastStatus: null },
    public: { uptime: 0, downtime: 0, lastStatus: null }
  },
  issues: [],
  repairs: []
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    repair: '🔧',
    victory: '🎉',
    system: '🤖'
  }[type] || '📝';
  
  const logEntry = `${prefix} [${timestamp}] ${message}`;
  console.log(logEntry);
  
  // Also log to file for persistence
  fs.appendFileSync('autonomous-testing.log', logEntry + '\n');
};

const testEndpoint = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 15000,
      headers: { 'User-Agent': 'PTO-Autonomous-Test/1.0' }
    });
    
    const operational = response.status === 200;
    const service = name.toLowerCase();
    
    if (operational) {
      testResults.services[service].uptime++;
      if (testResults.services[service].lastStatus === false) {
        log(`${name} RECOVERED!`, 'success');
      }
    } else {
      testResults.services[service].downtime++;
      log(`${name}: FAILED (${response.status})`, 'error');
      testResults.issues.push({
        timestamp: new Date(),
        service: name,
        issue: `HTTP ${response.status}`,
        url: url
      });
    }
    
    testResults.services[service].lastStatus = operational;
    return operational;
    
  } catch (error) {
    const service = name.toLowerCase();
    testResults.services[service].downtime++;
    log(`${name}: FAILED - ${error.message}`, 'error');
    testResults.issues.push({
      timestamp: new Date(),
      service: name,
      issue: error.message,
      url: url
    });
    testResults.services[service].lastStatus = false;
    return false;
  }
};

const applyIntelligentRepair = async (service, issue) => {
  log(`Applying intelligent repair for ${service}...`, 'repair');
  
  try {
    let repairApplied = false;
    
    if (service === 'Frontend' && issue.includes('502')) {
      // Apply Node.js 20 + dependency fix
      log('Applying Node.js 20 + rollup dependency fix...', 'repair');
      
      const dockerfileContent = `# Use Node.js 20 Alpine for latest features
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies and clear npm cache
RUN rm -rf node_modules package-lock.json && \\
    npm install && \\
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
`;

      fs.writeFileSync('pto-connect/Dockerfile', dockerfileContent);
      
      execSync('cd pto-connect && git add . && git commit -m "AUTO-REPAIR: Node.js 20 + dependency fix" && git push', {
        stdio: 'inherit'
      });
      
      repairApplied = true;
      
    } else if (issue.includes('nixpacks') || issue.includes('checksum')) {
      // Apply nixpacks corruption fix
      log('Applying nixpacks corruption fix...', 'repair');
      
      const path = service === 'Frontend' ? 'pto-connect' : 'pto-connect-public';
      const railwayConfig = `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}`;
      
      fs.writeFileSync(`${path}/railway.json`, railwayConfig);
      
      execSync(`cd ${path} && git add . && git commit -m "AUTO-REPAIR: Fix nixpacks corruption" && git push`, {
        stdio: 'inherit'
      });
      
      repairApplied = true;
      
    } else {
      // Generic cache clear
      log('Applying generic cache clear...', 'repair');
      
      const path = service === 'Frontend' ? 'pto-connect' : 'pto-connect-public';
      const timestamp = new Date().toISOString();
      
      execSync(`cd ${path} && echo "# Auto-repair ${timestamp}" >> README.md`, { stdio: 'inherit' });
      execSync(`cd ${path} && git add . && git commit -m "AUTO-REPAIR: Cache clear ${timestamp}" && git push`, {
        stdio: 'inherit'
      });
      
      repairApplied = true;
    }
    
    if (repairApplied) {
      testResults.repairsApplied++;
      testResults.repairs.push({
        timestamp: new Date(),
        service: service,
        issue: issue,
        repairType: 'Intelligent Auto-Repair'
      });
      
      log(`${service} repair applied successfully!`, 'success');
      return true;
    }
    
  } catch (error) {
    log(`Failed to apply repair: ${error.message}`, 'error');
    return false;
  }
  
  return false;
};

const generateReport = () => {
  const runtime = new Date() - testResults.startTime;
  const hours = Math.floor(runtime / (1000 * 60 * 60));
  const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
  
  const report = `
# 🤖 Autonomous Testing Report

**Runtime:** ${hours}h ${minutes}m  
**Total Checks:** ${testResults.totalChecks}  
**Success Rate:** ${((testResults.successfulChecks / testResults.totalChecks) * 100).toFixed(1)}%  
**Repairs Applied:** ${testResults.repairsApplied}  

## Service Uptime
- **Backend:** ${testResults.services.backend.uptime}/${testResults.services.backend.uptime + testResults.services.backend.downtime} (${((testResults.services.backend.uptime / (testResults.services.backend.uptime + testResults.services.backend.downtime)) * 100).toFixed(1)}%)
- **Frontend:** ${testResults.services.frontend.uptime}/${testResults.services.frontend.uptime + testResults.services.frontend.downtime} (${((testResults.services.frontend.uptime / (testResults.services.frontend.uptime + testResults.services.frontend.downtime)) * 100).toFixed(1)}%)
- **Public:** ${testResults.services.public.uptime}/${testResults.services.public.uptime + testResults.services.public.downtime} (${((testResults.services.public.uptime / (testResults.services.public.uptime + testResults.services.public.downtime)) * 100).toFixed(1)}%)

## Issues Detected: ${testResults.issues.length}
${testResults.issues.slice(-10).map(issue => `- ${issue.timestamp.toISOString().split('T')[1].split('.')[0]} ${issue.service}: ${issue.issue}`).join('\n')}

## Repairs Applied: ${testResults.repairs.length}
${testResults.repairs.map(repair => `- ${repair.timestamp.toISOString().split('T')[1].split('.')[0]} ${repair.service}: ${repair.repairType}`).join('\n')}

**Status:** ${testResults.services.backend.lastStatus && testResults.services.frontend.lastStatus && testResults.services.public.lastStatus ? '🎉 ALL SYSTEMS OPERATIONAL' : '⚠️ ISSUES DETECTED'}
`;

  fs.writeFileSync('AUTONOMOUS_TESTING_REPORT.md', report);
  return report;
};

const runComprehensiveTest = async () => {
  log('🤖 Autonomous Comprehensive Testing System ACTIVATED', 'system');
  log('Duration: 8 hours with continuous monitoring and repair', 'system');
  log('Endpoints monitored:', 'system');
  log('  - Backend: https://api.ptoconnect.com/api/health', 'system');
  log('  - Frontend: https://app.ptoconnect.com', 'system');
  log('  - Public: https://www.ptoconnect.com', 'system');
  
  const startTime = Date.now();
  let repairAttempts = { frontend: 0, public: 0 };
  
  while (Date.now() - startTime < CONFIG.testDuration) {
    testResults.totalChecks++;
    
    const backendOk = await testEndpoint(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await testEndpoint(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await testEndpoint(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (operational === 3) {
      testResults.successfulChecks++;
      log('🎉 ALL SYSTEMS OPERATIONAL', 'victory');
      // Reset repair attempts on success
      repairAttempts = { frontend: 0, public: 0 };
    } else {
      testResults.failedChecks++;
      
      // Apply intelligent repairs
      if (!frontendOk && repairAttempts.frontend < CONFIG.maxRepairAttempts) {
        repairAttempts.frontend++;
        const lastIssue = testResults.issues[testResults.issues.length - 1];
        await applyIntelligentRepair('Frontend', lastIssue?.issue || 'Unknown');
      }
      
      if (!publicOk && repairAttempts.public < CONFIG.maxRepairAttempts) {
        repairAttempts.public++;
        const lastIssue = testResults.issues[testResults.issues.length - 1];
        await applyIntelligentRepair('Public', lastIssue?.issue || 'Unknown');
      }
      
      log(`Status: ${operational}/3 systems operational`, 'warning');
    }
    
    // Generate periodic reports
    if (testResults.totalChecks % 10 === 0) {
      const report = generateReport();
      log('📊 Report updated', 'info');
    }
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
  
  // Final report
  const finalReport = generateReport();
  log('🎉 AUTONOMOUS TESTING COMPLETED', 'victory');
  log('Final report generated: AUTONOMOUS_TESTING_REPORT.md', 'success');
  
  return finalReport;
};

// Start autonomous testing
runComprehensiveTest().catch(error => {
  log(`Autonomous testing error: ${error.message}`, 'error');
  generateReport();
  process.exit(1);
});
