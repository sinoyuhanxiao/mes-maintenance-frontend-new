
// http://mockjs.com/examples.html#Object
const loginInfo = () => {
  const result = {
    token: 'token'
  }
  return result
}

const userInfo = () => {
  const result = {
    id: 9527,
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Erik Yu',
    phone: '15988888888',
    email: '454539387@qq.com',
    identity: '',
    roles: ['admin'],
  }
  return result
}

const list = () => {
  const result = []
  const total = 10 // Generate 10 entries

  for (let i = 1; i <= total; i++) {
    const item = {
      id: i,
      method: i % 4,
      deviceType: ['web', 'glass', 'mobile', 'desktop', 'others'][Math.floor(Math.random() * 5)],
      deviceOs: ['win10', 'win11', 'ios', 'android', 'others'][Math.floor(Math.random() * 5)],
      loginAddr: '加拿大 BC',
      loginTime: generateRandomDate() // Generate random date before today in 2025
    }
    result.push(item)
  }

  return result
}

function generateRandomDate() {
  const today = new Date()
  const start = new Date('2025-01-01')
  const end = new Date(today.getFullYear() === 2025 ? today : '2025-12-31')

  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(randomTime).toISOString().split('T')[0] // Format as YYYY-MM-DD
}

export default [
  {
    url: '/api/login',
    type: 'get',
    response: config => {
      // const { username } = config.body
      // const token = tokens[username]
      // if (!token) {
      //   return {
      //     code: 60204,
      //     message: '账号密码错误'
      //   }
      // }
      return {
        code: 200,
        message: 'success',
        data: {
          token: 'token'
        }
        // data: loginInfo()
      }
    }
  },

  {
    url: '/api/getUserInfo',
    type: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: userInfo()
      }
    }
  },

  {
    url: '/api/test',
    type: 'get',
    response: () => {
      return {
        code: 5004,
        message: 'fail',
        data: []
      }
    }
  },

  {
    url: "/api/logout",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: 'success'
      }
    },
  },

  {
    url: '/api/login/history',
    type: 'get',
    response: config => {
      return {
        code: 200,
        message: 'success',
        data: list()
      }
    }
  },
]
