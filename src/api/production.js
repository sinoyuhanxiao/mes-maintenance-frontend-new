import axios from 'axios'

/**
 * Update current view in Ignition Production system
 * This uses direct axios call (not the http wrapper) to avoid sending Authorization header
 * which causes CORS issues with Ignition
 * @param {string} value - The Ignition view path to switch to
 * @returns {Promise<{newValue: string, success: boolean}>}
 */
export const updateCurrentView = value => {
  return axios( {
    method : 'post',
    url : 'https://dev.fpsmonitoring.com:8043/system/webdev/MES_Production/DemoApi/updateCurrentView',
    data : JSON.stringify( { value } ),
    headers : {
      'Content-Type' : 'text/plain',
      Accept : 'application/json, text/plain, */*'
    }
  } )
}