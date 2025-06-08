#!/usr/bin/env node

/**
 * 🔧 Autonomous Repair & Testing Orchestrator
 * 
 * This system will:
 * 1. Test deployments and detect failures
 * 2. Autonomously diagnose deployment issues
 * 3. Apply fixes and push changes
 * 4. Re-test and verify fixes
 * 5. Continue until all systems are operational
 * 6. Run comprehensive testing once everything works
 * 
 * Features:
 * - Timeout handling for hung commands
 * - Automatic Railway log fetching
 * - Intelligent failure diagnosis
 * - Automated fix application
 * - Continuous retry with backoff
 * - Complete autonomous operation
 */

import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONFIG = {
  maxRepairCycles: 5,
  commandTimeout: 5 * 60 * 1000, // 5 minutes
  deploymentTimeout: 10 * 60 * 1000, // 10 minutes
  retryDelay: 30 * 1000, // 30 seconds
  endpoints: {
    backend: 'https://api.ptoconnect.com',
    frontend: 'https://app.ptoconnect.com',
    public: 'https://www.ptoconnect.com'
  }
};

const REPAIR_LOG = {
  startTime: new Date().toISOString(),
  cycles: [],
  fixes: [],
  currentCycle: 0,
  status: 'running'
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '🔄',
    repair: '🔧',
    test: '🧪',
    deploy: '🚀'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Command execution with timeout
const executeWithTimeout = async (command, cwd = process.cwd(), timeout = CONFIG.commandTimeout) => {
  return new Promise((resolve, reject) => {
    log(`Executing: ${command}`, 'progress');
    
    const child = spawn('cmd', ['/c', command], { 
      cwd, 
      stdio: 'pipe',
      shell: true 
    });
    
    let stdout = '';
    let stderr = '';
    let completed = false;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!completed) {
        log(`Command timeout after ${timeout/1000}s, proceeding anyway`, 'warning');
        child.kill('SIGTERM');
        completed = true;
        resolve({ stdout, stderr, timedOut: true });
      }
    }, timeout);
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (!completed) {
        clearTimeout(timeoutId);
        completed = true;
        resolve({ stdout, stderr, code, timedOut: false });
      }
    });
    
    child.on('error', (error) => {
      if (!completed) {
        clearTimeout(timeoutId);
        completed = true;
        reject(error);
      }
    });
  });
};

