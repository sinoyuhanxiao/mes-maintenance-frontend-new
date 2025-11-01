// Debug utility to test API configuration
import { ENV_CONFIG, ENV_UTILS } from './env'
import { getEnvs } from './envs'
import { GLOBAL_DATA } from '@/config/constant'

export function debugApiConfiguration() {
  console.group( '🔍 API Configuration Debug' )

  // Environment detection
  const { envStr } = getEnvs()
  console.log( 'Environment String:', envStr )
  console.log( 'Import Meta Env Mode:', import.meta.env.MODE )

  // Environment variables
  console.log( '\n📋 Environment Variables:' )
  console.log( 'VITE_PROXY_DOMAIN:', import.meta.env.VITE_PROXY_DOMAIN )
  console.log( 'VITE_PROXY_DOMAIN_REAL:', import.meta.env.VITE_PROXY_DOMAIN_REAL )
  console.log( 'VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL )

  // Processed configuration
  console.log( '\n⚙️ Processed Configuration:' )
  console.log( 'ENV_CONFIG.PROXY_DOMAIN:', ENV_CONFIG.PROXY_DOMAIN )
  console.log( 'ENV_CONFIG.PROXY_DOMAIN_REAL:', ENV_CONFIG.PROXY_DOMAIN_REAL )
  console.log( 'ENV_CONFIG.BACKEND_URL:', ENV_CONFIG.BACKEND_URL )

  // Base URL logic (NEW PROXY-BASED APPROACH)
  const newBaseUrl = ENV_UTILS.getApiBaseUrl()
  console.log( '\n🎯 Base URL Logic (NEW):' )
  console.log( 'Using Proxy:', ENV_CONFIG.MODE === 'development' )
  console.log( 'API Base URL:', newBaseUrl )

  // Legacy base URL logic (for comparison)
  const legacyBaseUrl = envStr === 'dev' ? ENV_CONFIG.BACKEND_URL : GLOBAL_DATA[envStr]?.baseUrl
  console.log( '\n📜 Legacy Base URL Logic:' )
  console.log( 'envStr === "dev":', envStr === 'dev' )
  console.log( 'Legacy baseUrl:', legacyBaseUrl )

  // Global data
  console.log( '\n🌐 Global Data:' )
  console.log( 'GLOBAL_DATA:', GLOBAL_DATA )

  console.groupEnd()

  // Proxy configuration validation
  console.log( '\n✅ Proxy Configuration:' )
  if ( ENV_CONFIG.MODE === 'development' ) {
    console.log( 'Proxy Domain:', ENV_CONFIG.PROXY_DOMAIN )
    console.log( 'Proxy Target:', ENV_CONFIG.PROXY_DOMAIN_REAL )
    console.log(
      'Proxy Status:',
      ENV_CONFIG.PROXY_DOMAIN && ENV_CONFIG.PROXY_DOMAIN_REAL ? '✅ Configured' : '❌ Missing'
    )
    console.log( 'Path Rewriting:', 'Disabled (preserves /api prefix)' )
    console.log( 'Expected Flow:', `${ENV_CONFIG.PROXY_DOMAIN}/work-order → ${ENV_CONFIG.PROXY_DOMAIN_REAL}/work-order` )
  } else {
    console.log( 'Production Backend:', ENV_CONFIG.BACKEND_URL )
    console.log( 'Backend Status:', ENV_CONFIG.BACKEND_URL ? '✅ Configured' : '❌ Missing' )
  }

  return {
    envStr,
    newBaseUrl,
    legacyBaseUrl,
    proxyDomain : ENV_CONFIG.PROXY_DOMAIN,
    proxyTarget : ENV_CONFIG.PROXY_DOMAIN_REAL,
    backendUrl : ENV_CONFIG.BACKEND_URL,
    usingProxy : ENV_CONFIG.MODE === 'development'
  }
}

// Auto-run in development
if ( ENV_CONFIG.DEBUG && typeof window !== 'undefined' ) {
  // Run after a short delay to ensure all modules are loaded
  setTimeout( () => {
    debugApiConfiguration()
  }, 1000 )
}
