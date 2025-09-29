import router from './router'
import { WHITE_LIST } from '@/config/constant'
import getPageTitle from '@/utils/getPageTitle'
import { gotoCognitoLogin } from '@/utils/cognito/cognito'
import { usePermissionStore, useUserStore } from '@/store'
import NProgress from '@/utils/progress'

const ACCESS_TOKEN_KEY = 'access_token'
const isAllowAll = import.meta.env.VITE_ALL_PERMISSION === 'true'

// Only the RBAC mode is used to avoid the repetitive operation of addRoute
let routesInjected = false

router.beforeEach( async( to, from, next ) => {
  NProgress.start()
  document.title = getPageTitle( to.meta?.title )
  // Whitelist Direct Access
  if ( WHITE_LIST.includes( to.path ) || to.matched.some( r => r.meta?.requiresAuth === false ) ) {
    next()
    return
  }

  const token = localStorage.getItem( ACCESS_TOKEN_KEY )
  if ( !token ) {
    gotoCognitoLogin()
    return
  }

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // Cold start: When there is a token but the user has not been registered in Pinia, make a request to /user/me
  if ( !userStore.uid ) {
    try {
      await userStore.GET_USER_INFO()
    } catch ( e ) {
      try {
        await userStore.RESET_INFO()
      } finally {
        gotoCognitoLogin()
      }
      return
    }
  }

  if ( isAllowAll ) {
    // Development phase: All routes have been statically registered. Here, we only ensure that Pinia is populated once.
    if ( !permissionStore.routes.length ) {
      permissionStore.SET_ROUTES( [] )
    }
    next()
    return
  }

  // RBAC: When entering for the first time, filter based on roles and dynamically inject.
  if ( !routesInjected ) {
    try {
      // Fetch it from the backend: const { roles } = await useUserStore().GET_USER_INFO()
      const roles = []
      const accessRoutes = permissionStore.SET_ROUTES( roles )
      accessRoutes.forEach( r => router.addRoute( r ) )
      routesInjected = true
      next( { ...to, replace : true } )
      return
    } catch ( error ) {
      console.error( '[permission] RBAC init failed:', error )
      try {
        await userStore.RESET_INFO()
      } finally {
        gotoCognitoLogin()
      }
      return
    }
  }
  next()
} )

router.afterEach( () => {
  NProgress.done()
} )