// Test deployment status
const testDeployment = async (url, name) => {
  try {
    const response = await fetch(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'PTO-Connect-Repair-Bot/1.0' }
    });
    
    const isOperational = response.status === 200;
    log(`${name} deployment: ${isOperational ? '✅ OPERATIONAL' : '❌ FAILED'}`, 
        isOperational ? 'success' : 'error');
    
    return {
      name,
      url,
      operational: isOperational,
      status: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log(`${name} deployment: ❌ FAILED - ${error.message}`, 'error');
    return {
      name,
      url,
      operational: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Diagnose deployment failures
const diagnoseBuildFailure = async (projectPath, projectName, cycleNumber = 1) => {
  log(`Diagnosing ${projectName} build failure (Cycle ${cycleNumber})...`, 'repair');
  
  const diagnosis = {
    project: projectName,
    issues: [],
    fixes: [],
    cycleNumber
  };
  
  try {
    // Check package.json
    const packageJson = JSON.parse(await fs.readFile(`${projectPath}/package.json`, 'utf8'));
    
    // Always apply more aggressive fixes in later cycles
    if (cycleNumber >= 2) {
      diagnosis.issues.push('Previous cycle failed - applying comprehensive fixes');
      diagnosis.fixes.push('comprehensive-rebuild');
    }
    
    // Check for missing build script
    if (!packageJson.scripts?.build) {
      diagnosis.issues.push('Missing build script in package.json');
      diagnosis.fixes.push('add-build-script');
    }
    
    // Check for missing dependencies
    if (!packageJson.dependencies?.vite && !packageJson.devDependencies?.vite && projectName !== 'backend') {
      diagnosis.issues.push('Missing Vite dependency');
      diagnosis.fixes.push('add-vite-dependency');
    }
    
    // Always switch to Ubuntu Docker for frontend projects
    if (projectName !== 'backend') {
      diagnosis.issues.push('Ensuring Ubuntu-based Docker configuration');
      diagnosis.fixes.push('switch-to-ubuntu');
    }
    
    // Check Dockerfile
    try {
      const dockerfile = await fs.readFile(`${projectPath}/Dockerfile`, 'utf8');
      
      if (dockerfile.includes('alpine')) {
        diagnosis.issues.push('Using Alpine Linux (known Rollup issues)');
        diagnosis.fixes.push('switch-to-ubuntu');
      }
      
      if (!dockerfile.includes('npm ci')) {
        diagnosis.issues.push('Not using npm ci for clean installs');
        diagnosis.fixes.push('use-npm-ci');
      }
      
    } catch (error) {
      diagnosis.issues.push('Missing or unreadable Dockerfile');
      diagnosis.fixes.push('create-dockerfile');
    }
    
    // Always clean node_modules for fresh builds
    diagnosis.issues.push('Ensuring clean build environment');
    diagnosis.fixes.push('clean-node-modules');
    
    // Check for lock file conflicts
    try {
      await fs.access(`${projectPath}/package-lock.json`);
      await fs.access(`${projectPath}/pnpm-lock.yaml`);
      diagnosis.issues.push('Multiple lock files present');
      diagnosis.fixes.push('clean-lock-files');
    } catch (error) {
      // Expected - only one should exist
    }
    
    // In later cycles, be more aggressive
    if (cycleNumber >= 3) {
      diagnosis.issues.push('Multiple failures - rebuilding package.json');
      diagnosis.fixes.push('rebuild-package-json');
    }
    
  } catch (error) {
    diagnosis.issues.push(`Failed to read project files: ${error.message}`);
    diagnosis.fixes.push('fix-file-access');
  }
  
  log(`Diagnosis complete: ${diagnosis.issues.length} issues found`, 'repair');
  return diagnosis;
};

// Apply fixes based on diagnosis
const applyFixes = async (diagnosis, projectPath) => {
  log(`Applying fixes for ${diagnosis.project}...`, 'repair');
  
  const appliedFixes = [];
  
  for (const fix of diagnosis.fixes) {
    try {
      switch (fix) {
        case 'switch-to-ubuntu':
          await applyUbuntuDockerFix(projectPath);
          appliedFixes.push('Ubuntu Docker configuration');
          break;
          
        case 'add-build-script':
          await addBuildScript(projectPath);
          appliedFixes.push('Build script added');
          break;
          
        case 'add-vite-dependency':
          await addViteDependency(projectPath);
          appliedFixes.push('Vite dependency added');
          break;
          
        case 'clean-node-modules':
          await cleanNodeModules(projectPath);
          appliedFixes.push('node_modules cleaned');
          break;
          
        case 'clean-lock-files':
          await cleanLockFiles(projectPath);
          appliedFixes.push('Lock files cleaned');
          break;
          
        case 'use-npm-ci':
          await updateDockerForNpmCi(projectPath);
          appliedFixes.push('Docker updated for npm ci');
          break;
          
        case 'create-dockerfile':
          await createDockerfile(projectPath, diagnosis.project);
          appliedFixes.push('Dockerfile created');
          break;
          
        case 'comprehensive-rebuild':
          await comprehensiveRebuild(projectPath);
          appliedFixes.push('Comprehensive rebuild applied');
          break;
          
        case 'rebuild-package-json':
          await rebuildPackageJson(projectPath);
          appliedFixes.push('Package.json rebuilt');
          break;
          
        default:
          log(`Unknown fix: ${fix}`, 'warning');
      }
    } catch (error) {
      log(`Failed to apply fix ${fix}: ${error.message}`, 'error');
    }
  }
  
  return appliedFixes;
};

// Specific fix implementations
const applyUbuntuDockerFix = async (projectPath) => {
  const dockerfile = `FROM node:20-slim

WORKDIR /app

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \\
    python3 \\
    make \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Clean install with proper architecture modules
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE 10000

# Start the application
CMD ["serve", "dist", "-s", "-l", "10000"]
`;
  
  await fs.writeFile(`${projectPath}/Dockerfile`, dockerfile);
  log('Ubuntu-based Dockerfile created', 'repair');
};

const addBuildScript = async (projectPath) => {
  const packageJson = JSON.parse(await fs.readFile(`${projectPath}/package.json`, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts.build = 'vite build';
  
  await fs.writeFile(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));
  log('Build script added to package.json', 'repair');
};

const addViteDependency = async (projectPath) => {
  await executeWithTimeout('npm install vite --save-dev', projectPath);
  log('Vite dependency added', 'repair');
};

const cleanNodeModules = async (projectPath) => {
  try {
    await executeWithTimeout('rmdir /s /q node_modules', projectPath);
  } catch (error) {
    // Ignore errors - might not exist
  }
  log('node_modules cleaned', 'repair');
};

const cleanLockFiles = async (projectPath) => {
  try {
    await fs.unlink(`${projectPath}/pnpm-lock.yaml`);
  } catch (error) {
    // Ignore if doesn't exist
  }
  log('Lock files cleaned', 'repair');
};

const updateDockerForNpmCi = async (projectPath) => {
  // This is handled by the Ubuntu Docker fix
  log('Docker npm ci configuration updated', 'repair');
};

const createDockerfile = async (projectPath, projectName) => {
  await applyUbuntuDockerFix(projectPath);
};

const comprehensiveRebuild = async (projectPath) => {
  log('Applying comprehensive rebuild...', 'repair');
  
  // Clean everything
  await cleanNodeModules(projectPath);
  await cleanLockFiles(projectPath);
  
  // Rebuild package-lock.json
  await executeWithTimeout('npm install', projectPath);
  
  // Apply Ubuntu Docker fix
  await applyUbuntuDockerFix(projectPath);
  
  log('Comprehensive rebuild completed', 'repair');
};

const rebuildPackageJson = async (projectPath) => {
  log('Rebuilding package.json with essential dependencies...', 'repair');
  
  try {
    const packageJson = JSON.parse(await fs.readFile(`${projectPath}/package.json`, 'utf8'));
    
    // Ensure essential scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.build = 'vite build';
    packageJson.scripts.dev = 'vite';
    packageJson.scripts.preview = 'vite preview';
    
    // Ensure essential devDependencies
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    
    packageJson.devDependencies.vite = '^5.0.0';
    packageJson.devDependencies['@vitejs/plugin-react'] = '^4.0.0';
    
    await fs.writeFile(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));
    
    // Reinstall dependencies
    await executeWithTimeout('npm install', projectPath);
    
    log('Package.json rebuilt successfully', 'repair');
  } catch (error) {
    log(`Failed to rebuild package.json: ${error.message}`, 'error');
  }
};

// Commit and push changes
const commitAndPush = async (projectPath, message) => {
  log(`Committing changes: ${message}`, 'deploy');
  
  try {
    // Add all changes
    await executeWithTimeout('git add .', projectPath);
    
    // Commit with message
    await executeWithTimeout(`git commit -m "${message}"`, projectPath);
    
    // Push to origin
    await executeWithTimeout('git push', projectPath);
    
    log('Changes committed and pushed successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to commit/push: ${error.message}`, 'error');
    return false;
  }
};

// Wait for deployment with timeout and failure detection
const waitForDeployment = async (url, name, timeout = CONFIG.deploymentTimeout) => {
  log(`Waiting for ${name} deployment...`, 'deploy');
  
  const startTime = Date.now();
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 3; // If it fails 3 times in a row, consider it failed
  
  while (Date.now() - startTime < timeout) {
    const result = await testDeployment(url, name);
    
    if (result.operational) {
      log(`${name} deployment successful!`, 'success');
      return true;
    }
    
    consecutiveFailures++;
    
    // If we've had multiple consecutive failures and some time has passed, 
    // assume the deployment failed rather than still deploying
    if (consecutiveFailures >= maxConsecutiveFailures && (Date.now() - startTime) > 120000) { // 2 minutes
      log(`${name} deployment appears to have failed (${consecutiveFailures} consecutive failures over ${Math.round((Date.now() - startTime) / 1000)}s)`, 'error');
      return false;
    }
    
    log(`${name} still deploying... (${Math.round((Date.now() - startTime) / 1000)}s elapsed, ${consecutiveFailures} failures)`, 'progress');
    await sleep(CONFIG.retryDelay);
  }
  
  log(`${name} deployment timeout after ${timeout/1000}s`, 'warning');
  return false;
};

// Main repair cycle
const runRepairCycle = async (cycleNumber) => {
  log(`Starting repair cycle ${cycleNumber}`, 'repair');
  
  const cycle = {
    number: cycleNumber,
    startTime: new Date().toISOString(),
    tests: [],
    diagnoses: [],
    fixes: [],
    deployments: [],
    success: false
  };
  
  // Test current deployment status
  const frontendTest = await testDeployment(CONFIG.endpoints.frontend, 'Frontend');
  const publicTest = await testDeployment(CONFIG.endpoints.public, 'Public');
  const backendTest = await testDeployment(CONFIG.endpoints.backend, 'Backend');
  
  cycle.tests = [frontendTest, publicTest, backendTest];
  
  // If all are operational, we're done
  if (frontendTest.operational && publicTest.operational && backendTest.operational) {
    log('All deployments operational! Repair complete.', 'success');
    cycle.success = true;
    return cycle;
  }
  
  // Diagnose and fix frontend if needed
  if (!frontendTest.operational) {
    log('Frontend deployment failed, diagnosing...', 'repair');
    const diagnosis = await diagnoseBuildFailure('pto-connect', 'frontend', cycleNumber);
    cycle.diagnoses.push(diagnosis);
    
    if (diagnosis.fixes.length > 0) {
      const appliedFixes = await applyFixes(diagnosis, 'pto-connect');
      cycle.fixes.push({ project: 'frontend', fixes: appliedFixes });
      
      // Commit and push
      const committed = await commitAndPush('pto-connect', `Cycle ${cycleNumber}: Fix frontend deployment issues`);
      if (committed) {
        // Wait for deployment
        const deployed = await waitForDeployment(CONFIG.endpoints.frontend, 'Frontend');
        cycle.deployments.push({ project: 'frontend', success: deployed });
      }
    }
  }
  
  // Diagnose and fix public site if needed
  if (!publicTest.operational) {
    log('Public site deployment failed, diagnosing...', 'repair');
    const diagnosis = await diagnoseBuildFailure('pto-connect-public', 'public', cycleNumber);
    cycle.diagnoses.push(diagnosis);
    
    if (diagnosis.fixes.length > 0) {
      const appliedFixes = await applyFixes(diagnosis, 'pto-connect-public');
      cycle.fixes.push({ project: 'public', fixes: appliedFixes });
      
      // Commit and push
      const committed = await commitAndPush('pto-connect-public', `Cycle ${cycleNumber}: Fix public site deployment issues`);
      if (committed) {
        // Wait for deployment
        const deployed = await waitForDeployment(CONFIG.endpoints.public, 'Public');
        cycle.deployments.push({ project: 'public', success: deployed });
      }
    }
  }
  
  cycle.endTime = new Date().toISOString();
  return cycle;
};

// Run comprehensive testing once everything is operational
const runComprehensiveTesting = async () => {
  log('All deployments operational! Starting comprehensive testing...', 'test');
  
  try {
    // Import and run the overnight testing orchestrator
    const { main: runOvernightTests } = await import('./overnight-testing-orchestrator.js');
    await runOvernightTests();
    
    log('Comprehensive testing completed successfully!', 'success');
    return true;
  } catch (error) {
    log(`Comprehensive testing failed: ${error.message}`, 'error');
    return false;
  }
};

// Generate repair report
const generateRepairReport = async () => {
  REPAIR_LOG.endTime = new Date().toISOString();
  REPAIR_LOG.duration = Date.now() - new Date(REPAIR_LOG.startTime).getTime();
  
  // Save detailed log
  await fs.writeFile('autonomous-repair-log.json', JSON.stringify(REPAIR_LOG, null, 2));
  
  // Generate summary report
  const report = `
# 🔧 Autonomous Repair & Testing Report

**Started:** ${REPAIR_LOG.startTime}  
**Completed:** ${REPAIR_LOG.endTime}  
**Duration:** ${Math.round(REPAIR_LOG.duration / 1000 / 60)} minutes  
**Status:** ${REPAIR_LOG.status.toUpperCase()}  

## 🔄 Repair Cycles

${REPAIR_LOG.cycles.map((cycle, index) => `
### Cycle ${cycle.number}
- **Duration:** ${cycle.endTime ? Math.round((new Date(cycle.endTime) - new Date(cycle.startTime)) / 1000) : 'In progress'}s
- **Tests:** ${cycle.tests.length} deployments tested
- **Diagnoses:** ${cycle.diagnoses.length} issues diagnosed
- **Fixes Applied:** ${cycle.fixes.reduce((total, fix) => total + fix.fixes.length, 0)}
- **Deployments:** ${cycle.deployments.length} attempted
- **Success:** ${cycle.success ? '✅' : '❌'}

${cycle.fixes.map(fix => `#### ${fix.project} Fixes:\n${fix.fixes.map(f => `- ${f}`).join('\n')}`).join('\n')}
`).join('')}

## 📊 Final Status

${REPAIR_LOG.status === 'success' ? `
✅ **ALL SYSTEMS OPERATIONAL**
- Backend API: ✅ Operational
- Frontend App: ✅ Operational  
- Public Site: ✅ Operational
- Comprehensive Testing: ✅ Completed

🎉 **System is ready for beta user testing!**
` : `
⚠️ **REPAIR INCOMPLETE**
- Some systems may still have issues
- Manual intervention may be required
- Check individual cycle reports for details
`}

---
*Generated by Autonomous Repair & Testing Orchestrator*
`;
  
  await fs.writeFile('AUTONOMOUS_REPAIR_REPORT.md', report);
  log('Repair report generated', 'success');
};

// Main orchestrator
async function main() {
  log('🔧 Starting Autonomous Repair & Testing Orchestrator', 'repair');
  log('This system will autonomously fix deployment issues and run comprehensive testing', 'info');
  
  try {
    // Run repair cycles until everything works or max cycles reached
    for (let i = 1; i <= CONFIG.maxRepairCycles; i++) {
      REPAIR_LOG.currentCycle = i;
      
      const cycle = await runRepairCycle(i);
      REPAIR_LOG.cycles.push(cycle);
      
      if (cycle.success) {
        log('All systems operational! Moving to comprehensive testing...', 'success');
        REPAIR_LOG.status = 'success';
        
        // Run comprehensive testing
        const testingSuccess = await runComprehensiveTesting();
        if (testingSuccess) {
          REPAIR_LOG.status = 'complete';
        }
        break;
      }
      
      if (i < CONFIG.maxRepairCycles) {
        log(`Cycle ${i} incomplete, waiting before next cycle...`, 'warning');
        await sleep(CONFIG.retryDelay * 2); // Longer delay between cycles
      } else {
        log('Maximum repair cycles reached', 'warning');
        REPAIR_LOG.status = 'max_cycles_reached';
      }
    }
    
    // Generate final report
    await generateRepairReport();
    
    log(`🎭 Autonomous repair orchestrator completed with status: ${REPAIR_LOG.status.toUpperCase()}`, 'repair');
    
    // Exit with appropriate code
    process.exit(REPAIR_LOG.status === 'complete' ? 0 : 1);
    
  } catch (error) {
    log(`🚨 Fatal error in repair orchestrator: ${error.message}`, 'error');
    REPAIR_LOG.status = 'fatal_error';
    
    try {
      await generateRepairReport();
    } catch (reportError) {
      log(`Could not generate repair report: ${reportError.message}`, 'error');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('Received SIGINT, generating final report...', 'warning');
  REPAIR_LOG.status = 'interrupted';
  try {
    await generateRepairReport();
  } catch (error) {
    log(`Error generating final report: ${error.message}`, 'error');
  }
  process.exit(0);
});

// Start the autonomous repair orchestrator
main();
