/**
 * Axios Wrapper (HttpRequest)
 *
 * Main Features:
 * 1. Automatically attach Authorization Header (using access_token from localStorage).
 * 2. Unified error handling: display error messages based on backend status or HTTP status.
 * 3. Automatic token refresh:
 *    - In the Request interceptor, pre-check whether the access_token is about to expire
 *      (default: within 120s) → proactively call refresh().
 *    - In the Response interceptor, if a 401 is detected (either HTTP status or backend-wrapped status),
 *      call refresh() and retry the original request.
 * 4. Prevent multiple concurrent refreshes:
 *    - Uses isRefreshing / refreshPromise / refreshWaitQueue to ensure only one refresh request
 *      is triggered; other requests will wait until it completes.
 * 5. Special endpoint whitelist:
 *    - callback/refresh/logout endpoints will not trigger refresh, to avoid infinite loops.
 *    - Endpoints listed in WHITE_LIST do not require Authorization.
 * 6. Handling refresh failure:
 *    - Clear user info and tokens, then call gotoCognitoLogin() to redirect the user to Cognito login.
 *
 * Usage:
 *   import http from '@/utils/request'
 *   http.request({ method: 'get', url: '/api/xxx' })
 *
 * Notes:
 * - access_token / refresh_token / id_token are stored in localStorage.
 * - After successful refresh, the new access_token will be automatically written back to localStorage.
 * - Each request will only retry once at most, to avoid infinite loops.
 */
'use strict'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ENV_UTILS } from './env'
import { useUserStore } from '@/store'
import { gotoCognitoLogin } from '@/utils/cognito/cognito'
import { WHITE_CODE_LIST, LOGIN_ERROR_CODE, WHITE_LIST } from '@/config/constant'
import { refresh } from '@/api/user'
import { willExpireSoon } from '@/utils/jwt'

const TOKEN_SKEW_SECONDS = Number( import.meta.env.VITE_TOKEN_SKEW ) || 120
// Global whitelist path
const WHITELIST_URLS = WHITE_LIST.map( path => `/auth${path}` )
// Use the environment utility for consistent API base URL logic
const REFRESH_URLS = ['/auth/refresh', '/auth/callback', '/auth/logout']
const BASE_URL = ENV_UTILS.getApiBaseUrl()

let isRefreshing = false
let isLoggingOut = false
let refreshPromise = null
const refreshWaitQueue = []

function getAccessToken() {
  return localStorage.getItem( 'access_token' )
}
function getRefreshToken() {
  return localStorage.getItem( 'refresh_token' )
}

function setAuthHeader( config, token ) {
  if ( !config.headers ) config.headers = {}
  if ( token ) config.headers.Authorization = `Bearer ${token}`
  return config
}

function isAuthWhitelisted( input ) {
  const url = typeof input === 'string' ? input : input?.url || ''
  return REFRESH_URLS.some( p => url.includes( p ) ) || WHITELIST_URLS.some( p => url.includes( p ) )
}

async function ensureFreshTokenIfNeeded( config ) {
  // Only perform pre-refresh checks for non-whitelist interfaces
  if ( isAuthWhitelisted( config ) ) return
  const at = getAccessToken()
  if ( !at ) return
  if ( willExpireSoon( at, TOKEN_SKEW_SECONDS ) ) {
    await doRefreshOnce()
  }
}

async function doRefreshOnce() {
  if ( isRefreshing ) {
    // It has been refreshed and is reusing the same promise
    return refreshPromise
  }
  const rt = getRefreshToken()
  if ( !rt ) {
    throw new Error( 'No refresh token available' )
  }
  isRefreshing = true
  refreshPromise = refresh()
    .then( res => {
      const atNew = getAccessToken()
      // Wake up the requests in the queue after success
      refreshWaitQueue.splice( 0 ).forEach( cb => cb( atNew ) )
      return res
    } )
    .catch( err => {
      // Refresh failed: Clear status & Let the outer layer handle logout / redirect to log in
      refreshWaitQueue.splice( 0 ).forEach( cb => cb( null ) )
      throw err
    } )
    .finally( () => {
      isRefreshing = false
      refreshPromise = null
    } )
  return refreshPromise
}

async function handleAuthFailure( reason ) {
  if ( isLoggingOut ) {
    console.warn( `Blocking duplicate auth failure handling: ${reason}` )
    return
  }
  isLoggingOut = true
  console.warn( 'Authentication failed:', reason )
  try {
    const userStore = useUserStore()
    await userStore.LOGIN_OUT()
  } catch ( e ) {
    console.error( 'Logout cleanup error', e )
  } finally {
    gotoCognitoLogin()
  }
}

function getErrorMessage( data, status ) {
  const backendMsg = data?.message || data?.error || data?.msg
  if ( backendMsg ) return backendMsg

  if ( status ) {
    return new HttpRequest().checkStatus( status )
  }
  return 'Unknown error occurred'
}

// import qs from 'qs'
class HttpRequest {
  // #baseUrl
  constructor() {
    this.baseUrl = BASE_URL
    this.withCredentials = false
    this.timeout = 60 * 60 * 24 * 1000
  }

  getConfig() {
    return {
      baseURL : this.baseUrl,
      timeout : this.timeout,
      withCredentials : this.withCredentials,
      headers : {
        'Content-Type' : 'application/json;charset=UTF-8'
      }
    }
  }

  getParams( payload ) {
    const { data, params } = payload
    const method = ( payload.method || 'get' ).toLowerCase()
    if ( ['post', 'put', 'patch', 'delete'].includes( method ) ) {
      payload.data = data
    } else {
      // For GET requests, use params if already provided, otherwise use data
      payload.params = params || data
      delete payload.data
    }
    return payload
  }

