/**
 * Test script to verify the proxy fix is working
 * Run this in the browser console after starting the dev server
 */

import { ENV_CONFIG, ENV_UTILS } from './env'
import http from './request'

/**
 * Test the proxy fix by making actual API calls
 */
export const testProxyFix = async() => {
  console.group( '🔧 Proxy Fix Verification' )

  try {
    // Show current configuration
    console.log( '📋 Current Configuration:' )
    console.log( '  Environment:', ENV_CONFIG.MODE )
    console.log( '  API Base URL:', ENV_UTILS.getApiBaseUrl() )
    console.log( '  Proxy Domain:', ENV_CONFIG.PROXY_DOMAIN )
    console.log( '  Proxy Target:', ENV_CONFIG.PROXY_DOMAIN_REAL )
    console.log( '  Backend URL:', ENV_CONFIG.BACKEND_URL )

    // Test the work order endpoint that was failing
    console.log( '\n🧪 Testing Work Order Endpoint...' )
    console.log( 'Making request to: /api/work-order' )

    const startTime = performance.now()

    try {
      const response = await http.request( {
        method : 'get',
        url : '/work-order',
        data : {
          page : 1,
          size : 5,
          sortField : 'createdAt',
          direction : 'DESC'
        }
      } )

      const endTime = performance.now()
      const responseTime = Math.round( endTime - startTime )

      console.log( '✅ Work Order API Test PASSED!' )
      console.log( `  Response Time: ${responseTime}ms` )
      console.log( '  Status:', response.status || 'Success' )
      console.log( '  Data Received:', !!response.data )

      if ( response.data && response.data.content ) {
        console.log( `  Work Orders Count: ${response.data.content.length}` )
        console.log( `  Total Elements: ${response.data.totalElements || 'N/A'}` )
      }

      return { success : true, responseTime, data : response.data }
    } catch ( error ) {
      console.error( '❌ Work Order API Test FAILED!' )
      console.error( '  Error:', error.message )

      // Provide specific debugging for common issues
      if ( error.message.includes( 'No endpoint' ) ) {
        console.log( '\n🔍 Debugging "No endpoint" error:' )
        console.log( '  1. Check if backend is running on:', ENV_CONFIG.PROXY_DOMAIN_REAL )
        console.log( '  2. Verify backend has /api/work-order endpoint' )
        console.log( '  3. Check if proxy is preserving /api prefix' )
      } else if ( error.message.includes( 'Network Error' ) ) {
        console.log( '\n🔍 Debugging Network Error:' )
        console.log( '  1. Check if backend server is running' )
        console.log( '  2. Verify proxy target URL:', ENV_CONFIG.PROXY_DOMAIN_REAL )
        console.log( '  3. Check firewall/network connectivity' )
      } else if ( error.message.includes( 'CORS' ) ) {
        console.log( '\n🔍 Debugging CORS Error:' )
        console.log( '  1. This should not happen with proxy!' )
        console.log( '  2. Check if proxy is working correctly' )
        console.log( '  3. Verify requests are going to localhost:9527, not direct backend' )
      }

      return { success : false, error : error.message }
    }
  } finally {
    console.groupEnd()
  }
}

/**
 * Test multiple endpoints to verify proxy is working across the board
 */
