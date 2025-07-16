import Layout from '@/layout/index.vue'

export default {
  path : '/nested',
  name : 'Nested',
  component : Layout,
  redirect : '/nested/menu1/menu1-1',
  meta : {
    title : 'router.nested',
    icon : 'nested',
    noCache : false,
    roles : ['admin']
  },
  children : [
    {
      path : 'menu1',
      name : 'Menu1',
      component : () => import( '@/views/nested/menu1/index.vue' ),
      meta : {
        title : 'router.menu1',
        noCache : false
      },
      redirect : '/nested/menu1/menu1-1',
      children : [
        {
          path : 'menu1-1',
          component : () => import( '@/views/nested/menu1/menu1-1/index.vue' ),
          name : 'Menu1-1',
          meta : {
            title : 'router.menu11',
            noCache : false
          }
        },
        {
          path : 'menu1-2',
          name : 'Menu1-2',
          redirect : '/nested/menu1/menu1-2/menu1-2-1',
          component : () => import( '@/views/nested/menu1/menu1-2/index.vue' ),
          meta : {
            title : 'router.menu12',
            noCache : false
          },
          children : [
            {
              path : 'menu1-2-1',
              component : () => import( '@/views/nested/menu1/menu1-2/menu1-2-1/index.vue' ),
              name : 'Menu1-2-1',
              meta : {
                title : 'router.menu121',
                noCache : false
              }
            },
            {
              path : 'menu1-2-2',
              component : () => import( '@/views/nested/menu1/menu1-2/menu1-2-2/index.vue' ),
              name : 'Menu1-2-2',
              meta : {
                title : 'router.menu122',
                noCache : false
              }
            }
          ]
        },
        {
          path : 'menu1-3',
          component : () => import( '@/views/nested/menu1/menu1-3/index.vue' ),
          name : 'Menu1-3',
          meta : {
            title : 'router.menu13',
            noCache : false
          }
        }
      ]
    },
    {
      path : 'menu2',
      name : 'Menu2',
      component : () => import( '@/views/nested/menu2/index.vue' ),
      meta : {
        title : 'router.menu2',
        noCache : false,
        // icon : 'devices',
        roles : ['admin']
      }
    }
  ]
}
