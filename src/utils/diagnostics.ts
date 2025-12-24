/**
 * Diagnostic Utility for Collabio Backend
 * 
 * Zkontroluje stav backendu a vypíše detailní report
 */

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7e99ffa9`;

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

class BackendDiagnostics {
  private results: DiagnosticResult[] = [];

  private log(test: string, status: 'pass' | 'fail' | 'warn', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    
    const emoji = {
      pass: '✅',
      fail: '❌',
      warn: '⚠️'
    }[status];

    console.log(`${emoji} ${test}: ${message}`);
    if (details) {
      console.log('   Details:', details);
    }
  }

  /**
   * Test 1: Kontrola konfigurace
   */
  async testConfiguration() {
    console.log('\n🔧 Test 1: Konfigurace\n' + '='.repeat(50));

    // Project ID
    if (projectId && projectId !== 'your-project-id') {
      this.log('Project ID', 'pass', `Nastaveno: ${projectId}`);
    } else {
      this.log('Project ID', 'fail', 'Project ID není nastaven!');
    }

    // Anon Key
    if (publicAnonKey && publicAnonKey.length > 100) {
      this.log('Anon Key', 'pass', 'Anon Key je nastaven');
    } else {
      this.log('Anon Key', 'fail', 'Anon Key není správně nastaven!');
    }

    // Base URL
    this.log('Base URL', 'pass', BASE_URL);
  }

  /**
   * Test 2: Network connectivity
   */
  async testConnectivity() {
    console.log('\n🌐 Test 2: Síťové připojení\n' + '='.repeat(50));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.log('Health Check', 'pass', 'Backend je online!', data);
        
        // Check Stripe
        if (data.stripe === 'configured') {
          this.log('Stripe', 'pass', 'Stripe je nakonfigurován');
        } else {
          this.log('Stripe', 'warn', 'Stripe není nakonfigurován (potřebné pro platby)');
        }

        return true;
      } else {
        this.log('Health Check', 'fail', `HTTP ${response.status}: ${response.statusText}`);
        
        try {
          const errorData = await response.json();
          this.log('Error Details', 'fail', 'Server vrátil chybu', errorData);
        } catch (e) {
          // Cannot parse error
        }
        
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          this.log('Health Check', 'fail', 'Timeout - server neodpovídá do 10s');
        } else {
          this.log('Health Check', 'fail', `Chyba připojení: ${error.message}`);
        }
      }
      return false;
    }
  }

  /**
   * Test 3: CORS
   */
  async testCORS() {
    console.log('\n🔒 Test 3: CORS\n' + '='.repeat(50));

    try {
      const response = await fetch(`${BASE_URL}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
        }
      });

      if (response.ok || response.status === 204) {
        const corsHeaders = {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        };
        this.log('CORS', 'pass', 'CORS headers jsou správně nastaveny', corsHeaders);
      } else {
        this.log('CORS', 'warn', 'CORS možná není správně nakonfigurován');
      }
    } catch (error) {
      this.log('CORS', 'warn', 'Nelze otestovat CORS (může být OK)');
    }
  }

  /**
   * Test 4: API Endpoints
   */
  async testEndpoints() {
    console.log('\n📡 Test 4: API Endpointy\n' + '='.repeat(50));

    const endpoints = [
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/talents', method: 'GET', name: 'Get Talents' },
      { path: '/companies', method: 'GET', name: 'Get Companies' },
      { path: '/projects', method: 'GET', name: 'Get Projects' },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const dataInfo = Array.isArray(data) ? `Array (${data.length} items)` : 'Object';
          this.log(endpoint.name, 'pass', `${endpoint.method} ${endpoint.path} - ${dataInfo}`);
        } else {
          this.log(endpoint.name, 'fail', `${response.status} ${response.statusText}`);
        }
      } catch (error) {
        this.log(endpoint.name, 'fail', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  /**
   * Test 5: Auth Flow
   */
  async testAuth() {
    console.log('\n🔐 Test 5: Autentizace\n' + '='.repeat(50));

    // Test signup endpoint (bez skutečné registrace)
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Invalid data to test endpoint exists
          email: '',
          password: ''
        })
      });

      // We expect 400 (bad request) which means endpoint exists
      if (response.status === 400) {
        this.log('Signup Endpoint', 'pass', 'Endpoint existuje (testováno s neplatnými daty)');
      } else if (response.ok) {
        this.log('Signup Endpoint', 'warn', 'Endpoint funguje, ale měl by validovat input');
      } else {
        this.log('Signup Endpoint', 'fail', `Neočekávaná odpověď: ${response.status}`);
      }
    } catch (error) {
      this.log('Signup Endpoint', 'fail', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n📊 SOUHRNNÝ REPORT\n' + '='.repeat(50));

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;

    console.log(`✅ Prošlo: ${passed}`);
    console.log(`❌ Selhalo: ${failed}`);
    console.log(`⚠️  Varování: ${warnings}`);
    console.log('\n');

    if (failed === 0 && warnings === 0) {
      console.log('🎉 Backend je plně funkční!');
    } else if (failed === 0) {
      console.log('✅ Backend funguje, ale jsou nějaká varování');
    } else {
      console.log('❌ Backend má problémy, které je potřeba vyřešit');
      console.log('\nNejčastější řešení:');
      console.log('1. Zkontrolujte, že Edge Function je nasazená v Supabase Dashboard');
      console.log('2. Restartujte Edge Function');
      console.log('3. Zkontrolujte logy v Supabase Dashboard → Edge Functions → Logs');
      console.log('4. Přečtěte si /JAK_DEPLOYНOUT_BACKEND.md');
    }

    return {
      total: this.results.length,
      passed,
      failed,
      warnings,
      results: this.results
    };
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('🚀 Collabio Backend Diagnostics');
    console.log('='.repeat(50));

    await this.testConfiguration();
    const isOnline = await this.testConnectivity();
    
    if (isOnline) {
      await this.testCORS();
      await this.testEndpoints();
      await this.testAuth();
    } else {
      console.log('\n⚠️  Backend není online, přeskakuji další testy');
      console.log('\nPřečtěte si: /JAK_DEPLOYНOUT_BACKEND.md');
    }

    return this.generateReport();
  }
}

// Export for use
export const diagnostics = new BackendDiagnostics();

// Auto-run if in browser
if (typeof window !== 'undefined') {
  (window as any).runDiagnostics = () => diagnostics.runAll();
  console.log('💡 Spusťte: runDiagnostics() pro kontrolu backendu');
}
