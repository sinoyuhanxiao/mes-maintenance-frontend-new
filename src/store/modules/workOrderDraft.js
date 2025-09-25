import { defineStore } from 'pinia'
import { createEmptyWorkOrderForm, cloneWorkOrderForm } from '@/components/WorkOrder/TodoView/workOrderFormDefaults'
import { buildDisplayTaskFromTemplate } from '@/components/WorkOrder/TodoView/taskPayloadHelpers'

const clone = data => JSON.parse( JSON.stringify( data ) )

export const useWorkOrderDraftStore = defineStore( 'workOrderDraft', {
  state : () => ( {
    draftForm : null,
    returnRoute : null,
    shouldOpenCreatePanel : false
  } ),

  getters : {
    hasDraft : state => !!state.draftForm
  },

  actions : {
    ensureDraft() {
      if ( !this.draftForm ) {
        this.draftForm = createEmptyWorkOrderForm()
      }
      return this.draftForm
    },

    saveDraft( form ) {
      this.draftForm = cloneWorkOrderForm( form )
    },

    clearDraft() {
      this.draftForm = null
    },

    setReturnRoute( route ) {
      this.returnRoute = route
    },

    clearReturnRoute() {
      this.returnRoute = null
    },

    setShouldOpenCreatePanel( flag ) {
      this.shouldOpenCreatePanel = flag
    },

    appendTask( task ) {
      const draft = this.ensureDraft()
      if ( !Array.isArray( draft.tasks ) ) {
        draft.tasks = []
      }
      const safeTask = clone( task )
      safeTask.source = safeTask.source || ( safeTask.templateId || safeTask.template_id ? 'template' : 'adhoc' )
      if ( safeTask.category && typeof safeTask.category === 'object' ) {
        safeTask.category_name = safeTask.category_name || safeTask.category.name || safeTask.category.label
      }
      draft.tasks.push( safeTask )
      draft.task_list = draft.tasks
        .map( item => clone( item.payload || {} ) )
        .filter( payload => Object.keys( payload ).length > 0 )
    },

    updateTasksWithTemplate( template ) {
      if ( !template ) return

      const draft = this.ensureDraft()
      if ( !Array.isArray( draft.tasks ) ) {
        draft.tasks = []
      }

      const templateId = template.template_id || template.id || template._id
      if ( !templateId ) return

      draft.tasks = draft.tasks.map( task => {
        if ( task.source === 'template' && ( task.templateId === templateId || task.template_id === templateId ) ) {
          const refreshedTask = buildDisplayTaskFromTemplate( template )
          return {
            ...task,
            ...refreshedTask,
            id : task.id,
            payload : {
              ...( task.payload || {} ),
              ...refreshedTask.payload
            },
            category_name : refreshedTask.category?.name || refreshedTask.category_name || task.category_name
          }
        }
        return task
      } )

      draft.task_list = draft.tasks
        .map( item => clone( item.payload || {} ) )
        .filter( payload => Object.keys( payload ).length > 0 )
    },

    updateTask( taskId, updatedTaskData ) {
      if ( !taskId || !updatedTaskData ) return

      const draft = this.ensureDraft()
      if ( !Array.isArray( draft.tasks ) ) {
        draft.tasks = []
      }

      draft.tasks = draft.tasks.map( task => {
        if ( task.id === taskId ) {
          const updatedTask = {
            ...task,
            ...updatedTaskData,
            id : taskId // Preserve the original ID
          }

          // Handle payload - either update existing or use new payload from updatedTaskData
          if ( updatedTaskData.payload ) {
            // If updatedTaskData provides a complete payload, use it
            updatedTask.payload = updatedTaskData.payload
          } else if ( task.payload ) {
            // Otherwise, update existing payload
            updatedTask.payload = {
              ...task.payload,
              name : updatedTaskData.name || task.payload.name,
              description : updatedTaskData.description || task.payload.description,
              estimated_minutes : updatedTaskData.estimated_minutes || task.payload.estimated_minutes,
              time_estimate_sec : ( updatedTaskData.estimated_minutes || task.payload.estimated_minutes || 30 ) * 60,
              equipment_node_id : updatedTaskData.equipment_node_id || task.payload.equipment_node_id,
              steps : updatedTaskData.steps || task.payload.steps
            }
          }

          return updatedTask
        }
        return task
      } )

      // Update task_list as well
      draft.task_list = draft.tasks
        .map( item => clone( item.payload || {} ) )
        .filter( payload => Object.keys( payload ).length > 0 )
    }
  }
} )