  checkStatus( status ) {
    let errMessage
    switch ( status ) {
      case 400:
        errMessage = 'Bad Request'
        break
      case 401:
        errMessage = 'Unauthorized, please login again'
        break
      case 403:
        errMessage = 'Access Denied'
        break
      case 404:
        errMessage = 'Request Error, resource not found'
        break
      case 405:
        errMessage = 'Request method not allowed'
        break
      case 408:
        errMessage = 'Request Timeout'
        break
      case 409:
        errMessage = 'Conflict error'
        break
      case 500:
        errMessage = 'Internal Server Error'
        break
      case 501:
        errMessage = 'Not Implemented'
        break
      case 502:
        errMessage = 'Bad Gateway'
        break
      case 503:
        errMessage = 'Service Unavailable'
        break
      case 504:
        errMessage = 'Gateway Timeout'
        break
      case 505:
        errMessage = 'HTTP Version Not Supported'
        break
      default:
        errMessage = 'Connection Error'
    }
    return errMessage
  }

  /**
   * Refresh and replay the original request (including the concurrent queue)
   */
  async tryRefreshAndRetry( instance, originalConfig ) {
    // Avoid refreshing/calling back the refresh/call back mechanism to refresh itself
    if ( isAuthWhitelisted( originalConfig ) ) {
      return Promise.reject( new Error( 'Auth endpoint failed' ) )
    }
    // Avoiding an infinite loop
    if ( originalConfig._retried ) {
      return Promise.reject( new Error( 'Retry already attempted' ) )
    }
    originalConfig._retried = true

    // If the page is being refreshed: Suspend the current request and replay it after the refresh is complete.
    if ( isRefreshing ) {
      return new Promise( ( resolve, reject ) => {
        refreshWaitQueue.push( newToken => {
          if ( !newToken ) {
            reject( new Error( 'Refresh failed during queue wait' ) )
          } else {
            setAuthHeader( originalConfig, newToken )
            resolve( instance( originalConfig ) )
          }
        } )
      } )
    }
    // Start refreshing
    try {
      await doRefreshOnce()
      const atNew = getAccessToken()
      setAuthHeader( originalConfig, atNew )
      return instance( originalConfig )
    } catch ( error ) {
      return Promise.reject( error )
    }
  }

  setInterceptors( instance ) {
    // Request Interceptor
    instance.interceptors.request.use(
      async config => {
        if ( !navigator.onLine ) {
          ElMessage( {
            message : 'Please check if your network is available',
            type : 'error',
            duration : 3 * 1000
          } )
          return Promise.reject( new Error( 'Please check if your network is available' ) )
        }

        // Pre-fetching (to avoid requests falling into 401 status)
        await ensureFreshTokenIfNeeded( config )
        if ( !isAuthWhitelisted( config ) ) {
          setAuthHeader( config, getAccessToken() )
        }
        return config
      },
      error => Promise.reject( new Error( error ) )
    )
    // Response Interceptor
    instance.interceptors.response.use(
      async res => {
        const result = res.data
        const type = Object.prototype.toString.call( result )
        if ( type === '[object Blob]' || type === '[object ArrayBuffer]' ) {
          return result
        }
        const { status } = result
        const isErrorToken = LOGIN_ERROR_CODE.find( item => item.status === status )
        if ( isErrorToken ) {
          if ( isLoggingOut ) return Promise.reject( new Error( 'Logging out' ) )
          try {
            return await this.tryRefreshAndRetry( instance, res.config )
          } catch ( e ) {
            await handleAuthFailure( 'Soft 401 refresh failed' )
            return Promise.reject( e )
          }
        }

        const isWhiteCode = WHITE_CODE_LIST.find( item => item.status === status )
        if ( !isWhiteCode ) {
          // Prioritize backend error message, fallback to generic error
          const errorMessage = getErrorMessage( result )
          ElMessage( {
            message : errorMessage,
            type : 'error',
            duration : 3000
          } )
          return Promise.reject( new Error( errorMessage ) )
        }
        return result
      },
      async error => {
        const cfg = error?.config || {}
        const httpStatus = error?.response?.status
        const respData = error?.response?.data

        if ( httpStatus === 401 ) {
          if ( isAuthWhitelisted( cfg ) ) {
            await handleAuthFailure( '401 on Whitelisted URL' )
            return Promise.reject( new Error( 'Authentication expired' ) )
          }
          if ( isLoggingOut ) {
            return Promise.reject( new Error( 'Already logging out' ) )
          }
          try {
            return await this.tryRefreshAndRetry( instance, cfg )
          } catch ( e ) {
            await handleAuthFailure( 'Hard 401 refresh failed' )
            return Promise.reject( e )
          }
        }
        // Other errors: Keep the original prompt
        const statusText = this.checkStatus( httpStatus )
        const errorMessage =
          getErrorMessage( respData, httpStatus, statusText ) || error.message || 'Fail to connect to the server'
        const isTimeout = ( errorMessage || '' ).toLowerCase().includes( 'timeout' )
        const finalMessage = isTimeout ? 'Network Request Timeout' : errorMessage || 'Fail to connect to the server'
        ElMessage( {
          message : finalMessage,
          type : 'error',
          duration : 2 * 1000
        } )
        return Promise.reject( new Error( finalMessage ) )
      }
    )
  }

  request( options ) {
    const instance = axios.create()
    const baseOpt = this.getConfig()
    const params = Object.assign( {}, baseOpt, this.getParams( options ) )
    this.setInterceptors( instance )
    return instance( params )
  }
}

const http = new HttpRequest()
export default http
