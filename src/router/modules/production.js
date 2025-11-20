import Layout from '@/layout/index.vue'

const PRODUCTION_PROXY_URL = 'https://dev.fpsmonitoring.com:8043/data/perspective/client/MES_Production/proxy'

const productionRoutes = {
  path : '/production',
  name : 'Production',
  component : Layout,
  redirect : '/production/view',
  meta : {
    title : 'Production',
    icon : 'folder',
    affix : false
  },
  children : [
    {
      path : 'view',
      name : 'ProductionView',
      component : () => import( '@/views/shared/ProductionIframeView.vue' ),
      meta : {
        title : 'Production',
        icon : 'dashboard',
        iframeUrl : PRODUCTION_PROXY_URL,
        hidden : false,
        noCache : false
      }
    }
  ]
}

export default productionRoutes