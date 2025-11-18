import {
  createRouter,
  // createWebHistory,
  createWebHashHistory
} from 'vue-router'

import Layout from '@/layout/index.vue'
// import nested from './modules/nested'
// import taskLibraryRoutes from './modules/taskLibrary'
import qcRoutes from './modules/qc'
import productionRoutes from './modules/production'

const isAllowAll = import.meta.env.VITE_ALL_PERMISSION === 'true'

// 配置路由信息
export const constantRoutes = [
  {
    path : '/callback',
    name : 'Callback',
    component : () => import( '@/views/callback/index.vue' ),
    meta : { requiresAuth : false, hidden : true }
  },
  {
    path : '/logout-success',
    name : 'LogoutSuccess',
    component : () => import( '@/views/logout/index.vue' ),
    meta : { requiresAuth : false, hidden : true }
  },
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
  /* {
    path : '/login',
    name : 'Login',
    component : () => import( '@/views/login/index.vue' ),
    meta : {
      hidden : true,
      title : 'router.login'
    }
  }, */
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
    redirect : '/dashboard',
    meta : {
      hidden : true
    }
  },
  {
    path : '/e2e-overview',
    name : 'E2EOverview',
    component : Layout,
    children : [
      {
        path : '',
        component : () => import( '@/views/e2eOverview/index.vue' ),
        meta : {
          title : 'Overview',
          icon : 'production-line-white',
          noCache : true,
          affix : false
        }
      }
    ]
  },
  {
    path : '/dashboard',
    name : 'Dashboard',
    component : Layout,
    children : [
      {
        path : '',
        component : () => import( '@/views/dashboard/index.vue' ),
        meta : {
          title : 'router.dashboard',
          icon : 'dashboard',
          noCache : true,
          affix : true,
          hidden : true
        }
      }
    ]
  },
  {
    path : '/maintenance',
    name : 'Maintenance',
    component : Layout,
    redirect : '/maintenance/equipment',
    meta : {
      title : 'Maintenance',
      icon : 'setting',
      alwaysShow : true
    },
    children : [
      {
        path : 'equipment',
        name : 'Equipment',
        component : () => import( '@/views/equipment/index.vue' ),
        meta : {
          title : 'router.maintenanceEquipment',
          icon : 'setting',
          noCache : true
        }
      },
      {
        path : 'work-orders',
        name : 'WorkOrdersMenu',
        redirect : 'work-orders/table',
        meta : { title : 'router.workOrderCenter', icon : 'table', noCache : true },
        children : [
          {
            path : 'table',
            component : () => import( '@/views/workOrder/index.vue' ),
            name : 'WorkOrderManagement',
            meta : { title : 'router.workOrderManagement', noCache : false }
          },
          {
            path : 'dashboard',
            component : () => import( '@/views/workOrder/components/WorkOrderDashboard.vue' ),
            name : 'WorkOrderDashboard',
            meta : { title : 'router.workOrderDashboard', noCache : true, hidden : true }
          },
          {
            path : 'new',
            component : () => import( '@/views/workOrder/components/CreateWorkOrder.vue' ),
            name : 'CreateWorkOrder',
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
            path : 'edit/:id',
            component : () => import( '@/views/workOrder/components/EditWorkOrder.vue' ),
            name : 'EditWorkOrder',
            props : true,
            meta : { title : 'router.editWorkOrder', noCache : true, hidden : true }
          }
        ]
      },
      {
        path : 'task-library',
        name : 'TaskLibraryMenu',
        redirect : 'task-library/tasks',
        meta : {
          title : 'Task Library',
          icon : 'setting',
          alwaysShow : true
        },
        children : [
          {
            path : 'tasks',
            name : 'TaskLibrary',
            component : () => import( '@/views/taskLibrary/views/TemplateLibraryView.vue' ),
            meta : {
              title : 'Tasks',
              hidden : false,
              noCache : false
            }
          },
          {
            path : 'standards',
            name : 'StandardLibrary',
            component : () => import( '@/views/taskLibrary/views/StandardsLibraryView.vue' ),
            meta : {
              title : 'Standards',
              hidden : false,
              noCache : false
            }
          },
          {
            path : 'designer',
            name : 'TaskDesigner',
            component : () => import( '@/views/taskLibrary/views/TaskDesignerCreateView.vue' ),
            meta : {
              title : 'Designer',
              hidden : false,
              noCache : false
            }
          },
          {
            path : 'designer/:id',
            name : 'TaskDesignerEdit',
            component : () => import( '@/views/taskLibrary/views/TaskDesignerEditView.vue' ),
            meta : {
              title : 'Edit Task',
              hidden : true,
              noCache : false
            }
          }
        ]
      },
      {
        path : 'requests',
        name : 'MaintenanceRequests',
        component : () => import( '@/views/maintenanceRequests/index.vue' ),
        meta : {
          title : 'router.request',
          icon : 'message',
          noCache : false
        }
      },
      {
        path : 'resources',
        name : 'ResourcesMenu',
        redirect : 'resources/spare-parts',
        meta : { title : 'Resources', icon : 'cpu', noCache : true, alwaysShow : true },
        children : [
          {
            path : 'spare-parts',
            component : () => import( '@/views/resources/index.vue' ),
            name : 'SpareParts',
            meta : { title : 'Spare Parts', noCache : false }
          },
          {
            path : 'tools',
            component : () => import( '@/views/resources/components/tools/index.vue' ),
            name : 'Tools',
            meta : { title : 'Tools', noCache : true }
          }
        ]
      },
      {
        path : 'vendors-locations',
        name : 'VendorsLocationsMain',
        component : () => import( '@/views/vendorsAndLocations/index.vue' ),
        meta : {
          title : 'router.vendorsAndLocations',
          icon : 'map'
        }
      }
    ]
  },
  // {
  //   path : '/icon',
  //   name : 'Icon',
  //   component : Layout,
  //   meta : {
  //     title : 'router.icons'
  //   },
  //   children : [
  //     {
  //       path : 'index',
  //       component : () => import( '@/views/icons/index.vue' ),
  //       name : 'Icons',
  //       meta : { title : 'router.icons', icon : 'image', noCache : true }
  //     }
  //   ]
  // },

  // {
  //   path : '/directive',
  //   name : 'Directive',
  //   component : Layout,
  //   meta : {
  //     title : 'router.directive'
  //   },
  //   children : [
  //     {
  //       path : 'index',
  //       component : () => import( '@/views/directive/index.vue' ),
  //       name : 'Index',
  //       meta : { title : 'router.directive', icon : 'directive', noCache : true }
  //     }
  //   ]
  // },
  // nested,
  // Production Routes
  productionRoutes,
  // QC Routes
  qcRoutes,
  // Administration Routes
  {
    path : '/administration',
    name : 'Administration',
    component : Layout,
    redirect : '/administration/user-management',
    meta : { title : 'router.administration', icon : 'users', noCache : true },
    children : [
      {
        path : 'user-management',
        component : () => import( '@/views/user/index.vue' ),
        name : 'UserManagement',
        meta : { title : 'router.user', icon : 'users', noCache : false }
      },
      {
        path : 'work-group-management',
        component : () => import( '@/views/team/index.vue' ),
        name : 'WorkGroupManagement',
        meta : { title : 'router.team', icon : 'users', noCache : false }
      },
      {
        path : 'shift-management',
        component : () => import( '@/views/shift/index.vue' ),
        name : 'ShiftManagement',
        meta : { title : 'router.shift', icon : 'users', noCache : true }
      },
      {
        path : 'role-management',
        component : () => import( '@/views/rolesAndPermissions/index.vue' ),
        name : 'RoleManagement',
        meta : { title : 'Role', icon : 'users', noCache : true }
      },
      {
        path : 'approval-management',
        component : () => import( '@/views/approval/index.vue' ),
        name : 'ApprovalManagement',
        meta : { title : 'router.approval', icon : 'users', noCache : true }
      },
      {
        path : 'my-account',
        component : () => import( '@/views/userCenter/index.vue' ),
        name : 'MyAccount',
        meta : { title : 'router.myAccount', icon : 'users', noCache : true, hidden : true }
      },
      {
        path : 'user-detail/:id',
        component : () => import( '@/views/user/components/UserDetail.vue' ),
        name : 'UserDetail',
        meta : { title : 'router.userDetail', icon : 'users', noCache : true, hidden : true }
      }
      // {
      //   path : 'team-detail/:id',
      //   component : () => import( '@/views/team/components/TeamDetail.vue' ),
      //   name : 'TeamDetail',
      //   meta : { title : 'Group Detail', icon : 'users', noCache : true, hidden : true }
      // }
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

// Allow-All pre-register all; RBAC only register constant
const baseRoutes = isAllowAll ? constantRoutes.concat( asyncRoutes ) : constantRoutes

const router = createRouter( {
  history : createWebHashHistory( './' ),
  routes : baseRoutes,
  scrollBehavior : () => ( { left : 0, top : 0 } )
} )

export function resetRouter() {
  if ( isAllowAll ) return
  const WHITE_NAME_LIST = ['Callback', 'LogoutSuccess', 'Error404', 'Error401', 'Error500', 'Redirect', 'RedirectPath']
  router.getRoutes().forEach( route => {
    const { name } = route
    if ( name && !WHITE_NAME_LIST.includes( name ) ) {
      router.hasRoute( name ) && router.removeRoute( name )
    }
  } )
}

export default router
