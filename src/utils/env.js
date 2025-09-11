/**
 * Centralized Environment Configuration Utility
 * Provides a single source of truth for all environment variables
 */

// Get the processed environment variables (available at runtime)
const env = import.meta.env

/**
 * Environment configuration object with type safety and defaults
 */
export const ENV_CONFIG = {
  // Application Information
  APP_TITLE : env.VITE_APP_TITLE || 'MES Maintenance Frontend',
  APP_VERSION : env.VITE_APP_VERSION || '3.0.0',

  // Server Configuration
  PORT : Number( env.VITE_PORT ) || 9527,
  PUBLIC_PATH : env.VITE_PUBLIC_PATH || '/',

  // API Configuration
  BACKEND_URL : env.VITE_BACKEND_URL || 'http://localhost:8095/',
  PROXY_DOMAIN : env.VITE_PROXY_DOMAIN || '/api',
  PROXY_DOMAIN_REAL : env.VITE_PROXY_DOMAIN_REAL || '',

  // MinIO Configuration
  MINIO_URL : env.VITE_MINIO_URL || 'http://localhost:9000',
  DEFAULT_BUCKET_NAME : env.VITE_DEFAULT_BUCKET_NAME || 'default-bucket',

  // User Client Configuration
  USER_CLIENT_URL : env.VITE_USER_CLIENT_URL,

  // Build Configuration
  LEGACY : env.VITE_LEGACY === 'true' || env.VITE_LEGACY === true,
  DEBUG : env.VITE_DEBUG === 'true' || env.VITE_DEBUG === true,

  // Environment Detection
  MODE : env.MODE || 'development',
  DEV : env.DEV || false,
  PROD : env.PROD || false,
  SSR : env.SSR || false
}

/**
 * Environment helper functions
 */
export const ENV_UTILS = {
  /**
   * Check if running in development mode
   */
  isDev : () => ENV_CONFIG.MODE === 'development',

  /**
   * Check if running in production mode
   */
  isProd : () => ENV_CONFIG.MODE === 'production',

  /**
   * Check if debug mode is enabled
   */
  isDebug : () => ENV_CONFIG.DEBUG,

  /**
   * Get API base URL based on environment
   * In development: uses proxy (/api) to avoid CORS issues
   * In production: uses direct backend URL
   */
  getApiBaseUrl : () => {
    if ( ENV_CONFIG.MODE === 'development' ) {
      return ENV_CONFIG.PROXY_DOMAIN // '/api' - proxied by Vite
    }
    return ENV_CONFIG.BACKEND_URL // Direct backend URL in production
  },

  /**
   * Get full MinIO URL for file operations
   */
  getMinioUrl : ( path = '' ) => {
    return `${ENV_CONFIG.MINIO_URL}${path}`
  },

  /**
   * Get environment-specific configuration
   */
  getEnvConfig : key => {
    return ENV_CONFIG[key]
  },

  /**
   * Log environment configuration (for debugging)
   */
  logConfig : () => {
    if ( ENV_CONFIG.DEBUG ) {
      console.group( '🔧 Environment Configuration' )
      console.table( ENV_CONFIG )
      console.log( '🌐 API Base URL:', ENV_UTILS.getApiBaseUrl() )
      console.log( '🔄 Using Proxy:', ENV_CONFIG.MODE === 'development' )
      console.groupEnd()
    }
  },

  /**
   * Validate proxy configuration
   */
  validateProxyConfig : () => {
    if ( ENV_CONFIG.MODE === 'development' ) {
      if ( !ENV_CONFIG.PROXY_DOMAIN ) {
        console.warn( '⚠️ VITE_PROXY_DOMAIN not configured for development' )
      }
      if ( !ENV_CONFIG.PROXY_DOMAIN_REAL ) {
        console.warn( '⚠️ VITE_PROXY_DOMAIN_REAL not configured for development' )
      }
    } else {
      if ( !ENV_CONFIG.BACKEND_URL ) {
        console.warn( '⚠️ VITE_BACKEND_URL not configured for production' )
      }
    }
  }
}

/**
 * Legacy compatibility - maintain backward compatibility
 */
export const getEnvs = () => {
  const origin = window.location.origin
  let envStr = ''

  if ( ENV_CONFIG.MODE === 'development' ) {
    envStr = 'dev'
  } else {
    if ( origin.indexOf( 'fat' ) >= 0 ) {
      envStr = 'fat'
    } else if ( origin.indexOf( 'uat' ) >= 0 ) {
      envStr = 'uat'
    } else {
      envStr = 'pro'
    }
  }

  return { envStr }
}

// Initialize environment logging and validation in development
if ( ENV_UTILS.isDev() ) {
  ENV_UTILS.validateProxyConfig()
  ENV_UTILS.logConfig()
}

// Export individual values for convenience
export const {
  APP_TITLE,
  APP_VERSION,
  PORT,
  PUBLIC_PATH,
  BACKEND_URL,
  PROXY_DOMAIN,
  PROXY_DOMAIN_REAL,
  MINIO_URL,
  DEFAULT_BUCKET_NAME,
  LEGACY,
  DEBUG,
  MODE,
  DEV,
  PROD
} = ENV_CONFIG

// Default export
export default ENV_CONFIG