export const testMultipleEndpoints = async() => {
  console.group( '🎯 Multiple Endpoints Test' )

  const endpoints = [
    { url : '/work-order', name : 'Work Orders' },
    { url : '/common/work-type', name : 'Work Types' },
    { url : '/common/priority', name : 'Priorities' },
    { url : '/common/category', name : 'Categories' }
  ]

  const results = []

  for ( const endpoint of endpoints ) {
    try {
      console.log( `Testing ${endpoint.name} (${endpoint.url})...` )

      const startTime = performance.now()
      const response = await http.request( {
        method : 'get',
        url : endpoint.url
      } )
      const endTime = performance.now()

      const result = {
        endpoint : endpoint.url,
        name : endpoint.name,
        success : true,
        responseTime : Math.round( endTime - startTime ),
        hasData : !!response.data
      }

      results.push( result )
      console.log( `  ✅ ${endpoint.name} - ${result.responseTime}ms` )
    } catch ( error ) {
      const result = {
        endpoint : endpoint.url,
        name : endpoint.name,
        success : false,
        error : error.message
      }

      results.push( result )
      console.log( `  ❌ ${endpoint.name} - ${error.message}` )
    }
  }

  // Summary
  const successful = results.filter( r => r.success ).length
  const total = results.length

  console.log( `\n📊 Summary: ${successful}/${total} endpoints working` )

  if ( successful === total ) {
    console.log( '🎉 All endpoints are working! Proxy fix is successful.' )
  } else {
    console.log( '⚠️ Some endpoints are failing. Check backend server and configuration.' )
  }

  console.groupEnd()
  return results
}

/**
 * Compare request URLs to verify proxy is working
 */
export const verifyProxyUrls = () => {
  console.group( '🔍 Proxy URL Verification' )

  const frontendUrl = window.location.origin
  const apiBaseUrl = ENV_UTILS.getApiBaseUrl()
  const fullApiUrl = `${frontendUrl}${apiBaseUrl}`

  console.log( 'Frontend Origin:', frontendUrl )
  console.log( 'API Base URL:', apiBaseUrl )
  console.log( 'Full API URL:', fullApiUrl )

  if ( ENV_CONFIG.MODE === 'development' ) {
    console.log( '\n✅ Development Mode:' )
    console.log( '  Requests should go to:', `${frontendUrl}/api/*` )
    console.log( '  Proxy forwards to:', ENV_CONFIG.PROXY_DOMAIN_REAL )
    console.log( '  Same origin?', fullApiUrl.startsWith( frontendUrl ) ? '✅ Yes' : '❌ No' )
  } else {
    console.log( '\n✅ Production Mode:' )
    console.log( '  Requests go directly to:', ENV_CONFIG.BACKEND_URL )
  }

  console.groupEnd()
}

/**
 * Run all proxy tests
 */
export const runAllProxyTests = async() => {
  console.log( '🚀 Running Complete Proxy Test Suite...\n' )

  // 1. Verify URLs
  verifyProxyUrls()

  // 2. Test the main endpoint that was failing
  const mainTest = await testProxyFix()

  // 3. Test multiple endpoints
  const multiTest = await testMultipleEndpoints()

  // 4. Final summary
  console.group( '📋 Final Summary' )
  console.log( 'Main Test (Work Orders):', mainTest.success ? '✅ PASSED' : '❌ FAILED' )

  const successfulEndpoints = multiTest.filter( r => r.success ).length
  console.log( `Multiple Endpoints: ${successfulEndpoints}/${multiTest.length} working` )

  if ( mainTest.success && successfulEndpoints === multiTest.length ) {
    console.log( '\n🎉 PROXY FIX SUCCESSFUL!' )
    console.log( 'All tests passed. The proxy configuration is working correctly.' )
  } else {
    console.log( '\n⚠️ ISSUES DETECTED' )
    console.log( 'Some tests failed. Check the detailed logs above for debugging information.' )
  }
  console.groupEnd()

  return {
    mainTest,
    multiTest,
    allPassed : mainTest.success && successfulEndpoints === multiTest.length
  }
}

// Auto-run in development with debug enabled
if ( ENV_CONFIG.MODE === 'development' && ENV_CONFIG.DEBUG ) {
  // Run tests after a delay to ensure everything is loaded
  setTimeout( () => {
    console.log( '🔧 Auto-running proxy tests in debug mode...' )
    runAllProxyTests()
  }, 2000 )
}

export default {
  testProxyFix,
  testMultipleEndpoints,
  verifyProxyUrls,
  runAllProxyTests
}
