#!/usr/bin/env node

/**
 * 🤖 Intelligent Auto-Repair System
 * 
 * Detects specific deployment failures and automatically applies fixes
 */

import fetch from 'node-fetch';

const CONFIG = {
  checkInterval: 30 * 1000, // 30 seconds
  endpoints: {
    backend: 'https://api.ptoconnect.com/api/health',
    frontend: 'https://app.ptoconnect.com', 
    public: 'https://www.ptoconnect.com'
  },
  maxRepairAttempts: 3
};

let repairAttempts = {
  frontend: 0,
  public: 0
};

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '🔍',
    success: '✅', 
    error: '❌',
    warning: '⚠️',
    repair: '🔧',
    victory: '🎉'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const testEndpoint = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 15000,
      headers: { 'User-Agent': 'PTO-Auto-Repair/1.0' }
    });
    
    const operational = response.status === 200;
    if (!operational) {
      log(`${name}: FAILED (${response.status})`, 'error');
    }
    return operational;
  } catch (error) {
    log(`${name}: FAILED - ${error.message}`, 'error');
    return false;
  }
};

const applyNixpacksCorruptionFix = async (service) => {
  log(`Applying nixpacks corruption fix for ${service}...`, 'repair');
  
  const { execSync } = await import('child_process');
  
  try {
    // Switch to Dockerfile deployment
    const dockerfileContent = `# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

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

    // Write files
    const fs = await import('fs');
    const path = service === 'frontend' ? 'pto-connect' : 'pto-connect-public';
    
    fs.writeFileSync(`${path}/Dockerfile`, dockerfileContent);
    fs.writeFileSync(`${path}/railway.json`, railwayConfig);
    
    // Commit and push
    execSync(`cd ${path} && git add . && git commit -m "AUTO-REPAIR: Fix nixpacks corruption with Dockerfile" && git push`, {
      stdio: 'inherit'
    });
    
    log(`${service} nixpacks corruption fix applied and deployed!`, 'success');
    return true;
    
  } catch (error) {
    log(`Failed to apply nixpacks fix: ${error.message}`, 'error');
    return false;
  }
};

const applyGenericDeploymentFix = async (service) => {
  log(`Applying generic deployment fix for ${service}...`, 'repair');
  
  const { execSync } = await import('child_process');
  
  try {
    const path = service === 'frontend' ? 'pto-connect' : 'pto-connect-public';
    
    // Force cache clear with timestamp
    const timestamp = new Date().toISOString();
    execSync(`cd ${path} && echo "# Auto-repair cache clear ${timestamp}" >> README.md`, { stdio: 'inherit' });
    execSync(`cd ${path} && git add . && git commit -m "AUTO-REPAIR: Force cache clear ${timestamp}" && git push`, {
      stdio: 'inherit'
    });
    
    log(`${service} cache clear applied!`, 'success');
    return true;
    
  } catch (error) {
    log(`Failed to apply generic fix: ${error.message}`, 'error');
    return false;
  }
};

const detectAndRepair = async () => {
  log('🤖 Intelligent Auto-Repair System Active', 'repair');
  
  while (true) {
    const backendOk = await testEndpoint(CONFIG.endpoints.backend, 'Backend');
    const frontendOk = await testEndpoint(CONFIG.endpoints.frontend, 'Frontend');
    const publicOk = await testEndpoint(CONFIG.endpoints.public, 'Public');
    
    // Check for frontend issues
    if (!frontendOk && repairAttempts.frontend < CONFIG.maxRepairAttempts) {
      repairAttempts.frontend++;
      log(`Frontend failure detected. Repair attempt ${repairAttempts.frontend}/${CONFIG.maxRepairAttempts}`, 'warning');
      
      if (repairAttempts.frontend === 1) {
        // First attempt: Try nixpacks corruption fix
        await applyNixpacksCorruptionFix('frontend');
      } else {
        // Subsequent attempts: Generic fixes
        await applyGenericDeploymentFix('frontend');
      }
    }
    
    // Check for public site issues
    if (!publicOk && repairAttempts.public < CONFIG.maxRepairAttempts) {
      repairAttempts.public++;
      log(`Public site failure detected. Repair attempt ${repairAttempts.public}/${CONFIG.maxRepairAttempts}`, 'warning');
      await applyGenericDeploymentFix('public');
    }
    
    // Reset counters if services are working
    if (frontendOk) repairAttempts.frontend = 0;
    if (publicOk) repairAttempts.public = 0;
    
    // Status report
    const operational = [backendOk, frontendOk, publicOk].filter(Boolean).length;
    if (operational === 3) {
      log('🎉 ALL SYSTEMS OPERATIONAL!', 'victory');
    } else {
      log(`Status: ${operational}/3 systems operational`, 'warning');
    }
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.checkInterval));
  }
};

detectAndRepair().catch(error => {
  log(`Auto-repair system error: ${error.message}`, 'error');
  process.exit(1);
});
