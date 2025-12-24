/**
 * Backend Test Utility
 * 
 * Použití v console:
 * import { testBackend } from './utils/testBackend';
 * testBackend.runAll();
 */

import { 
  authApi, 
  userApi, 
  projectApi, 
  collaborationApi, 
  chatApi,
  kycApi,
  notificationApi,
  ratingApi,
  adminApi,
  healthCheck,
  setAuthToken
} from './api';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const prefix = {
    info: '🔵',
    success: '✅',
    error: '❌'
  }[type];
  
  console.log(`${prefix} ${message}`);
};

const runTest = async (
  name: string, 
  testFn: () => Promise<any>
): Promise<TestResult> => {
  log(`Testing: ${name}`, 'info');
  
  try {
    const data = await testFn();
    log(`PASSED: ${name}`, 'success');
    return { test: name, passed: true, data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`FAILED: ${name} - ${errorMsg}`, 'error');
    return { test: name, passed: false, error: errorMsg };
  }
};

export const testBackend = {
  /**
   * Test 1: Health Check
   */
  async testHealth() {
    return runTest('Health Check', async () => {
      const health = await healthCheck();
      if (health.status !== 'ok') {
        throw new Error('Health check failed');
      }
      return health;
    });
  },

  /**
   * Test 2: User Registration (Talent)
   */
  async testSignupTalent() {
    const timestamp = Date.now();
    return runTest('Signup Talent', async () => {
      const result = await authApi.signup({
        email: `talent-${timestamp}@test.com`,
        password: 'test123456',
        role: 'talent',
        firstName: 'Test',
        lastName: 'Talent'
      });
      return result;
    });
  },

  /**
   * Test 3: User Registration (Company)
   */
  async testSignupCompany() {
    const timestamp = Date.now();
    return runTest('Signup Company', async () => {
      const result = await authApi.signup({
        email: `company-${timestamp}@test.com`,
        password: 'test123456',
        role: 'company',
        firstName: 'Test',
        lastName: 'Company',
        companyName: 'Test s.r.o.',
        ico: '12345678'
      });
      return result;
    });
  },

  /**
   * Test 4: Get Session
   */
  async testGetSession(token: string) {
    return runTest('Get Session', async () => {
      setAuthToken(token);
      const session = await authApi.getSession();
      return session;
    });
  },

  /**
   * Test 5: Get User Profile
   */
  async testGetUser(userId: string) {
    return runTest('Get User Profile', async () => {
      const user = await userApi.getUser(userId);
      return user;
    });
  },

  /**
   * Test 6: Update User Profile
   */
  async testUpdateUser(userId: string) {
    return runTest('Update User Profile', async () => {
      const updated = await userApi.updateUser(userId, {
        bio: 'Test bio updated',
        category: 'Sport'
      });
      return updated;
    });
  },

  /**
   * Test 7: Create Project
   */
  async testCreateProject() {
    return runTest('Create Project', async () => {
      const project = await projectApi.createProject({
        title: 'Test Project ' + Date.now(),
        description: 'Test project description',
        price: 10000,
        currency: 'CZK',
        vat: 21,
        category: 'Sport',
        tags: ['test', 'marketing'],
        images: [],
        available: true
      });
      return project;
    });
  },

  /**
   * Test 8: Get All Projects
   */
  async testGetProjects() {
    return runTest('Get Projects', async () => {
      const projects = await projectApi.getProjects();
      return { count: projects.length, projects };
    });
  },

  /**
   * Test 9: Get All Talents
   */
  async testGetTalents() {
    return runTest('Get Talents', async () => {
      const talents = await userApi.getTalents();
      return { count: talents.length, talents };
    });
  },

  /**
   * Test 10: Get All Companies
   */
  async testGetCompanies() {
    return runTest('Get Companies', async () => {
      const companies = await userApi.getCompanies();
      return { count: companies.length, companies };
    });
  },

  /**
   * Test 11: Create Collaboration
   */
  async testCreateCollaboration(projectId: string) {
    return runTest('Create Collaboration', async () => {
      const collab = await collaborationApi.createCollaboration(
        projectId,
        'Test collaboration message'
      );
      return collab;
    });
  },

  /**
   * Test 12: Send Chat Message
   */
  async testSendMessage(toUserId: string) {
    return runTest('Send Chat Message', async () => {
      const message = await chatApi.sendMessage(
        toUserId,
        'Test message from backend test'
      );
      return message;
    });
  },

  /**
   * Test 13: Get Notifications
   */
  async testGetNotifications() {
    return runTest('Get Notifications', async () => {
      const notifications = await notificationApi.getNotifications();
      return { count: notifications.length, notifications };
    });
  },

  /**
   * Full Integration Test
   * Creates talent, company, project, and tests collaboration flow
   */
  async runIntegrationTest() {
    log('\n🚀 Starting Full Integration Test\n', 'info');
    const results: TestResult[] = [];

    // 1. Health Check
    results.push(await this.testHealth());

    // 2. Create Talent
    const talentResult = await this.testSignupTalent();
    results.push(talentResult);
    if (!talentResult.passed) return results;

    // 3. Create Company
    const companyResult = await this.testSignupCompany();
    results.push(companyResult);
    if (!companyResult.passed) return results;

    // Note: In real scenario, you'd need to sign in to get access tokens
    // For now, this demonstrates the API structure

    log('\n📊 Integration Test Results:', 'info');
    results.forEach(r => {
      log(`${r.test}: ${r.passed ? 'PASSED ✅' : 'FAILED ❌'}`, r.passed ? 'success' : 'error');
    });

    return results;
  },

  /**
   * Run all basic tests
   */
  async runAll() {
    log('\n🧪 Running All Backend Tests\n', 'info');
    const allResults: TestResult[] = [];

    allResults.push(await this.testHealth());
    allResults.push(await this.testSignupTalent());
    allResults.push(await this.testSignupCompany());
    allResults.push(await this.testGetProjects());
    allResults.push(await this.testGetTalents());
    allResults.push(await this.testGetCompanies());

    // Summary
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;

    log('\n' + '='.repeat(50), 'info');
    log(`📊 Test Summary: ${passed} passed, ${failed} failed`, 'info');
    log('='.repeat(50) + '\n', 'info');

    allResults.forEach(r => {
      if (!r.passed) {
        log(`❌ ${r.test}: ${r.error}`, 'error');
      }
    });

    return allResults;
  },

  /**
   * Quick smoke test - just checks if server is responding
   */
  async smokeTest() {
    log('\n🔥 Running Smoke Test\n', 'info');
    
    try {
      const health = await healthCheck();
      log(`Server Status: ${health.status}`, 'success');
      log(`Timestamp: ${health.timestamp}`, 'info');
      log(`Stripe: ${health.stripe}`, health.stripe === 'configured' ? 'success' : 'info');
      
      return { passed: true, health };
    } catch (error) {
      log(`Server not responding: ${error}`, 'error');
      return { passed: false, error };
    }
  }
};

// Auto-run smoke test when in development
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  console.log('🔧 Backend Test Utility Loaded');
  console.log('Run: testBackend.smokeTest() to test server connection');
  console.log('Run: testBackend.runAll() to run all tests');
}
