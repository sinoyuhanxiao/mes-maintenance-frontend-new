import {
  createRouter,
  // createWebHistory,
  createWebHashHistory
} from 'vue-router'

import Layout from '@/layout/index.vue'
import nested from './modules/nested'

// 配置路由信息
export const constantRoutes = [
  {
    path : '/redirect',
    name : 'Redirect',
    component : Layout,
    meta : { title : 'Redirect', hidden : true },
    children : [
      {
        path : '/redirect/:path(.*)',
        name : 'RedirectPath',
        component : () => import( '@/views/redirect/index.vue' ),
        meta : { title : 'Redirect', hidden : true }
      }
    ]
  },
  {
    path : '/login',
    name : 'Login',
    component : () => import( '@/views/login/index.vue' ),
    meta : {
      hidden : true,
      title : 'router.login'
    }
  },
  {
    path : '/404',
    name : 'Error404',
    component : () => import( '@/views/error/404.vue' ),
    meta : {
      hidden : true,
      title : '404'
    }
  },
  {
    path : '/401',
    name : 'Error401',
    component : () => import( '@/views/error/401.vue' ),
    meta : {
      hidden : true,
      title : '401'
    }
  },
  {
    path : '/500',
    name : 'Error500',
    component : () => import( '@/views/error/500.vue' ),
    meta : {
      hidden : true,
      title : '500'
    }
  }
]

export const asyncRoutes = [
  {
    path : '/',
    name : 'DashboardLayout',
    component : Layout,
    redirect : '/dashboard',
    meta : {
      title : 'router.dashboard'
    },
    children : [
      {
        path : 'dashboard',
        name : 'Dashboard',
        component : () => import( '@/views/dashboard/index.vue' ),
        meta : {
          title : 'router.dashboard',
          icon : 'dashboard',
          noCache : true,
          affix : true
        }
      }
    ]
  },
  {
    path : '/icon',
    name : 'Icon',
    component : Layout,
    meta : {
      title : 'router.icons'
    },
    children : [
      {
        path : 'index',
        component : () => import( '@/views/icons/index.vue' ),
        name : 'Icons',
        meta : { title : 'router.icons', icon : 'image', noCache : true }
      }
    ]
  },

  {
    path : '/directive',
    name : 'Directive',
    component : Layout,
    meta : {
      title : 'router.directive'
    },
    children : [
      {
        path : 'index',
        component : () => import( '@/views/directive/index.vue' ),
        name : 'Index',
        meta : { title : 'router.directive', icon : 'directive', noCache : true }
      }
    ]
  },
  nested,
  {
    path : '/maintenance',
    name : 'Equipment',
    component : Layout,
    meta : { title : 'router.maintenanceEquipment', icon : 'table', noCache : true },
    children : [
      {
        path : 'equipment',
        component : () => import( '@/views/maintenanceEquipment/index.vue' ),
        name : 'Maintenance Test',
        meta : { title : 'router.maintenanceEquipment', noCache : true }
      }
    ]
  },
  {
    path : '/work-order',
    name : 'Table',
    component : Layout,
    redirect : '/work-order/table',
    meta : { title : 'router.workOrderCenter', icon : 'table', noCache : true },
    children : [
      {
        path : 'table',
        component : () => import( '@/views/workOrder/index.vue' ),
        name : 'WorkOrderTable',
        meta : { title : 'router.workOrderManagement', noCache : true }
      },
      {
        path : 'new',
        component : () => import( '@/views/workOrder/components/NewWorkOrder.vue' ),
        name : 'NewWorkOrder',
        meta : { title : 'router.newWorkOrder', noCache : true, hidden : true }
      },
      {
        path : 'view/:id',
        component : () => import( '@/views/workOrder/components/ViewWorkOrder.vue' ),
        name : 'ViewWorkOrder',
        props : true,
        meta : { title : 'router.viewWorkOrder', noCache : true, hidden : true }
      },
      {
        path : 'test-view',
        component : () => import( '@/views/workOrder/test_view.vue' ),
        name : 'TestView',
        props : true,
        meta : { title : 'router.viewWorkOrder', noCache : true, hidden : false }
      },
      {
        path : 'filter-drawer-test',
        component : () => import( '@/views/test/FilterDrawerTest.vue' ),
        name : 'FilterDrawerTest',
        meta : { title : 'Filter Drawer Test', noCache : true, hidden : false }
      }
    ]
  },
  {
    path : '/user',
    name : 'User',
    component : Layout,
    redirect : '/user/index',
    meta : { title : 'router.userCenter', icon : 'about', noCache : true },
    children : [
      {
        path : 'index',
        component : () => import( '@/views/userCenter/index.vue' ),
        name : 'UserCenter',
        meta : { title : 'router.myAccount', noCache : true }
      }
    ]
  },

  {
    path : '/:pathMatch(.*)',
    redirect : '/404',
    name : 'Redirect404',
    meta : {
      title : '404',
      hidden : true
    }
  }
]

const router = createRouter( {
  history : createWebHashHistory( './' ),
  routes : constantRoutes.concat( asyncRoutes ),
  scrollBehavior : () => ( { left : 0, top : 0 } )
} )

export function resetRouter() {
  const WHITE_NAME_LIST = ['Login']
  router.getRoutes().forEach( route => {
    const { name } = route
    if ( name && !WHITE_NAME_LIST.includes( name ) ) {
      router.hasRoute( name ) && router.removeRoute( name )
    }
  } )
}

export default router
