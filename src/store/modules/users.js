import { defineStore } from 'pinia'
import { logout, getCurrentUser } from '@/api/user'
import { resetRouter } from '@/router'
import useTagsViewStore from './tagsView'
// import DefaultAvatar from '@/assets/imgs/avatar.png?url'

const TOKEN_KEYS = ['access_token', 'refresh_token', 'id_token']
// const DEFAULT_AVATAR = DefaultAvatar

function clearTokens() {
  TOKEN_KEYS.forEach( key => localStorage.removeItem( key ) )
}

function extractPermissionsFromRoles( roles = [] ) {
  const permissionSet = new Set()
  roles.forEach( role => {
    role.permissions?.forEach( p => permissionSet.add( p.name ) )
  } )
  return Array.from( permissionSet )
}

const useUserStore = defineStore( {
  id : 'users',
  state : () => ( {
    uid : '',
    username : '',
    firstName : '',
    lastName : '',
    avatar : '',
    phone : '',
    email : '',
    title : '',
    department_list : null,
    isVerified : false,
    enabled : true,
    role_list : [],
    permissions : []
  } ),

  actions : {
    async GET_USER_INFO() {
      const { data : user } = await getCurrentUser()
      console.log( '[Pinia User] getCurrentUser:', user )

      this.uid = user.id || ''
      this.username = user.username || ''
      this.firstName = user.first_name || ''
      this.lastName = user.last_name || ''
      this.avatar =
        user.image ||
        'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent( user?.first_name + ' ' + user?.last_name )
      this.phone = user.phone_number || ''
      this.email = user.email || ''
      this.title = user.title || ''
      this.department_list = user.department_list ?? null
      this.isVerified = user.is_verified ?? false
      this.enabled = user.enabled ?? true
      this.role_list = user.role_list || []
      this.permissions = extractPermissionsFromRoles( this.roles )

      console.log( '[GET_USER_INFO] roles 已设置：', this.roles )

      return {
        uid : this.uid,
        roles : this.roles,
        permissions : this.permissions
      }
    },

    // Cold start: If there is no user information yet, attempt to fetch it once (for use after a refresh)
    async HYDRATE_IF_NEEDED() {
      // Existing data no longer requested
      if ( this.uid ) return { hydrate : false }
      try {
        await this.GET_USER_INFO()
        return { hydrate : true }
      } catch ( e ) {
        return { hydrated : false, error : e }
      }
    },

    async LOGIN_OUT() {
      try {
        await logout()
      } catch ( error ) {
        console.warn( 'Logout failed or skipped:', error )
      } finally {
        await this.RESET_INFO()
      }
    },

    async RESET_INFO() {
      return new Promise( resolve => {
        const tagsViewStore = useTagsViewStore()
        this.$reset()
        resetRouter()
        tagsViewStore.DEL_ALL_VIEWS()
        clearTokens()
        resolve()
      } )
    }
  },

  // Persisting User Information
  persist : {
    key : 'app:user',
    storage : sessionStorage,
    paths : [
      'uid',
      'username',
      'firstName',
      'lastName',
      'avatar',
      'phone',
      'email',
      'title',
      'departmentId',
      'isVerified',
      'enabled',
      'roles',
      'permissions'
    ]
  }
} )

/*
const useUserStore = defineStore( {
  id : 'users',
  state : () => {
    return {
      token : cookies.get( TOKEN ),
      uid : '9527',
      avatar : AVATAR,
      name : '灰是小灰灰的灰',
      phone : '15988888888',
      email : '454539387@qq.com',
      identity : '',
      roles : []
    }
  },
  actions : {
    SET_TOKEN( token = '' ) {
      token ? cookies.set( TOKEN, token ) : cookies.remove( TOKEN )
      this.token = token
    },
    async GET_USER_INFO() {
      try {
        // Hardcoded user info instead of API call
        const hardcodedUserInfo = {
          id : '9527',
          name : 'Admin User',
          avatar : AVATAR,
          roles : ['admin'],
          phone : '15988888888',
          email : 'admin@example.com',
          identity : 'administrator'
        }

        const { id, name, avatar, roles, phone, email, identity } = hardcodedUserInfo
        this.uid = id || '9527'
        this.name = name || 'Admin User'
        this.phone = phone || '15988888888'
        this.email = email || 'admin@example.com'
        this.identity = identity || 'administrator'
        this.avatar = avatar || AVATAR
        this.roles = roles || ['admin']

        return {
          ...hardcodedUserInfo,
          uid : this.uid,
          roles : this.roles
        }
      } catch ( error ) {
        // Fallback to default values
        this.uid = '9527'
        this.name = 'Admin User'
        this.phone = '15988888888'
        this.email = 'admin@example.com'
        this.identity = 'administrator'
        this.avatar = AVATAR
        this.roles = ['admin']

        return {
          uid : this.uid,
          name : this.name,
          roles : this.roles
        }
      }
    },
    async LOGIN_OUT() {
      try {
        // Hardcoded logout - always successful
        this.token = ''
        this.name = ''
        this.avatar = ''
        this.phone = ''
        this.email = ''
        this.identity = ''
        this.roles = []
        this.RESET_INFO()
      } catch ( error ) {
        // Even if there's an error, clear the local state
        this.token = ''
        this.name = ''
        this.avatar = ''
        this.phone = ''
        this.email = ''
        this.identity = ''
        this.roles = []
        this.RESET_INFO()
      }
    },
    // 清空所有登录信息
    RESET_INFO() {
      return new Promise( resolve => {
        const tagsViewStore = useTagsViewStore()
        cookies.clearAll()
        resetRouter()
        tagsViewStore.DEL_ALL_VIEWS( null )
        resolve()
      } )
    }
  }
} ) */
export default useUserStore
