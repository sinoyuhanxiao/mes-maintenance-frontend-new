
/**
 * Environment Configuration Processor
 * Processes raw environment variables with defaults, type conversion, and validation
 */
export const getEnv = ( envConf ) => {
  // Default configuration with proper types
  const defaults = {
    // Server Configuration
    VITE_PORT : 9527,
    VITE_PUBLIC_PATH : '/',

    // API Configuration
    VITE_PROXY_DOMAIN : '/api',
    VITE_PROXY_DOMAIN_REAL : '',
    VITE_BACKEND_URL : 'http://localhost:8095/',

    // MinIO Configuration
    VITE_MINIO_URL : 'http://localhost:9000',
    VITE_DEFAULT_BUCKET_NAME : 'default-bucket',

    // Build Configuration
    VITE_ROUTER_HISTORY : 'hash',
    VITE_LEGACY : false,
    VITE_DEBUG : false,

    // Application Configuration
    VITE_APP_TITLE : 'MES Maintenance Frontend',
    VITE_APP_VERSION : '3.0.0'
  }

  const ret = { ...defaults }

  // Process environment variables
  for ( const envName of Object.keys( envConf ) ) {
    let realName = envConf[envName]

    // Handle multiline strings
    if ( typeof realName === 'string' ) {
      realName = realName.replace( /\\n/g, '\n' )

      // Convert string booleans to actual booleans
      if ( realName === 'true' ) realName = true
      else if ( realName === 'false' ) realName = false

      // Remove quotes from strings
      else if ( realName.startsWith( '"' ) && realName.endsWith( '"' ) ) {
        realName = realName.slice( 1, -1 )
      } else if ( realName.startsWith( "'" ) && realName.endsWith( "'" ) ) {
        realName = realName.slice( 1, -1 )
      }
    }

    // Type conversion for specific variables
    if ( envName === 'VITE_PORT' && realName ) {
      realName = Number( realName )
      if ( isNaN( realName ) || realName < 1 || realName > 65535 ) {
        console.warn( `Invalid VITE_PORT: ${envConf[envName]}, using default: ${defaults.VITE_PORT}` )
        realName = defaults.VITE_PORT
      }
    }

    ret[envName] = realName

    // Set process.env for Node.js compatibility
    if ( typeof realName === 'string' ) {
      process.env[envName] = realName
    } else if ( typeof realName === 'object' ) {
      process.env[envName] = JSON.stringify( realName )
    } else {
      process.env[envName] = String( realName )
    }
  }

  // Validation
  validateEnvironment( ret )

  return ret
}

/**
 * Validate critical environment variables
 */
function validateEnvironment( env ) {
  const required = ['VITE_PORT', 'VITE_BACKEND_URL']
  const missing = required.filter( key => !env[key] )

  if ( missing.length > 0 ) {
    console.warn( 'Missing required environment variables:', missing )
  }

  // Validate URLs
  const urlFields = ['VITE_BACKEND_URL', 'VITE_MINIO_URL', 'VITE_PROXY_DOMAIN_REAL']
  urlFields.forEach( field => {
    if ( env[field] && env[field] !== '' && !isValidUrl( env[field] ) ) {
      console.warn( `Invalid URL format for ${field}: ${env[field]}` )
    }
  } )
}

/**
 * Simple URL validation
 */
function isValidUrl( string ) {
  try {
    // eslint-disable-next-line no-new
    new URL( string )
    return true
  } catch ( _ ) {
    return false
  }
}

export const regExps = ( value, reg ) => {
  return value.replace( new RegExp( `^${reg}`, 'g' ), '' )
}
