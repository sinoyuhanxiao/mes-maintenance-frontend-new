import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes } from '@/router'

const isAllowAll = import.meta.env.VITE_ALL_PERMISSION === 'true'

/**
 * Use meta.roles to determine whether the route has permission.
 * @param {Array} userRoleNames
 * @param {Object} route
 */
function hasPermission( userRoleNames, route ) {
  if ( isAllowAll ) return true
  if ( route.meta && route.meta.roles ) {
    return userRoleNames.some( r => route.meta.roles.includes( r ) )
  }
  return true
}

/**
 * Recursive Filtering asyncRoutes
 * @param {Array} routes
 * @param {Array} userRoleNames
 */
export function filterAsyncRoutes( routes, userRoleNames ) {
  const res = []
  routes.forEach( route => {
    const tmp = { ...route }
    if ( hasPermission( userRoleNames, tmp ) ) {
      if ( tmp.children ) {
        tmp.children = filterAsyncRoutes( tmp.children, userRoleNames )
      }
      res.push( tmp )
    }
  } )
  return res
}

const usePermissionStore = defineStore( {
  id : 'permission',
  state : () => ( {
    routes : [],
    addRoutes : [],
    directivePermission : []
  } ),
  actions : {
    /**
     * roles: The roles returned by the backend (array, supports ['ADMIN'] or [{name:'ADMIN'}])
     */
    SET_ROUTES( roles = [] ) {
      let accessedRoutes
      if ( isAllowAll ) {
        accessedRoutes = asyncRoutes
      } else {
        const roleNames = roles.map( r => ( typeof r === 'string' ? r : r?.name ) ).filter( Boolean )
        if ( roleNames.includes( 'ADMIN' ) || roleNames.includes( 'admin' ) ) {
          accessedRoutes = asyncRoutes
        } else {
          accessedRoutes = filterAsyncRoutes( asyncRoutes, roleNames )
        }
      }
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat( accessedRoutes )
      return accessedRoutes
    },

    /**
     * Set custom command permission (if the command v-permission is used)
     */
    SET_DIRECTIVE_PERMISSION() {
      this.directivePermission = ['*']
    }
  }
} )

/*
/!**
 * 使用meta.role来确定当前用户是否有权限
 * @param roles
 * @param route
 *!/
function hasPermission( roles, route ) {
  if ( route.meta && route.meta.roles ) {
    return roles.some( role => route.meta.roles.includes( role ) )
  } else {
    return true
  }
}

/!**
 * 通过递归过滤异步路由表
 * @param routes asyncRoutes
 * @param roles
 *!/
export function filterAsyncRoutes( routes, roles ) {
  const res = []

  routes.forEach( route => {
    const tmp = { ...route }
    if ( hasPermission( roles, tmp ) ) {
      if ( tmp.children ) {
        tmp.children = filterAsyncRoutes( tmp.children, roles )
      }
      res.push( tmp )
    }
  } )

  return res
}

const usePermissionStore = defineStore( {
  id : 'permission',
  state : () => {
    return {
      routes : [],
      addRoutes : [],
      directivePermission : []
    }
  },
  actions : {
    SET_ROUTES( roles ) {
      return new Promise( resolve => {
        let accessedRoutes
        if ( roles.includes( 'admin' ) ) {
          accessedRoutes = asyncRoutes || []
        } else {
          accessedRoutes = filterAsyncRoutes( asyncRoutes, roles )
        }
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat( accessedRoutes )
        resolve( accessedRoutes )
      } )
    },
    SET_DIRECTIVE_ROLE( roles ) {
      this.directivePermission = roles
    }
  }
} ) */

export default usePermissionStore
