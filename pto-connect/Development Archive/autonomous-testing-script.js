#!/usr/bin/env node

/**
 * 🤖 Autonomous Testing Script for PTO Connect System
 * 
 * This script performs comprehensive testing of all three components:
 * - Backend API (api.ptoconnect.com)
 * - Frontend App (app.ptoconnect.com) 
 * - Public Site (www.ptoconnect.com)
 * 
 * Features:
 * - Continuous deployment monitoring
 * - Automated health checks
 * - Performance testing
 * - User flow simulation
 * - Detailed reporting
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

const ENDPOINTS = {
  backend: 'https://api.ptoconnect.com',
  frontend: 'https://app.ptoconnect.com',
  public: 'https://www.ptoconnect.com'
};

const TEST_RESULTS = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '🔄'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const recordTest = (name, status, details = {}) => {
  const test = {
    name,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  TEST_RESULTS.tests.push(test);
  TEST_RESULTS.summary.total++;
  TEST_RESULTS.summary[status]++;
  
  log(`${name}: ${status.toUpperCase()}`, status === 'passed' ? 'success' : status === 'failed' ? 'error' : 'warning');
  
  return test;
};

// Test functions
async function testEndpoint(url, expectedStatus = 200, timeout = 10000) {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PTO-Connect-Autonomous-Tester/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      responseTime,
      headers: Object.fromEntries(response.headers.entries()),
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

async function testBackendAPI() {
  log('Testing Backend API...', 'progress');
  
  // Test root endpoint
  const rootTest = await testEndpoint(ENDPOINTS.backend);
  recordTest('Backend Root Endpoint', rootTest.success ? 'passed' : 'failed', {
    url: ENDPOINTS.backend,
    responseTime: rootTest.responseTime,
    status: rootTest.status
  });
  
  // Test health endpoint
  const healthTest = await testEndpoint(`${ENDPOINTS.backend}/api/health`);
  recordTest('Backend Health Endpoint', healthTest.success ? 'passed' : 'failed', {
    url: `${ENDPOINTS.backend}/api/health`,
    responseTime: healthTest.responseTime,
    status: healthTest.status
  });
  
  // Test API routes (sample)
  const apiRoutes = [
    '/api/auth',
    '/api/profiles', 
    '/api/event',
    '/api/fundraiser',
    '/api/budget'
  ];
  
  for (const route of apiRoutes) {
    const routeTest = await testEndpoint(`${ENDPOINTS.backend}${route}`, 401); // Expect 401 for protected routes
    recordTest(`Backend API Route ${route}`, routeTest.success ? 'passed' : 'failed', {
      url: `${ENDPOINTS.backend}${route}`,
      responseTime: routeTest.responseTime,
      status: routeTest.status,
      note: 'Expected 401 for protected route'
    });
  }
}

async function testFrontendApp() {
  log('Testing Frontend Application...', 'progress');
  
  const frontendTest = await testEndpoint(ENDPOINTS.frontend);
  recordTest('Frontend Application', frontendTest.success ? 'passed' : 'failed', {
    url: ENDPOINTS.frontend,
    responseTime: frontendTest.responseTime,
    status: frontendTest.status
  });
  
  return frontendTest.success;
}

async function testPublicSite() {
  log('Testing Public Marketing Site...', 'progress');
  
  const publicTest = await testEndpoint(ENDPOINTS.public);
  recordTest('Public Marketing Site', publicTest.success ? 'passed' : 'failed', {
    url: ENDPOINTS.public,
    responseTime: publicTest.responseTime,
    status: publicTest.status
  });
  
  return publicTest.success;
}

async function performanceTest() {
  log('Running Performance Tests...', 'progress');
  
  const endpoints = [
    { name: 'Backend API', url: ENDPOINTS.backend },
    { name: 'Frontend App', url: ENDPOINTS.frontend },
    { name: 'Public Site', url: ENDPOINTS.public }
  ];
  
  for (const endpoint of endpoints) {
    const times = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const test = await testEndpoint(endpoint.url);
      if (test.success && test.responseTime) {
        times.push(test.responseTime);
      }
      await sleep(1000); // 1 second between requests
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      recordTest(`Performance Test - ${endpoint.name}`, avgTime < 2000 ? 'passed' : 'warning', {
        averageResponseTime: avgTime,
        maxResponseTime: maxTime,
        minResponseTime: minTime,
        iterations,
        target: '< 2000ms'
      });
    } else {
      recordTest(`Performance Test - ${endpoint.name}`, 'failed', {
        error: 'No successful requests'
      });
    }
  }
}

async function waitForDeployments() {
  log('Monitoring deployments...', 'progress');
  
  const maxWaitTime = 10 * 60 * 1000; // 10 minutes
  const checkInterval = 30 * 1000; // 30 seconds
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const frontendTest = await testEndpoint(ENDPOINTS.frontend);
    const publicTest = await testEndpoint(ENDPOINTS.public);
    
    if (frontendTest.success && publicTest.success) {
      log('All deployments are operational!', 'success');
      return true;
    }
    
    log(`Waiting for deployments... Frontend: ${frontendTest.success ? '✅' : '❌'}, Public: ${publicTest.success ? '✅' : '❌'}`, 'progress');
    await sleep(checkInterval);
  }
  
  log('Timeout waiting for deployments', 'warning');
  return false;
}

async function generateReport() {
  const report = {
    ...TEST_RESULTS,
    endTime: new Date().toISOString(),
    duration: Date.now() - new Date(TEST_RESULTS.startTime).getTime(),
    deploymentStatus: {
      backend: TEST_RESULTS.tests.find(t => t.name === 'Backend Root Endpoint')?.status || 'unknown',
      frontend: TEST_RESULTS.tests.find(t => t.name === 'Frontend Application')?.status || 'unknown',
      public: TEST_RESULTS.tests.find(t => t.name === 'Public Marketing Site')?.status || 'unknown'
    }
  };
  
  // Save detailed report
  await fs.writeFile('autonomous-test-results.json', JSON.stringify(report, null, 2));
  
  // Generate summary
  const summary = `
# 🤖 Autonomous Testing Summary

**Test Run:** ${report.startTime}  
**Duration:** ${Math.round(report.duration / 1000)}s  
**Total Tests:** ${report.summary.total}  

## Results
- ✅ **Passed:** ${report.summary.passed}
- ❌ **Failed:** ${report.summary.failed}  
- ⚠️ **Warnings:** ${report.summary.warnings}

## Deployment Status
- **Backend API:** ${report.deploymentStatus.backend === 'passed' ? '✅ Operational' : '❌ Failed'}
- **Frontend App:** ${report.deploymentStatus.frontend === 'passed' ? '✅ Operational' : '❌ Failed'}
- **Public Site:** ${report.deploymentStatus.public === 'passed' ? '✅ Operational' : '❌ Failed'}

## Performance Summary
${report.tests
  .filter(t => t.name.includes('Performance Test'))
  .map(t => `- **${t.name}:** ${t.status === 'passed' ? '✅' : t.status === 'warning' ? '⚠️' : '❌'} ${t.averageResponseTime ? Math.round(t.averageResponseTime) + 'ms avg' : 'Failed'}`)
  .join('\n')}

## Next Steps
${report.summary.failed > 0 ? '🚨 **Critical Issues Found** - Review failed tests and fix deployment issues' : ''}
${report.summary.warnings > 0 ? '⚠️ **Performance Warnings** - Optimize slow endpoints' : ''}
${report.summary.failed === 0 && report.summary.warnings === 0 ? '🎉 **All Systems Operational** - Ready for user testing!' : ''}

---
*Generated by PTO Connect Autonomous Testing System*
`;
  
  await fs.writeFile('AUTONOMOUS_TEST_SUMMARY.md', summary);
  
  log('Test report generated', 'success');
  return report;
}

// Main execution
async function main() {
  log('🤖 Starting Autonomous Testing System', 'info');
  log('Target endpoints:', 'info');
  log(`  Backend: ${ENDPOINTS.backend}`, 'info');
  log(`  Frontend: ${ENDPOINTS.frontend}`, 'info');
  log(`  Public: ${ENDPOINTS.public}`, 'info');
  
  try {
    // Phase 1: Test backend (should already be working)
    await testBackendAPI();
    
    // Phase 2: Wait for frontend deployments
    const deploymentsReady = await waitForDeployments();
    
    // Phase 3: Test frontend applications
    if (deploymentsReady) {
      await testFrontendApp();
      await testPublicSite();
      
      // Phase 4: Performance testing
      await performanceTest();
    } else {
      recordTest('Frontend Deployment Wait', 'failed', {
        error: 'Timeout waiting for deployments to become operational'
      });
    }
    
    // Phase 5: Generate comprehensive report
    const report = await generateReport();
    
    log(`Testing complete! ${report.summary.passed}/${report.summary.total} tests passed`, 
         report.summary.failed === 0 ? 'success' : 'warning');
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('Received SIGINT, generating final report...', 'warning');
  await generateReport();
  process.exit(0);
});

// Start testing
main();
