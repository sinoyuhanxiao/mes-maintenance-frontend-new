import Layout from '@/layout/index.vue'
import { QC_IFRAME_BASE_URL } from '@/utils/env'

const qcRoutes = {
  path : '/qc',
  name : 'QC',
  component : Layout,
  meta : {
    title : 'Quality Control',
    icon : 'star'
  },
  children : [
    {
      path : '',
      redirect : 'quality-management'
    },
    {
      path : 'quality-management',
      name : 'QualityManagement',
      redirect : 'quality-management/form-tree',
      meta : {
        title : 'QC Management',
        icon : 'list',
        alwaysShow : true
      },
      children : [
        {
          path : 'form-tree',
          name : 'FormTree',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Form Tree',
            icon : 'tree',
            iframeUrl : `${QC_IFRAME_BASE_URL}/quality-form-management?embed=true`,
            hidden : false,
            noCache : false
          }
        },
        {
          path : 'form-designer',
          name : 'FormDesigner',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Form Designer',
            icon : 'edit',
            iframeUrl : `${QC_IFRAME_BASE_URL}/form-designer?embed=true`,
            hidden : false,
            noCache : false
          }
        }
      ]
    },
    {
      path : 'form-summary',
      name : 'FormSummary',
      redirect : 'form-summary/form-data-summary',
      meta : {
        title : 'Form Summary',
        icon : 'charts',
        alwaysShow : true
      },
      children : [
        {
          path : 'form-data-summary',
          name : 'FormDataSummary',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Form Data Summary',
            icon : 'table',
            iframeUrl : `${QC_IFRAME_BASE_URL}/form-data-summary?embed=true`,
            hidden : false,
            noCache : false
          }
        },
        {
          path : 'alarm-records',
          name : 'AlarmRecords',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Alarm Records',
            icon : 'message',
            iframeUrl : `${QC_IFRAME_BASE_URL}/alarm-records?embed=true`,
            hidden : false,
            noCache : false
          }
        },
        {
          path : 'qc-summary',
          name : 'QCSummary',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'QC Summary',
            icon : 'table',
            iframeUrl : `${QC_IFRAME_BASE_URL}/qc-summary?embed=true`,
            hidden : false,
            noCache : false
          }
        }
      ]
    },
    {
      path : 'my-task-center',
      name : 'MyTaskCenter',
      redirect : 'my-task-center/pending-tasks',
      meta : {
        title : 'My Task Center',
        icon : 'list',
        alwaysShow : true
      },
      children : [
        {
          path : 'pending-tasks',
          name : 'PendingTasks',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Pending Tasks',
            icon : 'list',
            iframeUrl : `${QC_IFRAME_BASE_URL}/pending-tasks?embed=true`,
            hidden : false,
            noCache : false
          }
        },
        {
          path : 'approval-center',
          name : 'ApprovalCenter',
          component : () => import( '@/views/shared/IframeView.vue' ),
          meta : {
            title : 'Approval Center',
            icon : 'approval-center',
            iframeUrl : `${QC_IFRAME_BASE_URL}/approval-info?embed=true`,
            hidden : false,
            noCache : false
          }
        }
      ]
    }
  ]
}

export default qcRoutes
