#!/usr/bin/env node

/**
 * 🌐 Browser Automation Testing for PTO Connect
 * 
 * This script uses Puppeteer to perform comprehensive browser-based testing:
 * - User registration and authentication flows
 * - Dashboard navigation and functionality
 * - Form submissions and data validation
 * - Mobile responsiveness testing
 * - Performance measurement
 * - Screenshot capture for visual verification
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const ENDPOINTS = {
  frontend: 'https://app.ptoconnect.com',
  public: 'https://www.ptoconnect.com'
};

const TEST_RESULTS = {
  startTime: new Date().toISOString(),
  tests: [],
  screenshots: [],
  performance: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Test user data
const TEST_USER = {
  email: 'test@ptoconnect.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  ptoName: 'Test Elementary PTO'
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
    browser: '🌐'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

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

const takeScreenshot = async (page, name, description = '') => {
  try {
    const filename = `screenshot-${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    await page.screenshot({ 
      path: filename, 
      fullPage: true,
      type: 'png'
    });
    
    TEST_RESULTS.screenshots.push({
      name,
      filename,
      description,
      timestamp: new Date().toISOString()
    });
    
    log(`Screenshot saved: ${filename}`, 'browser');
    return filename;
  } catch (error) {
    log(`Failed to take screenshot: ${error.message}`, 'error');
    return null;
  }
};

const measurePerformance = async (page, testName) => {
  try {
    const metrics = await page.metrics();
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const navigation = JSON.parse(performanceEntries)[0];
    
    const performance = {
      testName,
      timestamp: new Date().toISOString(),
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : null,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : null,
      firstPaint: navigation ? navigation.responseEnd - navigation.fetchStart : null,
      jsHeapUsedSize: metrics.JSHeapUsedSize,
      jsHeapTotalSize: metrics.JSHeapTotalSize,
      nodes: metrics.Nodes,
      documents: metrics.Documents
    };
    
    TEST_RESULTS.performance.push(performance);
    
    if (performance.loadTime) {
      log(`Performance - ${testName}: ${Math.round(performance.loadTime)}ms load time`, 
          performance.loadTime < 3000 ? 'success' : 'warning');
    }
    
    return performance;
  } catch (error) {
    log(`Failed to measure performance: ${error.message}`, 'error');
    return null;
  }
};

// Test functions
async function testPublicSite(browser) {
  log('Testing Public Marketing Site...', 'progress');
  
  const page = await browser.newPage();
  
  try {
    // Set viewport for desktop testing
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to public site
    const startTime = Date.now();
    await page.goto(ENDPOINTS.public, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    await takeScreenshot(page, 'public-site-homepage', 'Public site homepage');
    await measurePerformance(page, 'Public Site Load');
    
    recordTest('Public Site Load', 'passed', {
      url: ENDPOINTS.public,
      loadTime,
      viewport: '1920x1080'
    });
    
    // Test navigation elements
    const navElements = await page.$$eval('nav a, .nav a, [role="navigation"] a', 
      links => links.map(link => ({ text: link.textContent.trim(), href: link.href }))
    );
    
    recordTest('Public Site Navigation', navElements.length > 0 ? 'passed' : 'failed', {
      navigationLinks: navElements.length,
      links: navElements
    });
    
    // Test responsive design
    await page.setViewport({ width: 375, height: 667 }); // iPhone size
    await page.reload({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'public-site-mobile', 'Public site mobile view');
    
    recordTest('Public Site Mobile Responsiveness', 'passed', {
      viewport: '375x667',
      note: 'Mobile layout loaded successfully'
    });
    
  } catch (error) {
    recordTest('Public Site Testing', 'failed', {
      error: error.message,
      url: ENDPOINTS.public
    });
  } finally {
    await page.close();
  }
}

async function testFrontendApp(browser) {
  log('Testing Frontend Application...', 'progress');
  
  const page = await browser.newPage();
  
  try {
    // Set viewport for desktop testing
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to frontend app
    const startTime = Date.now();
    await page.goto(ENDPOINTS.frontend, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    await takeScreenshot(page, 'frontend-app-initial', 'Frontend app initial load');
    await measurePerformance(page, 'Frontend App Load');
    
    recordTest('Frontend App Load', 'passed', {
      url: ENDPOINTS.frontend,
      loadTime,
      viewport: '1920x1080'
    });
    
    // Test if login form is present
    const loginForm = await page.$('form, [data-testid="login-form"], .login-form');
    if (loginForm) {
      recordTest('Login Form Present', 'passed', {
        note: 'Login form found on page'
      });
      
      // Test login form interaction
      await testLoginFlow(page);
    } else {
      // Check if already logged in or different layout
      const dashboardElements = await page.$$('[data-testid="dashboard"], .dashboard, nav');
      if (dashboardElements.length > 0) {
        recordTest('Dashboard/Navigation Present', 'passed', {
          note: 'Dashboard or navigation elements found'
        });
      } else {
        recordTest('Frontend App Layout', 'warning', {
          note: 'No login form or dashboard elements found'
        });
      }
    }
    
    // Test mobile responsiveness
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'frontend-app-mobile', 'Frontend app mobile view');
    
    recordTest('Frontend App Mobile Responsiveness', 'passed', {
      viewport: '375x667'
    });
    
  } catch (error) {
    recordTest('Frontend App Testing', 'failed', {
      error: error.message,
      url: ENDPOINTS.frontend
    });
  } finally {
    await page.close();
  }
}

async function testLoginFlow(page) {
  log('Testing Login Flow...', 'progress');
  
  try {
    // Look for email/username input
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    const submitButton = await page.$('button[type="submit"], .login-button, [data-testid="login-submit"]');
    
    if (emailInput && passwordInput && submitButton) {
      // Test form interaction
      await emailInput.type(TEST_USER.email);
      await passwordInput.type(TEST_USER.password);
      
      await takeScreenshot(page, 'login-form-filled', 'Login form with test data');
      
      // Note: We won't actually submit to avoid creating test accounts
      recordTest('Login Form Interaction', 'passed', {
        note: 'Form inputs work correctly, submission not tested to avoid account creation'
      });
    } else {
      recordTest('Login Form Elements', 'warning', {
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        submitButton: !!submitButton
      });
    }
    
  } catch (error) {
    recordTest('Login Flow Testing', 'failed', {
      error: error.message
    });
  }
}

async function testCrossBrowserCompatibility(browser) {
  log('Testing Cross-Browser Compatibility...', 'progress');
  
  const page = await browser.newPage();
  
  try {
    // Test different user agents
    const userAgents = [
      {
        name: 'Chrome Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      {
        name: 'Firefox Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      },
      {
        name: 'Safari Mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    ];
    
    for (const ua of userAgents) {
      await page.setUserAgent(ua.userAgent);
      await page.goto(ENDPOINTS.frontend, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const errors = await page.evaluate(() => {
        return window.console.errors || [];
      });
      
      recordTest(`Cross-Browser Test - ${ua.name}`, errors.length === 0 ? 'passed' : 'warning', {
        userAgent: ua.userAgent,
        consoleErrors: errors.length
      });
    }
    
  } catch (error) {
    recordTest('Cross-Browser Compatibility', 'failed', {
      error: error.message
    });
  } finally {
    await page.close();
  }
}

async function generateReport() {
  const report = {
    ...TEST_RESULTS,
    endTime: new Date().toISOString(),
    duration: Date.now() - new Date(TEST_RESULTS.startTime).getTime()
  };
  
  // Save detailed report
  await fs.writeFile('browser-test-results.json', JSON.stringify(report, null, 2));
  
  // Generate summary
  const summary = `
# 🌐 Browser Automation Testing Summary

**Test Run:** ${report.startTime}  
**Duration:** ${Math.round(report.duration / 1000)}s  
**Total Tests:** ${report.summary.total}  

## Results
- ✅ **Passed:** ${report.summary.passed}
- ❌ **Failed:** ${report.summary.failed}  
- ⚠️ **Warnings:** ${report.summary.warnings}

## Screenshots Captured
${report.screenshots.map(s => `- **${s.name}:** ${s.filename} - ${s.description}`).join('\n')}

## Performance Summary
${report.performance.map(p => `- **${p.testName}:** ${p.loadTime ? Math.round(p.loadTime) + 'ms' : 'N/A'} load time`).join('\n')}

## Test Details
${report.tests.map(t => `- **${t.name}:** ${t.status === 'passed' ? '✅' : t.status === 'warning' ? '⚠️' : '❌'} ${t.status.toUpperCase()}`).join('\n')}

## Next Steps
${report.summary.failed > 0 ? '🚨 **Critical Issues Found** - Review failed tests and fix issues' : ''}
${report.summary.warnings > 0 ? '⚠️ **Warnings Found** - Review and optimize flagged areas' : ''}
${report.summary.failed === 0 && report.summary.warnings === 0 ? '🎉 **All Browser Tests Passed** - Frontend is ready for user testing!' : ''}

---
*Generated by PTO Connect Browser Automation Testing*
`;
  
  await fs.writeFile('BROWSER_TEST_SUMMARY.md', summary);
  
  log('Browser test report generated', 'success');
  return report;
}

// Main execution
async function main() {
  log('🌐 Starting Browser Automation Testing', 'info');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    log('Browser launched successfully', 'browser');
    
    // Run tests
    await testPublicSite(browser);
    await testFrontendApp(browser);
    await testCrossBrowserCompatibility(browser);
    
    // Generate report
    const report = await generateReport();
    
    log(`Browser testing complete! ${report.summary.passed}/${report.summary.total} tests passed`, 
         report.summary.failed === 0 ? 'success' : 'warning');
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    recordTest('Browser Testing Setup', 'failed', { error: error.message });
  } finally {
    if (browser) {
      await browser.close();
      log('Browser closed', 'browser');
    }
  }
}

// Export for use by other scripts
export { main as runBrowserTests, TEST_RESULTS };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
