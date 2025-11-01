import { computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useTaskLibraryStore } from '@/store/modules/taskLibrary'

export function useTaskLibrary() {
  const store = useTaskLibraryStore()

  // Reactive references
  const loading = computed(() => store.loading)
  const templateDetailLoading = computed(() => store.templateDetailLoading)
  const templates = computed(() => store.templates)
  const filteredTemplates = computed(() => store.filteredTemplates)
  const currentTemplate = computed(() => store.currentTemplate)
  const filters = computed(() => store.filters)
  const pagination = computed(() => store.pagination)

  // Template operations
  const loadTemplates = async (params = {}) => {
    try {
      await store.fetchTemplates(params)
    } catch (error) {
      ElMessage.error('Failed to load templates')
      console.error('Failed to load templates:', error)
    }
  }

  const loadTemplate = async id => {
    try {
      const template = await store.fetchTemplate(id)
      return template
    } catch (error) {
      ElMessage.error('Failed to load template')
      console.error('Failed to load template:', error)
      throw error
    }
  }

  const createTemplate = async templateData => {
    try {
      const newTemplate = await store.createNewTemplate(templateData)
      ElNotification({
        title: 'Success',
        message: 'Template created successfully',
        type: 'success',
      })
      return newTemplate
    } catch (error) {
      ElMessage.error('Failed to create template')
      console.error('Failed to create template:', error)
      throw error
    }
  }

  const updateTemplate = async (templateId, templateData) => {
    try {
      const updatedTemplate = await store.updateTemplateById(templateId, templateData)
      return updatedTemplate
    } catch (error) {
      ElMessage.error('Failed to update template')
      console.error('Failed to update template:', error)
      throw error
    }
  }

  const deleteTemplate = async id => {
    try {
      await store.deleteTemplateById(id)
      ElNotification({
        title: 'Success',
        message: 'Template deleted successfully',
        type: 'success',
      })
    } catch (error) {
      ElMessage.error('Failed to delete template')
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  const publishTemplate = async id => {
    try {
      await store.publishTemplateById(id)
      ElNotification({
        title: 'Success',
        message: 'Template published successfully',
        type: 'success',
      })
    } catch (error) {
      ElMessage.error('Failed to publish template')
      console.error('Failed to publish template:', error)
      throw error
    }
  }

  // Filter and search operations
  const setFilter = (key, value) => {
    store.setFilter(key, value)
  }

  const clearFilters = () => {
    store.clearFilters()
  }

  const setPage = page => {
    store.setPage(page)
  }

  const setPageSize = size => {
    store.setPageSize(size)
  }

  // Template selection
  const selectTemplate = template => {
    store.setCurrentTemplate(template)
  }

  const clearSelection = () => {
    store.clearCurrentTemplate()
  }

  // Utility functions
  const getTemplateById = id => {
    return templates.value.find(t => t.template_id === id)
  }

  const getTemplatesByStatus = status => {
    return templates.value.filter(t => t.status === status)
  }

  const getTemplatesByCategory = category => {
    return templates.value.filter(t => t.category === category)
  }

  // Template validation
  const validateTemplate = template => {
    const errors = []

    if (!template.name || (typeof template.name === 'string' && template.name.trim().length === 0)) {
      errors.push('Template name is required')
    }

    if (template.name && typeof template.name === 'string' && template.name.trim().length > 255) {
      errors.push('Template name must be 255 characters or less')
    }

    if (!template.category || (typeof template.category === 'string' && template.category.trim().length === 0)) {
      errors.push('Category is required')
    }

    if (!template.estimated_minutes || template.estimated_minutes <= 0) {
      errors.push('Estimated minutes must be greater than 0')
    }

    if (template.estimated_minutes > 480) {
      errors.push('Estimated minutes cannot exceed 480 (8 hours)')
    }

    if (!template.steps || template.steps.length === 0) {
      errors.push('Template must have at least one step')
    }

    // Validate individual steps
    if (template.steps && template.steps.length > 0) {
      template.steps.forEach((step, index) => {
        if (!step.label || (typeof step.label === 'string' && step.label.trim().length === 0)) {
          errors.push(`Step ${index + 1}: Name is required`)
        }

        if (step.type === 'service') {
          errors.push(`Step ${index + 1}: Service step type is currently not supported`)
        }

        const validFrontendStepTypes = ['inspection', 'checkbox', 'number', 'text', 'attachments']
        if (step.type && !validFrontendStepTypes.includes(step.type)) {
          errors.push(
            `Step ${index + 1}: Invalid step type '${step.type}'. Allowed types: ${validFrontendStepTypes.join(', ')}`
          )
        }
      })
    }

    if (template.description && typeof template.description === 'string' && template.description.length > 500) {
      errors.push('Description must be 500 characters or less')
    }

    return errors
  }

  const isTemplateValid = template => {
    return validateTemplate(template).length === 0
  }

  return {
    // State
    loading,
    templateDetailLoading,
    templates,
    filteredTemplates,
    currentTemplate,
    filters,
    pagination,

    // Operations
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,

    // Filtering
    setFilter,
    clearFilters,
    setPage,
    setPageSize,

    // Selection
    selectTemplate,
    clearSelection,

    // Utilities
    getTemplateById,
    getTemplatesByStatus,
    getTemplatesByCategory,
    validateTemplate,
    isTemplateValid,
  }
}
