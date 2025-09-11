import { defineStore } from 'pinia'
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  publishTemplate
} from '@/api/task-library'

export const useTaskLibraryStore = defineStore( 'taskLibrary', {
  state : () => ( {
    templates : [],
    currentTemplate : null,
    loading : false,
    filters : {
      status : '',
      category : '',
      search : ''
    },
    pagination : {
      page : 1,
      limit : 20,
      total : 0
    }
  } ),

  getters : {
    filteredTemplates : state => {
      let filtered = [...state.templates]

      if ( state.filters.status ) {
        filtered = filtered.filter( t => t.status === state.filters.status )
      }

      if ( state.filters.category ) {
        filtered = filtered.filter( t => t.category === state.filters.category )
      }

      if ( state.filters.search ) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          t => t.name.toLowerCase().includes( search ) || t.description?.toLowerCase().includes( search )
        )
      }

      return filtered
    },
    // Returns unique, non-empty template categories
    templateCategories : state => {
      const categories = [...new Set( state.templates.map( t => t.category ) )]
      return categories.filter( Boolean )
    },
    // Returns templates with 'published' status
    publishedTemplates : state => {
      return state.templates.filter( t => t.status === 'published' )
    },
    // Returns templates with 'draft' status
    draftTemplates : state => {
      return state.templates.filter( t => t.status === 'draft' )
    }
  },

  actions : {
    async fetchTemplates( params = {} ) {
      this.loading = true
      try {
        const response = await getTemplates( {
          ...params,
          page : this.pagination.page,
          limit : this.pagination.limit
        } )

        this.templates = response.data
        this.pagination.total = response.total || response.data.length
      } catch ( error ) {
        console.error( 'Failed to fetch templates:', error )
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTemplate( id ) {
      this.loading = true
      try {
        const response = await getTemplate( id )
        this.currentTemplate = response.data
        return response.data
      } catch ( error ) {
        console.error( 'Failed to fetch template:', error )
        throw error
      } finally {
        this.loading = false
      }
    },

    async createNewTemplate( templateData ) {
      this.loading = true
      try {
        const response = await createTemplate( templateData )
        this.templates.unshift( response.data )
        this.currentTemplate = response.data
        return response.data
      } catch ( error ) {
        console.error( 'Failed to create template:', error )
        throw error
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

    async deleteTemplateById( id ) {
      this.loading = true
      try {
        await deleteTemplate( id )

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
    },

    clearFilters() {
      this.filters = {
        status : '',
        category : '',
        search : ''
      }
      this.pagination.page = 1
    },

    setPage( page ) {
      this.pagination.page = page
    },

    setPageSize( size ) {
      this.pagination.limit = size
      this.pagination.page = 1
    },

    // Current template management
    setCurrentTemplate( template ) {
      this.currentTemplate = template
    },

    clearCurrentTemplate() {
      this.currentTemplate = null
    }
  }
} )
