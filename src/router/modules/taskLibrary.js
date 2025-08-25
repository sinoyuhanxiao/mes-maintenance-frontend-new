import Layout from '@/layout/index.vue'

const taskLibraryRoutes = {
  path : '/maintenance-library',
  name : 'taskLibrary',
  component : Layout,
  meta : {
    title : 'Task Library',
    icon : 'setting',
    roles : ['admin', 'maintainer'] // Adjust roles as needed
  },
  children : [
    {
      path : '',
      redirect : 'tasks'
    },
    {
      path : 'tasks',
      name : 'TaskLibrary',
      component : () => import( '@/views/taskLibrary/views/TemplateLibraryView.vue' ),
      meta : {
        title : 'Task',
        hidden : false
      }
    },
    {
      path : 'designer',
      name : 'TaskDesigner',
      component : () => import( '@/views/taskLibrary/views/TemplateDesignerView.vue' ),
      meta : {
        title : 'Designer',
        hidden : false
      }
    },
    {
      path : 'designer/:id',
      name : 'TaskDesignerEdit',
      component : () => import( '@/views/taskLibrary/views/TemplateDesignerView.vue' ),
      meta : {
        title : 'Edit Task',
        hidden : true
      }
    }
  ]
}

export default taskLibraryRoutes
