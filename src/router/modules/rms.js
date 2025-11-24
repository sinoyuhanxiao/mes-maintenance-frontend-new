import Layout from '@/layout/index.vue'
import { PRODUCTION_IFRAME_BASE_URL } from '@/utils/env'

const rmsRoutes = {
  path : '/rms',
  name : 'RMS',
  component : Layout,
  meta : {
    title : 'RMS',
    icon : 'monitor',
    hidden : true
  },
  children : [
    // First Picture (FPS E2E Line) Equipment
    {
      path : 'freezing',
      name : 'RMSFreezing',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Freezing',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS-Freezer`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'drying',
      name : 'RMSDrying',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Drying',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS-Drying`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'frying',
      name : 'RMSFrying',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Frying',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS-Fryer`,
        hidden : true,
        noCache : false
      }
    },
    // Second Picture (Packaging Line) Equipment
    {
      path : 'palletizer',
      name : 'RMSPalletizer',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Palletizer',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_Palletizer`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'case-transport',
      name : 'RMSCaseTransport',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Case Transport',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_CaseTransport`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'case-handling',
      name : 'RMSCaseHandling',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Case Handling',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_CaseHandling`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'case-packing',
      name : 'RMSCasePacking',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Case Packing',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_CasePacking`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'bag-inspection',
      name : 'RMSBagInspection',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Bag Inspection',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_BagInspection`,
        hidden : true,
        noCache : false
      }
    },
    {
      path : 'bag-packaging',
      name : 'RMSBagPackaging',
      component : () => import( '@/views/shared/IframeView.vue' ),
      meta : {
        title : 'Bag Packaging',
        iframeUrl : `${PRODUCTION_IFRAME_BASE_URL}/RMS_BagPacking`,
        hidden : true,
        noCache : false
      }
    }
  ]
}

export default rmsRoutes
