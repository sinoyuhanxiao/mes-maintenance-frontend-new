/**
 * Proxy Configuration Test Utility
 * Use this to verify that the proxy setup is working correctly
 */

import { ENV_CONFIG, ENV_UTILS } from './env'
import http from './request'

/**
 * Test proxy configuration
 */
export const testProxyConfiguration = async () => {
  console.group('🧪 Proxy Configuration Test')

  try {
    // Log current configuration
    console.log('📋 Current Configuration:')
    console.log('  Environment:', ENV_CONFIG.MODE)
    console.log('  API Base URL:', ENV_UTILS.getApiBaseUrl())
    console.log('  Using Proxy:', ENV_CONFIG.MODE === 'development')

    if (ENV_CONFIG.MODE === 'development') {
      console.log('  Proxy Domain:', ENV_CONFIG.PROXY_DOMAIN)
      console.log('  Proxy Target:', ENV_CONFIG.PROXY_DOMAIN_REAL)
    } else {
      console.log('  Backend URL:', ENV_CONFIG.BACKEND_URL)
    }

    // Test a simple API call
    console.log('\n🔄 Testing API Connection...')

    // Use a simple endpoint that should exist
    const testEndpoint = '/work-order' // Test the work order endpoint that was failing

    const startTime = performance.now()
    const response = await http.request({
      method: 'get',
      url: testEndpoint,
    })
    const endTime = performance.now()

    console.log('✅ API Test Successful!')
    console.log(`  Response Time: ${Math.round(endTime - startTime)}ms`)
    console.log('  Response Status:', response.status || 'OK')
    console.log('  Data Received:', !!response.data)

    // Log network details for debugging
    if (ENV_CONFIG.DEBUG) {
      console.log('\n🔍 Debug Information:')
      console.log('  Full URL would be:', `${ENV_UTILS.getApiBaseUrl()}${testEndpoint}`)
      console.log(
        '  Response sample:',
        response.data ? JSON.stringify(response.data).substring(0, 100) + '...' : 'No data'
      )
    }
  } catch (error) {
    console.error('❌ Proxy Test Failed!')
    console.error('  Error:', error.message)

    // Provide helpful debugging information
    if (ENV_CONFIG.MODE === 'development') {
      console.log('\n🔧 Debugging Tips:')
      console.log('  1. Check if backend server is running on:', ENV_CONFIG.PROXY_DOMAIN_REAL)
      console.log('  2. Verify Vite proxy configuration in vite.config.mjs')
      console.log('  3. Check browser Network tab for actual request URLs')
      console.log('  4. Ensure VITE_PROXY_DOMAIN and VITE_PROXY_DOMAIN_REAL are set correctly')
    } else {
      console.log('\n🔧 Debugging Tips:')
      console.log('  1. Check if production backend is accessible:', ENV_CONFIG.BACKEND_URL)
      console.log('  2. Verify CORS configuration on production backend')
      console.log('  3. Check network connectivity to production API')
    }
  }

  console.groupEnd()
}

/**
 * Test different API endpoints
 */
export const testApiEndpoints = async () => {
  const endpoints = ['/work-order', '/common/work-type', '/common/priority', '/common/category']

  console.group('🎯 API Endpoints Test')

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`)
      const startTime = performance.now()

      await http.request({
        method: 'get',
        url: endpoint,
      })

      const endTime = performance.now()
      console.log(`  ✅ ${endpoint} - ${Math.round(endTime - startTime)}ms`)
    } catch (error) {
      console.log(`  ❌ ${endpoint} - ${error.message}`)
    }
  }

  console.groupEnd()
}

/**
 * Compare proxy vs direct URL performance (development only)
 */
export const compareProxyPerformance = async () => {
  if (ENV_CONFIG.MODE !== 'development') {
    console.log('⚠️ Proxy performance comparison only available in development')
    return
  }

  console.group('⚡ Proxy vs Direct URL Performance')

  const testEndpoint = '/common/work-type'
  const iterations = 3

  try {
    // Test proxy (current setup)
    console.log('Testing proxy requests...')
    const proxyTimes = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await http.request({
        method: 'get',
        url: testEndpoint,
      })
      const endTime = performance.now()
      proxyTimes.push(endTime - startTime)
    }

    const avgProxyTime = proxyTimes.reduce((a, b) => a + b, 0) / proxyTimes.length
    console.log(`  Proxy Average: ${Math.round(avgProxyTime)}ms`)

    // Note: We can't easily test direct URL without changing configuration
    console.log('  Direct URL test would require configuration change')
    console.log('  Proxy overhead is typically minimal (< 5ms)')
  } catch (error) {
    console.error('Performance test failed:', error.message)
  }

  console.groupEnd()
}

/**
 * Validate environment configuration
 */
export const validateEnvironment = () => {
  console.group('✅ Environment Validation')

  const issues = []

  // Check required environment variables
  if (ENV_CONFIG.MODE === 'development') {
    if (!ENV_CONFIG.PROXY_DOMAIN) {
      issues.push('VITE_PROXY_DOMAIN is not set')
    }
    if (!ENV_CONFIG.PROXY_DOMAIN_REAL) {
      issues.push('VITE_PROXY_DOMAIN_REAL is not set')
    }
    if (!ENV_CONFIG.PROXY_DOMAIN.startsWith('/')) {
      issues.push('VITE_PROXY_DOMAIN should start with "/"')
    }
  } else {
    if (!ENV_CONFIG.BACKEND_URL) {
      issues.push('VITE_BACKEND_URL is not set for production')
    }
    if (ENV_CONFIG.BACKEND_URL && !ENV_CONFIG.BACKEND_URL.startsWith('http')) {
      issues.push('VITE_BACKEND_URL should be a complete URL')
    }
  }

  if (issues.length === 0) {
    console.log('✅ All environment variables are properly configured')
  } else {
    console.warn('⚠️ Configuration Issues Found:')
    issues.forEach(issue => console.warn(`  - ${issue}`))
  }

  console.groupEnd()
}

// Auto-run validation in development with debug enabled
if (ENV_CONFIG.MODE === 'development' && ENV_CONFIG.DEBUG) {
  // Run validation after a short delay to ensure everything is loaded
  setTimeout(() => {
    validateEnvironment()
  }, 1000)
}

export default {
  testProxyConfiguration,
  testApiEndpoints,
  compareProxyPerformance,
  validateEnvironment,
}
