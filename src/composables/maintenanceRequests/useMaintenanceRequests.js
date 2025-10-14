import { ref, reactive } from 'vue'
import {
  searchMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  deleteMaintenanceRequest
} from '@/api/maintenance-requests'

export function useMaintenanceRequests() {
  // State
  const loading = ref( false )
  const requestDetailLoading = ref( false )
  const requests = ref( [] )
  const currentRequest = ref( null )

  // Pagination state
  const pagination = reactive( {
    page : 1,
    size : 20,
    total : 0,
    totalPages : 0
  } )

  // Filters state
  const filters = reactive( {
    keyword : '',
    equipment_node_id : [],
    status : null
  } )

  // Sort state
  const sort = reactive( {
    sortField : 'createdAt',
    direction : 'DESC'
  } )

  // Load requests with pagination and filters
  const loadRequests = async() => {
    loading.value = true
    try {
      const response = await searchMaintenanceRequests(
        pagination.page,
        pagination.size,
        sort.sortField,
        sort.direction,
        {
          keyword : filters.keyword,
          equipment_node_id : filters.equipment_node_id,
          status : filters.status
        }
      )

      const data = response.data?.data || response.data
      // Filter out null values from content array
      requests.value = ( data.content || [] ).filter( item => item !== null )
      pagination.total = data.totalElements || 0
      pagination.totalPages = data.totalPages || 0
    } catch ( error ) {
      console.error( 'Failed to load requests:', error )
      requests.value = []
    } finally {
      loading.value = false
    }
  }

  // Load single request details
  const loadRequest = async id => {
    requestDetailLoading.value = true
    try {
      const response = await getMaintenanceRequestById( id )
      currentRequest.value = response.data?.data || response.data
    } catch ( error ) {
      console.error( 'Failed to load request details:', error )
      currentRequest.value = null
    } finally {
      requestDetailLoading.value = false
    }
  }

  // Create new request
  const createRequest = async data => {
    const response = await createMaintenanceRequest( data )
    await loadRequests()
    return response.data?.data || response.data
  }

  // Update existing request
  const updateRequest = async( id, data ) => {
    const response = await updateMaintenanceRequest( id, data )
    await loadRequest( id ) // Reload details to get updated data
    await loadRequests() // Reload list to reflect changes
    return response.data?.data || response.data
  }

  // Approve request
  const approveRequest = async id => {
    const response = await approveMaintenanceRequest( id )
    await loadRequest( id ) // Reload details to get updated status
    return response.data?.data || response.data
  }

  // Reject request
  const rejectRequest = async id => {
    const response = await rejectMaintenanceRequest( id )
    await loadRequest( id )
    return response.data?.data || response.data
  }

  // Delete request
  const deleteRequest = async id => {
    await deleteMaintenanceRequest( id )
    await loadRequests()
  }

  // Filter management
  const setFilter = ( key, value ) => {
    filters[key] = value
    pagination.page = 1 // Reset to first page when filter changes
    loadRequests()
  }

  const clearFilters = () => {
    filters.keyword = ''
    filters.equipment_node_id = []
    filters.status = null
    pagination.page = 1
    loadRequests()
  }

  // Pagination management
  const setPage = page => {
    pagination.page = page
    loadRequests()
  }

  const setPageSize = size => {
    pagination.size = size
    pagination.page = 1
    loadRequests()
  }

  return {
    loading,
    requestDetailLoading,
    requests,
    currentRequest,
    pagination,
    filters,
    sort,
    loadRequests,
    loadRequest,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    setFilter,
    clearFilters,
    setPage,
    setPageSize
  }
}
