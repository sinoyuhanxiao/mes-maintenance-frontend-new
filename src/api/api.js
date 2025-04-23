// src/api/api.js

import axios from 'axios'

// Base API URL from the .env file
const API_URL = import.meta.env.VITE_BACKEND_URL

const api = axios.create( {
  baseURL : API_URL
} )

api.interceptors.response.use(
  response => response,
  error => {
    console.error( 'API Error:', error )
    return Promise.reject( error )
  }
)

export default api
