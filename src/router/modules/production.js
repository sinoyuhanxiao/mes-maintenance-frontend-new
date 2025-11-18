import Layout from '@/layout/index.vue'
import { PRODUCTION_IFRAME_BASE_URL } from '@/utils/env'

const productionRoutes = {
  path : '/production',
  name : 'Production',
  component : Layout,
  meta : {
    title : 'Production',
    icon : 'folder'
  },
  children : [
    {
      path : '',
      redirect : 'overview'
    },
    {
      path : 'overview',
      name : 'ProductionOverview',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Overview',
        icon : 'dashboard',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_overview`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'library',
      name : 'ProductionLibrary',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Library',
        icon : 'folder',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_library`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'resources',
      name : 'ProductionResources',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Resources',
        icon : 'cpu',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_resources`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'work-orders',
      name : 'ProductionWorkOrders',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Work Orders',
        icon : 'table',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_work_orders`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'schedule',
      name : 'ProductionSchedule',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Schedule',
        icon : 'table',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_scheduling`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'tasks',
      name : 'ProductionTasks',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Tasks',
        icon : 'list',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/production_tasks/`,
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'freezing',
      name : 'ProductionFreezing',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Freezing',
        icon : 'cpu',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_Freezing`,
        hidden : false,
        noCache : false
      }
    }
  ]
}

export default productionRoutes
