import { authApi } from './api'

export const refresh = () => {
  return authApi.post( '/auth/refresh' )
}

export const callback = ( code ) => {
  return authApi.get( '/auth/callback', { prarams : { code }} )
}

export const getCurrentUser = () => {
  return authApi.get( '/user/me' )
}

export const logout = () => {
  return authApi.post( '/auth/logout' )
}
