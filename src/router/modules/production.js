import Layout from '@/layout/index.vue'
// import { PRODUCTION_IFRAME_BASE_URL } from '@/utils/env'

const PRODUCTION_PROXY_URL = 'https://dev.fpsmonitoring.com:8043/data/perspective/client/MES_Production/proxy'

const productionRoutes = {
  path : '/production',
  name : 'Production',
  component : Layout,
  meta : {
    title : 'Production',
    icon : 'folder',
    affix : true
  },
  children : [
    {
      path : '',
      redirect : 'overview'
    },
    {
      path : 'overview',
      name : 'ProductionOverview',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Overview',
        icon : 'dashboard',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/Overview',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'library',
      name : 'ProductionLibrary',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Library',
        icon : 'folder',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/ProductionLibrary',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'resources',
      name : 'ProductionResources',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Resources',
        icon : 'cpu',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/ProductionResources',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'work-orders',
      name : 'ProductionWorkOrders',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Work Orders',
        icon : 'table',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/ProductionWorkOrders',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'schedule',
      name : 'ProductionSchedule',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Schedule',
        icon : 'table',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/Production Scheduling',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'tasks',
      name : 'ProductionTasks',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Tasks',
        icon : 'list',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/ProductionTasks',
        hidden : false,
        noCache : false
      }
    },
    {
      path : 'freezing',
      name : 'ProductionFreezing',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Freezing',
        icon : 'cpu',
        iframeUrl : PRODUCTION_PROXY_URL,
        ignitionViewPath : 'MESBaseVersion/Production Management/Page/RMS_Freezing',
        hidden : true,
        noCache : false
      }
    }
  ]
}

export default productionRoutes
