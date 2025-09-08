import { ref, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  getStandards,
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
    total : 0
  } )

  // Computed properties
  const filteredstandards = computed( () => {
    let filtered = [...standards.value]

    // Search filter
    if ( filters.value.search ) {
      const searchLower = filters.value.search.toLowerCase()
      filtered = filtered.filter(
        sm =>
          sm.name.toLowerCase().includes( searchLower ) ||
          sm.description?.toLowerCase().includes( searchLower ) ||
          sm.items?.some( item => item.toLowerCase().includes( searchLower ) )
      )
    }

    // Category filter
    if ( filters.value.category ) {
      filtered = filtered.filter( sm => sm.category === filters.value.category )
    }

    // Module filter
    if ( filters.value.module ) {
      filtered = filtered.filter( sm => sm.module === filters.value.module )
    }

    return filtered
  } )

  // standard operations
  const loadstandards = async( params = {} ) => {
    try {
      loading.value = true
      const response = await getStandards( params )
      standards.value = response.data || []
      pagination.value.total = response.total || 0
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
      ElMessage.success( 'Safety measure loaded successfully' )
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
      ElNotification( {
        title : 'Success',
        message : 'Safety measure created successfully',
        type : 'success'
      } )
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
      const index = standards.value.findIndex( sm => sm._id === id )
      if ( index !== -1 ) {
        standards.value[index] = updatedstandard
      }

      // Update current standard if it's the one being updated
      if ( currentstandard.value?._id === id ) {
        currentstandard.value = updatedstandard
      }

      ElMessage.success( 'Safety measure updated successfully' )
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
      const index = standards.value.findIndex( sm => sm._id === id )
      if ( index !== -1 ) {
        standards.value.splice( index, 1 )
      }

      // Clear current standard if it's the one being deleted
      if ( currentstandard.value?._id === id ) {
        currentstandard.value = null
      }

      ElNotification( {
        title : 'Success',
        message : 'Safety measure deleted successfully',
        type : 'success'
      } )
    } catch ( error ) {
      ElMessage.error( 'Failed to delete standard' )
      console.error( 'Failed to delete standard:', error )
      throw error
    }
  }

  // Filter and search operations
  const setFilter = ( key, value ) => {
    filters.value[key] = value
  }

  const clearFilters = () => {
    filters.value = {
      search : '',
      category : '',
      module : ''
    }
  }

  const setPage = page => {
    pagination.value.currentPage = page
  }

  const setPageSize = size => {
    pagination.value.pageSize = size
  }

  // Safety measure selection
  const selectstandard = standard => {
    currentstandard.value = standard
  }

  const clearSelection = () => {
    currentstandard.value = null
  }

  // Utility functions
  const getStandardById = id => {
    return standards.value.find( sm => sm._id === id )
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
      errors.push( 'Safety measure name is required' )
    }

    if ( !standard.description || standard.description.trim().length === 0 ) {
      errors.push( 'Description is required' )
    }

    if ( !standard.items || standard.items.length === 0 ) {
      errors.push( 'Safety measure must have at least one rule' )
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
    filteredstandards,
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
    getStandardById,
    getStandardsByCategory,
    getStandardsByModule,
    validatestandard,
    isstandardValid
  }
}
