// Debug utility to test API configuration
import { ENV_CONFIG } from './env'
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

  // Base URL logic
  const baseUrlStr = envStr === 'dev' ? ENV_CONFIG.PROXY_DOMAIN : GLOBAL_DATA[envStr].baseUrl
  console.log( '\n🎯 Base URL Logic:' )
  console.log( 'envStr === "dev":', envStr === 'dev' )
  console.log( 'Selected baseUrl:', baseUrlStr )

  // Global data
  console.log( '\n🌐 Global Data:' )
  console.log( 'GLOBAL_DATA:', GLOBAL_DATA )

  console.groupEnd()

  return {
    envStr,
    baseUrl : baseUrlStr,
    proxyDomain : ENV_CONFIG.PROXY_DOMAIN,
    proxyTarget : ENV_CONFIG.PROXY_DOMAIN_REAL,
    backendUrl : ENV_CONFIG.BACKEND_URL
  }
}

// Auto-run in development
if ( ENV_CONFIG.DEBUG && typeof window !== 'undefined' ) {
  // Run after a short delay to ensure all modules are loaded
  setTimeout( () => {
    debugApiConfiguration()
  }, 1000 )
}
