import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  searchStandards,
  getStandard,
  createStandard as createStandardApi,
  updateStandard as updateStandardApi,
  deleteStandard as deleteStandardApi
} from '@/api/task-library'

export function useStandards() {
  // Reactive state
  const loading = ref( false )
  const standards = ref( [] )
  const currentstandard = ref( null )
  const filters = ref( {
    search : '',
    category : '',
    module : ''
  } )
  const pagination = ref( {
    currentPage : 1,
    pageSize : 20,
    total : 0,
    totalPages : 0
  } )

  // Standard operations - server-side filtering, pagination, and sorting
  const loadstandards = async( params = {} ) => {
    loading.value = true
    try {
      const filter = {}
      if ( filters.value.search ) filter.keyword = filters.value.search
      if ( filters.value.category ) filter.category = filters.value.category

      const paginationParams = {
        page : pagination.value.currentPage,
        size : pagination.value.pageSize
      }

      const { data } = await searchStandards( { ...filter, ...params }, paginationParams )
      const { content = [], totalElements = 0, totalPages = 0 } = data

      standards.value = content
      pagination.value.total = totalElements
      pagination.value.totalPages = totalPages
    } catch ( error ) {
      ElMessage.error( 'Failed to load standards' )
      console.error( 'Failed to load standards:', error )
    } finally {
      loading.value = false
    }
  }

  const loadstandard = async id => {
    try {
      const response = await getStandard( id )
      const standard = response.data
      currentstandard.value = standard
      ElMessage.success( 'Standard loaded successfully' )
      return standard
    } catch ( error ) {
      ElMessage.error( 'Failed to load standard' )
      console.error( 'Failed to load standard:', error )
      throw error
    }
  }

  const createStandard = async standardData => {
    try {
      const response = await createStandardApi( standardData )
      const newstandard = response.data
      standards.value.push( newstandard )
      return newstandard
    } catch ( error ) {
      ElMessage.error( 'Failed to create standard' )
      console.error( 'Failed to create standard:', error )
      throw error
    }
  }

  const updateStandard = async( id, standardData ) => {
    try {
      const response = await updateStandardApi( id, standardData )
      const updatedstandard = response.data

      // Update in local array
      const index = standards.value.findIndex( sm => getStandardId( sm ) === id )
      if ( index !== -1 ) {
        standards.value[index] = updatedstandard
      }

      // Update current standard if it's the one being updated
      if ( currentstandard.value && getStandardId( currentstandard.value ) === id ) {
        currentstandard.value = updatedstandard
      }

      ElMessage.success( 'Standard updated successfully' )
      return updatedstandard
    } catch ( error ) {
      ElMessage.error( 'Failed to update standard' )
      console.error( 'Failed to update standard:', error )
      throw error
    }
  }

  const deleteStandard = async id => {
    try {
      await deleteStandardApi( id )

      // Remove from local array
      const index = standards.value.findIndex( sm => getStandardId( sm ) === id )
      if ( index !== -1 ) {
        standards.value.splice( index, 1 )
      }

      // Clear current standard if it's the one being deleted
      if ( currentstandard.value && getStandardId( currentstandard.value ) === id ) {
        currentstandard.value = null
      }

      ElMessage.success( 'Standard deleted successfully' )
    } catch ( error ) {
      ElMessage.error( 'Failed to delete standard' )
      console.error( 'Failed to delete standard:', error )
      throw error
    }
  }

  // Filter and search operations - now triggers server-side reload
  const setFilter = ( key, value ) => {
    filters.value[key] = value
    // Reset to first page when filtering
    pagination.value.currentPage = 1
    // Trigger reload with new filters
    loadstandards()
  }

  const clearFilters = () => {
    filters.value = {
      search : '',
      category : '',
      module : ''
    }
    // Reset to first page and reload
    pagination.value.currentPage = 1
    loadstandards()
  }

  const setPage = page => {
    pagination.value.currentPage = page
    // Reload data with new page
    loadstandards()
  }

  const setPageSize = size => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
    // Reload data with new page size
    loadstandards()
  }

  // Safety measure selection
  const selectstandard = standard => {
    currentstandard.value = standard
  }

  const clearSelection = () => {
    currentstandard.value = null
  }

  // Utility functions
  const getStandardId = standard => {
    return standard.id || standard._id
  }

  const getStandardById = id => {
    return standards.value.find( sm => getStandardId( sm ) === id )
  }

  const getStandardsByCategory = category => {
    return standards.value.filter( sm => sm.category === category )
  }

  const getStandardsByModule = module => {
    return standards.value.filter( sm => sm.module === module )
  }

  // Safety measure validation
  const validatestandard = standard => {
    const errors = []

    if ( !standard.name || standard.name.trim().length === 0 ) {
      errors.push( 'Standard name is required' )
    }

    if ( !standard.description || standard.description.trim().length === 0 ) {
      errors.push( 'Description is required' )
    }

    if ( !standard.items || standard.items.length === 0 ) {
      errors.push( 'Standard must have at least one item' )
    }

    // Validate each item
    if ( standard.items ) {
      standard.items.forEach( ( item, index ) => {
        if ( !item || item.trim().length === 0 ) {
          errors.push( `Rule ${index + 1} cannot be empty` )
        }
      } )
    }

    return errors
  }

  const isstandardValid = standard => {
    return validatestandard( standard ).length === 0
  }

  return {
    // State
    loading,
    standards,
    currentstandard,
    filters,
    pagination,

    // Operations
    loadstandards,
    loadstandard,
    createStandard,
    updateStandard,
    deleteStandard,

    // Filtering
    setFilter,
    clearFilters,
    setPage,
    setPageSize,

    // Selection
    selectstandard,
    clearSelection,

    // Utilities
    getStandardId,
    getStandardById,
    getStandardsByCategory,
    getStandardsByModule,
    validatestandard,
    isstandardValid
  }
}
