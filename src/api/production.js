import http from '@/utils/request'

/**
 * Update current view in Ignition Production system
 * @param {string} value - The Ignition view path to switch to
 * @returns {Promise<{newValue: string, success: boolean}>}
 */
export const updateCurrentView = value => {
  return http.request( {
    method : 'post',
    url : 'https://dev.fpsmonitoring.com:8043/system/webdev/MES_Production/DemoApi/updateCurrentView',
    data : JSON.stringify( { value } ),
    headers : {
      'Content-Type' : 'text/plain'
    }
  } )
}
