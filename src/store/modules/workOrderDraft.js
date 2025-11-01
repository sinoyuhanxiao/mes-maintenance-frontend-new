import { defineStore } from 'pinia'
import { createEmptyWorkOrderForm, cloneWorkOrderForm } from '@/components/WorkOrder/TodoView/workOrderFormDefaults'
import { buildDisplayTaskFromTemplate } from '@/components/WorkOrder/TodoView/taskPayloadHelpers'

const clone = data => JSON.parse(JSON.stringify(data))

export const useWorkOrderDraftStore = defineStore('workOrderDraft', {
  state: () => ({
    draftForm: null,
    returnRoute: null,
    returnPanel: null,
    returnWorkOrderId: null,
    shouldOpenCreatePanel: false,
    // Enhanced context management
    currentContext: null, // 'create' | 'edit' | null
    editModeOriginalData: null, // Store original work order data when in edit mode
    // Edit mode task tracking
    originalTasks: null, // Store original tasks for change detection
    originalStandards: null, // Store original standards for change detection
    pendingStandaloneTask: null,
  }),

  getters: {
    hasDraft: state => !!state.draftForm,
    isEditMode: state => state.currentContext === 'edit',
    isCreateMode: state => state.currentContext === 'create',
    hasValidContext: state => state.currentContext === 'edit' || state.currentContext === 'create',
  },

  actions: {
    ensureDraft() {
      if (!this.draftForm) {
        this.draftForm = createEmptyWorkOrderForm()
      }
      return this.draftForm
    },

    saveDraft(form) {
      // Context-aware draft saving
      if (this.currentContext === 'edit') {
        // In edit mode, preserve the original work order structure
        // Only save task-related changes to prevent form pollution
        const draft = this.draftForm || cloneWorkOrderForm(form)
        draft.tasks = cloneWorkOrderForm(form).tasks
        draft.standards = cloneWorkOrderForm(form).standards
        this.draftForm = draft
      } else {
        // In create mode or no context, save the entire form
        this.draftForm = cloneWorkOrderForm(form)
      }
    },

    saveContextAwareDraft(form, context) {
      this.currentContext = context
      this.saveDraft(form)
    },

    clearDraft() {
      this.draftForm = null
    },

    clearDraftAndContext() {
      this.draftForm = null
      this.clearContext()
    },

    setReturnRoute(route) {
      this.returnRoute = route
    },

    clearReturnRoute() {
      this.returnRoute = null
    },

    setReturnPanel(panel) {
      this.returnPanel = panel || null
    },

    clearReturnPanel() {
      this.returnPanel = null
    },

    setReturnWorkOrderId(workOrderId) {
      this.returnWorkOrderId = workOrderId ?? null
    },

    clearReturnWorkOrderId() {
      this.returnWorkOrderId = null
    },

    clearReturnContext() {
      this.returnRoute = null
      this.returnPanel = null
      this.returnWorkOrderId = null
      this.shouldOpenCreatePanel = false
    },

    // Enhanced context management methods
    setContext(context) {
      this.currentContext = context
    },

    setEditModeData(originalWorkOrder) {
      this.currentContext = 'edit'
      this.editModeOriginalData = clone(originalWorkOrder)
      // Store original tasks and standards for change detection
      this.originalTasks = clone(originalWorkOrder.tasks || [])
      this.originalStandards = clone(originalWorkOrder.standards || [])
    },

    setCreateMode() {
      this.currentContext = 'create'
      this.editModeOriginalData = null
      this.originalTasks = null
      this.originalStandards = null
    },

    clearContext() {
      this.currentContext = null
      this.editModeOriginalData = null
      this.originalTasks = null
      this.originalStandards = null
      this.pendingStandaloneTask = null
    },

    setShouldOpenCreatePanel(flag) {
      this.shouldOpenCreatePanel = flag
    },

    setPendingStandaloneTask(task) {
      this.pendingStandaloneTask = task ? clone(task) : null
    },

    consumePendingStandaloneTask() {
      const task = this.pendingStandaloneTask ? clone(this.pendingStandaloneTask) : null
      this.pendingStandaloneTask = null
      return task
    },

    appendTask(task) {
      const draft = this.ensureDraft()
      if (!Array.isArray(draft.tasks)) {
        draft.tasks = []
      }
      const safeTask = clone(task)
      safeTask.source = safeTask.source || (safeTask.templateId || safeTask.template_id ? 'template' : 'adhoc')
      if (safeTask.category && typeof safeTask.category === 'object') {
        safeTask.category_name = safeTask.category_name || safeTask.category.name || safeTask.category.label
      }

      // Context-aware task appending
      if (this.currentContext === 'edit') {
        // In edit mode, ensure task gets a unique ID to avoid conflicts with existing tasks
        safeTask.id = safeTask.id || `new-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      draft.tasks.push(safeTask)

      // Context-aware task list synchronization
      if (this.currentContext === 'create') {
        // For create mode, maintain task_list for POST payload
        draft.task_list = draft.tasks
          .map(item => clone(item.payload || {}))
          .filter(payload => Object.keys(payload).length > 0)
      }
      // For edit mode, we don't sync to task_list since PATCH uses separate add/update/delete lists
    },

    updateTasksWithTemplate(template) {
      if (!template) return

      const draft = this.ensureDraft()
      if (!Array.isArray(draft.tasks)) {
        draft.tasks = []
      }

      const templateId = template.template_id || template.id || template._id
      if (!templateId) return

      draft.tasks = draft.tasks.map(task => {
        if (task.source === 'template' && (task.templateId === templateId || task.template_id === templateId)) {
          // CRITICAL: Preserve original steps BEFORE template update for change tracking
          // When user edits a template and returns to work order, calculateTaskChanges()
          // needs to compare original steps (before edit) vs current steps (after edit)
          const originalSteps = clone(task.steps || task.payload?.steps || [])

          const refreshedTask = buildDisplayTaskFromTemplate(template)
          return {
            ...task,
            ...refreshedTask,
            id: task.id,
            // Store original steps for change comparison in WorkOrderEdit.vue
            __originalSteps: originalSteps,
            payload: {
              ...(task.payload || {}),
              ...refreshedTask.payload,
              // Also preserve in payload for fallback access
              __originalSteps: originalSteps,
            },
            category_name: refreshedTask.category?.name || refreshedTask.category_name || task.category_name,
          }
        }
        return task
      })

      // Context-aware task list synchronization
      if (this.currentContext === 'create') {
        // For create mode, maintain task_list for POST payload
        draft.task_list = draft.tasks
          .map(item => clone(item.payload || {}))
          .filter(payload => Object.keys(payload).length > 0)
      }
      // For edit mode, we don't sync to task_list since PATCH uses separate add/update/delete lists
    },

    updateTask(taskId, updatedTaskData) {
      if (!taskId || !updatedTaskData) return

      const draft = this.ensureDraft()
      if (!Array.isArray(draft.tasks)) {
        draft.tasks = []
      }

      const normalizedTaskId = String(taskId)

      draft.tasks = draft.tasks.map(task => {
        const candidateId = task.id != null ? String(task.id) : null
        if (candidateId === normalizedTaskId) {
          const updatedTask = {
            ...task,
            ...updatedTaskData,
            id: normalizedTaskId, // Preserve the original ID as string
            task_id: normalizedTaskId,
          }

          // Handle payload - either update existing or use new payload from updatedTaskData
          if (updatedTaskData.payload) {
            // If updatedTaskData provides a complete payload, use it
            updatedTask.payload = {
              ...updatedTaskData.payload,
              id: normalizedTaskId,
              task_id: normalizedTaskId,
            }
          } else if (task.payload) {
            // Otherwise, update existing payload
            updatedTask.payload = {
              ...task.payload,
              name: updatedTaskData.name || task.payload.name,
              description: updatedTaskData.description || task.payload.description,
              estimated_minutes: updatedTaskData.estimated_minutes || task.payload.estimated_minutes,
              time_estimate_sec: (updatedTaskData.estimated_minutes || task.payload.estimated_minutes || 30) * 60,
              equipment_node_id: updatedTaskData.equipment_node_id || task.payload.equipment_node_id,
              steps: updatedTaskData.steps || task.payload.steps,
              id: normalizedTaskId,
              task_id: normalizedTaskId,
            }
          }

          return updatedTask
        }
        return task
      })

      // Context-aware task list synchronization
      if (this.currentContext === 'create') {
        // For create mode, maintain task_list for POST payload
        draft.task_list = draft.tasks
          .map(item => clone(item.payload || {}))
          .filter(payload => Object.keys(payload).length > 0)
      }
      // For edit mode, we don't sync to task_list since PATCH uses separate add/update/delete lists
    },

    // Standard management methods
    appendStandard(standard) {
      const draft = this.ensureDraft()
      if (!Array.isArray(draft.standards)) {
        draft.standards = []
      }
      const safeStandard = clone(standard)

      // Context-aware standard appending
      if (this.currentContext === 'edit') {
        // In edit mode, ensure standard gets a unique ID to avoid conflicts with existing standards
        safeStandard.id = safeStandard.id || `new-standard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      draft.standards.push(safeStandard)

      // Context-aware standard list synchronization
      if (this.currentContext === 'create') {
        // For create mode, maintain standard_list for POST payload
        draft.standard_list = draft.standards
          .map(item => clone(item.payload || item))
          .filter(payload => Object.keys(payload).length > 0)
      }
      // For edit mode, we don't sync to standard_list since PATCH uses separate add/update/delete lists
    },

    updateStandard(standardId, updatedStandardData) {
      if (!standardId || !updatedStandardData) return

      const draft = this.ensureDraft()
      if (!Array.isArray(draft.standards)) {
        draft.standards = []
      }

      draft.standards = draft.standards.map(standard => {
        if (standard.id === standardId) {
          const updatedStandard = {
            ...standard,
            ...updatedStandardData,
            id: standardId, // Preserve the original ID
          }

          // Handle payload - either update existing or use new payload from updatedStandardData
          if (updatedStandardData.payload) {
            // If updatedStandardData provides a complete payload, use it
            updatedStandard.payload = updatedStandardData.payload
          } else if (standard.payload) {
            // Otherwise, update existing payload
            updatedStandard.payload = {
              ...standard.payload,
              ...updatedStandardData,
            }
          }

          return updatedStandard
        }
        return standard
      })

      // Context-aware standard list synchronization
      if (this.currentContext === 'create') {
        // For create mode, maintain standard_list for POST payload
        draft.standard_list = draft.standards
          .map(item => clone(item.payload || item))
          .filter(payload => Object.keys(payload).length > 0)
      }
      // For edit mode, we don't sync to standard_list since PATCH uses separate add/update/delete lists
    },
  },
})
