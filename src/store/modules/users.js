import { defineStore } from 'pinia'
import cookies from '@/utils/cookies'
import { TOKEN, AVATAR } from '@/config/constant'
import { resetRouter } from '@/router'
import useTagsViewStore from './tagsView'

const useUserStore = defineStore({
  id: 'users',
  state: () => {
    return {
      token: cookies.get(TOKEN),
      uid: '9527',
      avatar: AVATAR,
      name: '灰是小灰灰的灰',
      phone: '15988888888',
      email: '454539387@qq.com',
      identity: '',
      roles: [],
    }
  },
  actions: {
    SET_TOKEN(token = '') {
      token ? cookies.set(TOKEN, token) : cookies.remove(TOKEN)
      this.token = token
    },
    async GET_USER_INFO() {
      try {
        // Hardcoded user info instead of API call
        const hardcodedUserInfo = {
          id: '9527',
          name: 'Admin User',
          avatar: AVATAR,
          roles: ['admin'],
          phone: '15988888888',
          email: 'admin@example.com',
          identity: 'administrator',
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
          uid: this.uid,
          roles: this.roles,
        }
      } catch (error) {
        // Fallback to default values
        this.uid = '9527'
        this.name = 'Admin User'
        this.phone = '15988888888'
        this.email = 'admin@example.com'
        this.identity = 'administrator'
        this.avatar = AVATAR
        this.roles = ['admin']

        return {
          uid: this.uid,
          name: this.name,
          roles: this.roles,
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
      } catch (error) {
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
      return new Promise(resolve => {
        const tagsViewStore = useTagsViewStore()
        cookies.clearAll()
        resetRouter()
        tagsViewStore.DEL_ALL_VIEWS(null)
        resolve()
      })
    },
  },
})
export default useUserStore
