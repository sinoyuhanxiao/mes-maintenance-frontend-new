'use strict'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ENV_UTILS } from './env'
import cookies from '@/utils/cookies'
import router from '@/router'
import { useUserStore } from '@/store'

import { TOKEN, WHITE_CODE_LIST, LOGIN_ERROR_CODE } from '@/config/constant'
// import qs from 'qs'
class HttpRequest {
  // #baseUrl
  constructor() {
    this.baseUrl = this.getBaseUrl()
    this.withCredentials = false
    this.timeout = 60 * 60 * 24 * 1000
  }

  getBaseUrl() {
    // Use the environment utility for consistent API base URL logic
    return ENV_UTILS.getApiBaseUrl()
  }

  getConfig( overrideBaseUrl ) {
    return {
      baseURL : overrideBaseUrl || this.baseUrl,
      timeout : this.timeout,
      withCredentials : this.withCredentials,
      headers : {
        'Content-Type' : 'application/json;charset=UTF-8'
      }
    }
  }

  getParams( payload ) {
    const { method, data } = payload
    if ( ['post', 'put', 'patch', 'delete'].indexOf( method ) >= 0 ) {
      payload.data = data
    } else {
      payload.params = data
      delete payload.data
    }
    return payload
  }

  checkStatus( status ) {
    let errMessage = ''
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

  setInterceptors( instance ) {
    const that = this
    instance.interceptors.request.use(
      config => {
        if ( !navigator.onLine ) {
          ElMessage( {
            message : 'Please check if your network is available',
            type : 'error',
            duration : 3 * 1000
          } )
          return Promise.reject( new Error( 'Please check if your network is available' ) )
        }
        const token = cookies.get( TOKEN )
        if ( token ) {
          config.headers.Authorization = token
        }
        // config.data = qs.stringify( config.data )

        return config
      },
      error => {
        return Promise.reject( new Error( error ) )
      }
    )
    // Response interceptor
    instance.interceptors.response.use(
      res => {
        const result = res.data
        const type = Object.prototype.toString.call( result )

        // const $config = res.config

        // if it is a file download, return directly
        if ( type === '[object Blob]' || type === '[object ArrayBuffer]' ) {
          return result
        } else {
          const { status } = result
          const isErrorToken = LOGIN_ERROR_CODE.find( item => item.status == status )
          const isWhiteCode = WHITE_CODE_LIST.find( item => item.status == status )

          const userStore = useUserStore()

          if ( isErrorToken ) {
            userStore.LOGIN_OUT()
            router.push( '/login' )
            window.location.reload()
          } else if ( !isWhiteCode ) {
            // Prioritize backend error message, fallback to generic error
            const backendMessage = result.message || result.error || result.msg
            const errorMessage = backendMessage || 'Unknown error occurred'

            ElMessage( {
              message : errorMessage,
              type : 'error',
              duration : 3 * 1000
            } )
            return Promise.reject( new Error( errorMessage ) )
          } else {
            return result
          }
        }

        return result
      },
      error => {
        let errorMessage = error.message

        if ( error && error.response ) {
          // Prioritize backend error message from response data
          const backendMessage = error.response.data?.message || error.response.data?.error || error.response.data?.msg

          // Use backend message if available, otherwise fall back to HTTP status message
          errorMessage = backendMessage || that.checkStatus( error.response.status )
        }

        const isTimeout = errorMessage.includes( 'timeout' )
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
    const baseOpt = this.getConfig( options.baseURL )
    const params = Object.assign( {}, baseOpt, this.getParams( options ) )

    this.setInterceptors( instance )
    return instance( params )
  }
}

const http = new HttpRequest()
export default http
