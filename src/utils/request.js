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

  getConfig() {
    const config = {
      baseURL : this.baseUrl,
      timeout : this.timeout,
      withCredentials : this.withCredentials,
      headers : {
        'Content-Type' : 'application/json;charset=UTF-8'
      }
    }
    return config
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
          const { status, message } = result
          const isErrorToken = LOGIN_ERROR_CODE.find( item => item.status == status )
          const isWhiteCode = WHITE_CODE_LIST.find( item => item.status == status )

          const userStore = useUserStore()

          if ( isErrorToken ) {
            userStore.LOGIN_OUT()
            router.push( '/login' )
            window.location.reload()
          } else if ( !isWhiteCode ) {
            ElMessage( {
              message : message || 'Error',
              type : 'error',
              duration : 3 * 1000
            } )
            return Promise.reject( new Error( message || 'Error' ) )
          } else {
            return result
          }
        }

        return result
      },
      error => {
        if ( error && error.response ) {
          error.message = that.checkStatus( error.response.status )
        }
        const isTimeout = error.message.includes( 'timeout' )
        ElMessage( {
          message : isTimeout ? 'Network Request Timeout' : error.message || 'Fail to connect to the server',
          type : 'error',
          duration : 2 * 1000
        } )
        return Promise.reject( new Error( error.message ) )
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
