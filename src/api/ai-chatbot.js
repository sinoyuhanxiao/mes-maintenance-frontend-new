// src/api/ai-chatbot.js
import axios from 'axios'

export const DEFAULT_JOB_NUMBER = 'rms_71112'

const client = axios.create( {
  baseURL : 'http://3.135.193.170:5000',
  headers : { 'Content-Type' : 'application/json' },
  withCredentials : false,
  transformRequest : [data => JSON.stringify( data )],
  validateStatus : s => s >= 200 && s < 300,
  timeout : 60000
} )

export async function askAIChatbot( question, jobNumber = DEFAULT_JOB_NUMBER ) {
  if ( !question || typeof question !== 'string' ) {
    throw new Error( 'askAIChatbot: "question" must be a non-empty string' )
  }
  const job = String( jobNumber || DEFAULT_JOB_NUMBER ).trim()
  if ( !job ) throw new Error( 'askAIChatbot: "job_number" is required' )

  const today = new Date()
  const baseId = today.toISOString().slice( 0, 10 ).replace( /-/g, '' )
  const rand = Math.random().toString( 36 ).slice( 2, 8 )
  const session_id = `${baseId}-${rand}`

  const payload = {
    question : question.trim(),
    job_number : job,
    // Optional belt-and-suspenders if backend expects camelCase:
    // jobNumber: job,
    session_id,
    time_zone : 'America/Los_Angeles'
  }

  try {
    const res = await client.post( '/api/query', payload )
    const data = res?.data ?? {}

    // Handle server-declared errors (your backend uses 'status' + 'message')
    if ( data?.error || ( typeof data?.status === 'number' && data.status !== 0 ) ) {
      const msg = data?.message || data?.error_message || data?.response || 'Server error'
      const err = new Error( msg )
      // attach status so UI can branch if needed
      err.code = data?.status ?? res?.status
      throw err
    }

    // Lift nested response so legacy UI reading data.response still works
    if ( data.response == null && data?.data?.response != null ) {
      data.response = data.data.response
    }

    return data
  } catch ( e ) {
    // Surface Axios HTTP errors with server message if present
    if ( axios.isAxiosError( e ) ) {
      const body = e.response?.data
      const msg = body?.message || body?.error_message || body?.response || e.message || 'Network error'
      const err = new Error( msg )
      err.code = e.response?.status || e.code || 'NETWORK'
      err.detail = body || null
      throw err
    }
    throw e
  }
}
