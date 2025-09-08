import { defineStore } from 'pinia'
import {
  searchTaskTemplates,
  getTaskTemplateById,
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  publishTemplate
} from '@/api/task-library'

export const useTaskLibraryStore = defineStore( 'taskLibrary', {
  state : () => ( {
    templates : [],
    currentTemplate : null,
    loading : false,
    templateDetailLoading : false,
    filters : {
      keyword : '',
      equipment_node_ids : [],
      category : '',
      search : '',
      asset : [],
      reference_id : ''
    },
    pagination : {
      page : 1,
      size : 20,
      total : 0,
      sortField : 'createdAt',
      direction : 'DESC'
    }
  } ),

  getters : {
    filteredTemplates : state => {
      // Since we're now doing server-side filtering via API,
      // we return all templates as they're already filtered
      // Ensure we always return an array
      return Array.isArray( state.templates ) ? state.templates : []
    },
    // Returns unique, non-empty template categories
    templateCategories : state => {
      if ( !Array.isArray( state.templates ) ) return []
      const categories = [...new Set( state.templates.map( t => t.category ) )]
      return categories.filter( Boolean )
    },
    // Returns templates with 'published' status
    publishedTemplates : state => {
      if ( !Array.isArray( state.templates ) ) return []
      return state.templates.filter( t => t.status === 'published' )
    },
    // Returns templates with 'draft' status
    draftTemplates : state => {
      if ( !Array.isArray( state.templates ) ) return []
      return state.templates.filter( t => t.status === 'draft' )
    }
  },

  actions : {
    async fetchTemplates( params = {} ) {
      this.loading = true
      try {
        // Build filter object for API - only include non-empty values
        const filter = {}

        // Add keyword if it has a value
        const keyword = this.filters.keyword || this.filters.search || ''
        if ( keyword.trim() ) {
          filter.keyword = keyword.trim()
        }

        // Add reference_id if it has a value
        const referenceId = this.filters.reference_id || ''
        if ( referenceId.trim() ) {
          filter.reference_id = referenceId.trim()
        }

        // Add equipment_node_ids if array has items
        const equipmentIds =
          this.filters.equipment_node_ids.length > 0 ? this.filters.equipment_node_ids : this.filters.asset || []
        if ( Array.isArray( equipmentIds ) && equipmentIds.length > 0 ) {
          filter.equipment_node_ids = equipmentIds
        }

        // Add reference_id if provided in params
        if ( params.reference_id ) {
          filter.reference_id = params.reference_id
        }

        // Add step_ids if provided in params
        if ( params.step_ids && Array.isArray( params.step_ids ) && params.step_ids.length > 0 ) {
          filter.step_ids = params.step_ids
        }

        const response = await searchTaskTemplates(
          this.pagination.page,
          this.pagination.size,
          this.pagination.sortField,
          this.pagination.direction,
          filter
        )

        // Handle API response structure
        if ( response.data && response.data.content ) {
          // New API format: response.data.content contains the templates array
          const content = response.data.content || []
          this.templates = Array.isArray( content ) ? content.map( this.transformApiTemplate ) : []
          this.pagination.total = response.data.totalElements || 0
        } else if ( response.data && response.data.data ) {
          // Alternative nested format: response.data.data.content
          const content = response.data.data.content || []
          this.templates = Array.isArray( content ) ? content.map( this.transformApiTemplate ) : []
          this.pagination.total = response.data.data.totalElements || 0
        } else {
          // Fallback to legacy format (already in correct format)
          const data = response.data || []
          this.templates = Array.isArray( data ) ? data : []
          this.pagination.total = response.total || ( Array.isArray( data ) ? data.length : 0 )
        }
      } catch ( error ) {
        console.error( 'Failed to fetch templates:', error )
        // Fallback to legacy API on error
        try {
          const fallbackResponse = await getTemplates( {
            ...params,
            page : this.pagination.page,
            limit : this.pagination.size
          } )
          const fallbackData = fallbackResponse.data || []
          this.templates = Array.isArray( fallbackData ) ? fallbackData : []
          this.pagination.total = fallbackResponse.total || ( Array.isArray( fallbackData ) ? fallbackData.length : 0 )
        } catch ( fallbackError ) {
          console.error( 'All APIs failed:', fallbackError )
          // Ensure templates is always an array even on complete failure
          this.templates = []
          this.pagination.total = 0
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    async fetchTemplate( id ) {
      this.templateDetailLoading = true
      try {
        const response = await getTaskTemplateById( id )
        // Handle API response structure
        if ( response.data && response.data.data ) {
          // API format: response.data.data contains the template object
          this.currentTemplate = response.data.data
          return response.data.data
        } else {
          // Fallback to legacy format: response.data contains the template directly
          this.currentTemplate = response.data
          return response.data
        }
      } catch ( error ) {
        console.error( 'Failed to fetch template:', error )
        // Fallback to legacy API on error
        try {
          const fallbackResponse = await getTemplate( id )
          this.currentTemplate = fallbackResponse.data
          return fallbackResponse.data
        } catch ( fallbackError ) {
          console.error( 'All APIs failed:', fallbackError )
          throw error
        }
      } finally {
        this.templateDetailLoading = false
      }
    },

    async createNewTemplate( templateData ) {
      this.loading = true
      try {
        // Use the new backend API for creating task templates
        const response = await createTaskTemplate( templateData )

        // Handle the response structure from the backend
        let createdTemplate
        if ( response.data?.data ) {
          createdTemplate = response.data.data
        } else {
          createdTemplate = response.data
        }

        // Transform the created template to match frontend expectations
        const transformedTemplate = this.transformApiTemplate( createdTemplate )

        // Add to templates list and set as current
        this.templates.unshift( transformedTemplate )
        this.currentTemplate = transformedTemplate

        return transformedTemplate
      } catch ( error ) {
        console.error( 'Failed to create template:', error )
        // Fallback to legacy API if the new one fails
        try {
          const fallbackResponse = await createTemplate( templateData )
          this.templates.unshift( fallbackResponse.data )
          this.currentTemplate = fallbackResponse.data
          return fallbackResponse.data
        } catch ( fallbackError ) {
          console.error( 'Fallback create API also failed:', fallbackError )
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    async updateCurrentTemplate( templateData ) {
      if ( !this.currentTemplate ) return

      this.loading = true
      try {
        const response = await updateTemplate( this.currentTemplate.template_id, templateData )

        // Update in templates list
        const index = this.templates.findIndex( t => t.template_id === this.currentTemplate.template_id )
        if ( index !== -1 ) {
          this.templates[index] = { ...this.templates[index], ...response.data }
        }

        // Update current template
        this.currentTemplate = { ...this.currentTemplate, ...response.data }

        return response.data
      } catch ( error ) {
        console.error( 'Failed to update template:', error )
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTemplateById( templateId, templateData ) {
      this.loading = true
      try {
        // Get the original template for comparison
        let originalTemplate = null
        if (
          this.currentTemplate &&
          ( this.currentTemplate.template_id === templateId || this.currentTemplate.id === templateId )
        ) {
          originalTemplate = this.currentTemplate
        } else {
          // Find in templates list
          const templateInList = this.templates.find( t => t.template_id === templateId || t.id === templateId )
          if ( templateInList ) {
            originalTemplate = templateInList
          } else {
            // Fetch it if not found
            try {
              originalTemplate = await this.fetchTemplate( templateId )
            } catch ( fetchError ) {
              console.warn( 'Failed to fetch original template:', fetchError )
            }
          }
        }

        // Use the real API for updating templates with original template for comparison
        const response = await updateTaskTemplate( templateId, templateData, originalTemplate )

        // Handle API response structure
        let updatedTemplate
        if ( response.data?.data ) {
          updatedTemplate = response.data.data
        } else {
          updatedTemplate = response.data
        }

        // Transform the updated template to match frontend expectations
        const transformedTemplate = this.transformApiTemplate( updatedTemplate )

        // Update in templates list
        const index = this.templates.findIndex( t => t.template_id === templateId || t.id === templateId )
        if ( index !== -1 ) {
          this.templates[index] = transformedTemplate
        }

        // Update current template if it matches
        if (
          this.currentTemplate &&
          ( this.currentTemplate.template_id === templateId || this.currentTemplate.id === templateId )
        ) {
          this.currentTemplate = transformedTemplate
        }

        return transformedTemplate
      } catch ( error ) {
        console.error( 'Failed to update template:', error )
        // Fallback to legacy API if the new one fails
        try {
          const fallbackResponse = await updateTemplate( templateId, templateData )
          return fallbackResponse.data
        } catch ( fallbackError ) {
          console.error( 'Fallback update API also failed:', fallbackError )
          throw error
        }
      } finally {
        this.loading = false
      }
    },

    async deleteTemplateById( id ) {
      this.loading = true
      try {
        await deleteTaskTemplate( id )

        // Remove from templates list
        this.templates = this.templates.filter( t => t.template_id !== id )

        // Clear current template if it was deleted
        if ( this.currentTemplate?.template_id === id ) {
          this.currentTemplate = null
        }
      } catch ( error ) {
        console.error( 'Failed to delete template:', error )
        throw error
      } finally {
        this.loading = false
      }
    },

    async publishTemplateById( id ) {
      this.loading = true
      try {
        const response = await publishTemplate( id )

        // Update status in templates list
        const index = this.templates.findIndex( t => t.template_id === id )
        if ( index !== -1 ) {
          this.templates[index].status = 'published'
        }

        // Update current template if it matches
        if ( this.currentTemplate?.template_id === id ) {
          this.currentTemplate.status = 'published'
        }

        return response.data
      } catch ( error ) {
        console.error( 'Failed to publish template:', error )
        throw error
      } finally {
        this.loading = false
      }
    },

    // Filter and pagination actions
    setFilter( key, value ) {
      this.filters[key] = value
      this.pagination.page = 1 // Reset to first page when filtering
      // Auto-refresh templates when filters change
      this.fetchTemplates()
    },

    clearFilters() {
      this.filters = {
        keyword : '',
        equipment_node_ids : [],
        category : '',
        search : '',
        asset : [],
        reference_id : ''
      }
      this.pagination.page = 1
      // Auto-refresh templates when filters are cleared
      this.fetchTemplates()
    },

    setPage( page ) {
      this.pagination.page = page
    },

    setPageSize( size ) {
      this.pagination.size = size
      this.pagination.page = 1
      // Auto-refresh templates when page size changes
      this.fetchTemplates()
    },

    // Current template management
    setCurrentTemplate( template ) {
      this.currentTemplate = template
    },

    clearCurrentTemplate() {
      this.currentTemplate = null
    },

    // Transform API response to match component expectations
    transformApiTemplate( apiTemplate ) {
      return {
        // Map API fields to component expectations
        template_id : apiTemplate.id || apiTemplate.template_id,
        id : apiTemplate.id || apiTemplate.template_id,
        name : apiTemplate.name,
        description : apiTemplate.description || '',
        // Keep category as object for detail view, but also provide transformed version for cards
        category : apiTemplate.category || 'Uncategorized',
        estimated_minutes : apiTemplate.time_estimate_sec ? Math.round( apiTemplate.time_estimate_sec / 60 ) : 0,
        time_estimate_sec : apiTemplate.time_estimate_sec,
        steps : apiTemplate.steps || [],
        // Keep numeric status for proper handling
        status : apiTemplate.status,
        created_at : apiTemplate.created_at,
        updated_at : apiTemplate.updated_at,
        created_by : apiTemplate.created_by,
        updated_by : apiTemplate.updated_by,
        equipment_node_id : apiTemplate.equipment_node_id,
        file_list : apiTemplate.file_list || [],
        reference_id : apiTemplate.reference_id,
        // Keep original API data for compatibility
        ...apiTemplate
      }
    }
  }
} )
