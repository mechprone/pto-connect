#!/usr/bin/env node

/**
 * 🤖 Autonomous Testing and Repair System
 * 
 * Continuously tests all services via browser and applies intelligent fixes
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
  services: {
    backend: { uptime: 0, downtime: 0, status: 'unknown' },
    frontend: { uptime: 0, downtime: 0, status: 'unknown' },
    public: { uptime: 0, downtime: 0, status: 'unknown' }
  },
  issues: [],
  repairs: [],
  repairAttempts: { frontend: 0, public: 0 }
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
  
  fs.appendFileSync('autonomous-testing-repair.log', logEntry + '\n');
};

const testService = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 15000,
      headers: { 'User-Agent': 'PTO-Autonomous-Test/1.0' }
    });
    
    let isWorking = false;
    
    if (name === 'Backend') {
      // Backend should return JSON health data
      const text = await response.text();
      isWorking = response.status === 200 && text.includes('"status":"healthy"');
    } else {
      // Frontend/Public should return HTML without error messages
      const text = await response.text();
      isWorking = response.status === 200 && !text.includes('Application failed to respond');
    }
    
    const service = name.toLowerCase();
    
    if (isWorking) {
      testResults.services[service].uptime++;
      if (testResults.services[service].status === 'down') {
        log(`${name} RECOVERED! 🎉`, 'success');
      }
      testResults.services[service].status = 'up';
    } else {
      testResults.services[service].downtime++;
      testResults.services[service].status = 'down';
      log(`${name}: FAILED (${response.status})`, 'error');
      
      testResults.issues.push({
        timestamp: new Date(),
        service: name,
        issue: `HTTP ${response.status}`,
        url: url
      });
    }
    
    return isWorking;
    
  } catch (error) {
    const service = name.toLowerCase();
    testResults.services[service].downtime++;
    testResults.services[service].status = 'down';
    log(`${name}: FAILED - ${error.message}`, 'error');
    
    testResults.issues.push({
      timestamp: new Date(),
      service: name,
      issue: error.message,
      url: url
    });
    
    return false;
  }
};

const applyFrontendFix = async () => {
  log('Applying frontend deployment fix...', 'repair');
  
  try {
    // Try different fixes based on attempt number
    const attempt = testResults.repairAttempts.frontend;
    
    if (attempt === 1) {
      // Fix 1: Update Dockerfile with better dependency handling
      const dockerContent = `# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve@14.2.0

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
`;
      
      fs.writeFileSync('pto-connect/Dockerfile', dockerContent);
      
    } else if (attempt === 2) {
      // Fix 2: Force nixpacks to use Dockerfile
      const railwayConfig = {
        "$schema": "https://railway.app/railway.schema.json",
        "build": {
          "builder": "DOCKERFILE"
        },
        "deploy": {
          "restartPolicyType": "ON_FAILURE",
          "restartPolicyMaxRetries": 10
        }
      };
      
      fs.writeFileSync('pto-connect/railway.json', JSON.stringify(railwayConfig, null, 2));
      
    } else {
      // Fix 3: Cache clear
      const timestamp = new Date().toISOString();
      execSync(`cd pto-connect && echo "# Cache clear ${timestamp}" >> .dockerignore`, { stdio: 'inherit' });
    }
    
    // Commit and push
    execSync('cd pto-connect && git add . && git commit -m "AUTO-REPAIR: Frontend fix attempt ' + attempt + '" && git push', {
      stdio: 'inherit'
    });
    
    testResults.repairs.push({
      timestamp: new Date(),
      service: 'Frontend',
      attempt: attempt,
      description: `Fix attempt ${attempt} applied`
    });
    
    log(`Frontend fix ${attempt} applied successfully!`, 'success');
    return true;
    
  } catch (error) {
    log(`Frontend fix failed: ${error.message}`, 'error');
    return false;
  }
};

const applyPublicFix = async () => {
  log('Applying public site deployment fix...', 'repair');
  
  try {
    const attempt = testResults.repairAttempts.public;
    
    if (attempt === 1) {
      // Fix 1: Update public Dockerfile
      const dockerContent = `# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve@14.2.0

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
`;
      
      fs.writeFileSync('pto-connect-public/Dockerfile', dockerContent);
      
    } else {
      // Fix 2+: Cache clear
      const timestamp = new Date().toISOString();
      execSync(`cd pto-connect-public && echo "# Cache clear ${timestamp}" >> README.md`, { stdio: 'inherit' });
    }
    
    // Commit and push
    execSync('cd pto-connect-public && git add . && git commit -m "AUTO-REPAIR: Public fix attempt ' + attempt + '" && git push', {
      stdio: 'inherit'
    });
    
    testResults.repairs.push({
      timestamp: new Date(),
      service: 'Public',
      attempt: attempt,
      description: `Fix attempt ${attempt} applied`
    });
    
    log(`Public fix ${attempt} applied successfully!`, 'success');
    return true;
    
  } catch (error) {
    log(`Public fix failed: ${error.message}`, 'error');
    return false;
  }
};

const generateReport = () => {
  const runtime = new Date() - testResults.startTime;
  const hours = Math.floor(runtime / (1000 * 60 * 60));
  const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
  
  const report = `
# 🤖 Autonomous Testing & Repair Report

**Runtime:** ${hours}h ${minutes}m  
**Total Checks:** ${testResults.totalChecks}  
**Success Rate:** ${testResults.totalChecks > 0 ? ((testResults.successfulChecks / testResults.totalChecks) * 100).toFixed(1) : 0}%  

## Service Status
- **Backend:** ${testResults.services.backend.status} (${testResults.services.backend.uptime}/${testResults.services.backend.uptime + testResults.services.backend.downtime})
- **Frontend:** ${testResults.services.frontend.status} (${testResults.services.frontend.uptime}/${testResults.services.frontend.uptime + testResults.services.frontend.downtime})
- **Public:** ${testResults.services.public.status} (${testResults.services.public.uptime}/${testResults.services.public.uptime + testResults.services.public.downtime})

## Recent Issues: ${testResults.issues.slice(-5).length}
${testResults.issues.slice(-5).map(issue => 
  `- ${issue.timestamp.toISOString().split('T')[1].split('.')[0]} ${issue.service}: ${issue.issue}`
).join('\n')}

## Repairs Applied: ${testResults.repairs.length}
${testResults.repairs.map(repair => 
  `- ${repair.timestamp.toISOString().split('T')[1].split('.')[0]} ${repair.service}: ${repair.description}`
).join('\n')}

**Current Status:** ${testResults.services.backend.status === 'up' && testResults.services.frontend.status === 'up' && testResults.services.public.status === 'up' ? '🎉 ALL SYSTEMS OPERATIONAL' : '⚠️ REPAIRS IN PROGRESS'}
`;

  fs.writeFileSync('AUTONOMOUS_TESTING_REPAIR_REPORT.md', report);
  return report;
};

const runAutonomousSystem = async () => {
  log('🤖 Autonomous Testing & Repair System ACTIVATED', 'system');
  log('Testing all services every minute with intelligent repairs', 'system');
  log('Backend: https://api.ptoconnect.com/api/health', 'system');
  log('Frontend: https://app.ptoconnect.com', 'system');
  log('Public: https://www.ptoconnect.com', 'system');
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < CONFIG.testDuration) {
    testResults.totalChecks++;
    
    // Test all services
    const backendOk = await testService(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await testService(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await testService(CONFIG.endpoints.public, 'Public');
    
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    
    if (operational === 3) {
      testResults.successfulChecks++;
      log('🎉 ALL SYSTEMS OPERATIONAL', 'victory');
      // Reset repair attempts on full success
      testResults.repairAttempts = { frontend: 0, public: 0 };
    } else {
      log(`Status: ${operational}/3 systems operational`, 'warning');
      
      // Apply repairs if needed
      if (!frontendOk && testResults.repairAttempts.frontend < CONFIG.maxRepairAttempts) {
        testResults.repairAttempts.frontend++;
        await applyFrontendFix();
      }
      
      if (!publicOk && testResults.repairAttempts.public < CONFIG.maxRepairAttempts) {
        testResults.repairAttempts.public++;
        await applyPublicFix();
      }
    }
    
    // Generate periodic reports
    if (testResults.totalChecks % 10 === 0) {
      generateReport();
      log('📊 Report updated', 'info');
    }
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
  
  // Final report
  const finalReport = generateReport();
  log('🎉 AUTONOMOUS TESTING & REPAIR COMPLETED', 'victory');
  log('Final report: AUTONOMOUS_TESTING_REPAIR_REPORT.md', 'success');
  
  return finalReport;
};

// Start autonomous system
runAutonomousSystem().catch(error => {
  log(`Autonomous system error: ${error.message}`, 'error');
  generateReport();
  process.exit(1);
});
