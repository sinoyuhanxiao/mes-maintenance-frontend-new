export const WX_APPID = 'appid'
export const COOKIE_PREFIX = 'vite_'
export const TOKEN = `${COOKIE_PREFIX}_token`
export const AVATAR = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'

export const GLOBAL_DATA = {
  env: 'fat',
  // dev : {
  //   baseUrl : '/api'
  // },
  fat: {
    baseUrl: '/api',
  },
  uat: {
    baseUrl: '/api',
  },
  pro: {
    baseUrl: '/api',
  },
}

export const WHITE_CODE_LIST = [
  {
    status: 200,
    msg: '',
  },
  {
    status: 201, // Created
    msg: '',
  },
  {
    status: 202, // Accepted
    msg: '',
  },
  {
    status: 203, // Non-Authoritative Information
    msg: '',
  },
  {
    status: 204, // No Content
    msg: '',
  },
  {
    status: 205, // Reset Content
    msg: '',
  },
  {
    status: 206, // Partial Content
    msg: '',
  },
  {
    status: 207, // Multi-Status
    msg: '',
  },
  {
    status: 208, // Already Reported
    msg: '',
  },
  {
    status: 226, // IM Used
    msg: '',
  },
  {
    status: 5006,
    msg: 'Captcha error or expired',
  },
]

export const LOGIN_ERROR_CODE = [
  {
    status: 401,
    msg: 'unauthorized token access',
  },
  {
    status: 403,
    msg: 'visit rejected',
  },
  {
    status: 422,
    msg: 'login info invalid',
  },
]
