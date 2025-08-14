/**
 * Work Order Management Composable
 * Provides centralized state management and business logic for work orders
 */
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getAllWorkOrders, getWorkOrdersByRecurrence } from '@/api/workorder'
import { useCommonDataStore } from '@/store/modules/commonData'

export function useWorkOrder() {
  const { t } = useI18n()
  const commonDataStore = useCommonDataStore()

  // State
  const loading = ref( false )
  const list = ref( [] )
  const total = ref( 0 )
  const expandedRows = ref( new Set() )

  // Query parameters
  const listQuery = reactive( {
    page : 1,
    limit : 20,
    importance : undefined,
    title : undefined,
    type : undefined,
    sort : '-id'
  } )

  // Computed properties
  const hasData = computed( () => list.value && list.value.length > 0 )
  const isEmpty = computed( () => !loading.value && !hasData.value )

  // Methods
  const fetchWorkOrders = async( additionalFilters = {} ) => {
    loading.value = true
    try {
      // Prepare filters for API call
      const filters = {
        ...additionalFilters
      }

      // Add filters from listQuery if they exist
      if ( listQuery.assignedTo ) filters.assignedTo = listQuery.assignedTo
      if ( listQuery.priority ) filters.priority = listQuery.priority
      if ( listQuery.workType ) filters.workType = listQuery.workType
      if ( listQuery.status ) filters.status = listQuery.status
      if ( listQuery.search ) filters.search = listQuery.search
      if ( listQuery.dueDate ) filters.dueDate = listQuery.dueDate
      if ( listQuery.customDateRange ) filters.customDateRange = listQuery.customDateRange

      const response = await getAllWorkOrders( listQuery.page, listQuery.limit, 'createdAt', 'DESC', filters )

      const data = response.data.content
      total.value = response.data.totalElements

      // Add children property for expandable rows
      list.value = data.map( item => {
        if ( item.recurrence_type?.id !== 1 ) {
          return { ...item, children : null, hasChildren : true }
        }
        return item
      } )
    } catch ( error ) {
      console.error( 'Failed to fetch work orders:', error )
      ElMessage.error( t( 'workOrder.messages.loadingFailed' ) )
    } finally {
      loading.value = false
    }
  }

  const loadChildren = async( row, treeNode, resolve ) => {
    try {
      const recurrenceId = row.recurrence_uuid
      if ( !recurrenceId ) return resolve( [] )

      const response = await getWorkOrdersByRecurrence( recurrenceId )
      let children = response.data.content

      // Avoid loading self as child
      children = children.filter( child => child.id !== row.id )

      row.children = children
      resolve(
        children.map( child => ( {
          ...child,
          hasChildren : false
        } ) )
      )
    } catch ( error ) {
      console.error( 'Error loading children:', error )
      resolve( [] )
    }
  }

  const handleFilter = () => {
    listQuery.page = 1
    fetchWorkOrders()
  }

  const handleSizeChange = val => {
    listQuery.limit = val
    fetchWorkOrders()
  }

  const handleCurrentChange = val => {
    listQuery.page = val
    fetchWorkOrders()
  }

  const toggleRowHighlight = ( row, expanded ) => {
    if ( expanded ) {
      expandedRows.value.add( row.id )
      if ( row.children ) {
        row.children.forEach( child => expandedRows.value.add( child.id ) )
      }
    } else {
      expandedRows.value.delete( row.id )
      if ( row.children ) {
        row.children.forEach( child => expandedRows.value.delete( child.id ) )
      }
    }
  }

  const getRowClass = ( { row } ) => {
    return expandedRows.value.has( row.id ) ? 'expanded-highlight' : ''
  }

  const handleDelete = async( row, index ) => {
    try {
      // Implement actual delete API call
      ElNotification( {
        title : t( 'common.success' ),
        message : t( 'workOrder.messages.deleteSuccess' ),
        type : 'success',
        duration : 2000
      } )
      list.value.splice( index, 1 )
    } catch ( error ) {
      console.error( 'Delete failed:', error )
      ElMessage.error( t( 'workOrder.messages.deleteFailed' ) )
    }
  }

  // Initialize common data
  const initializeCommonData = async() => {
    try {
      await Promise.all( [
        commonDataStore.fetchPriorities(),
        commonDataStore.fetchWorkTypes(),
        commonDataStore.fetchCategories(),
        commonDataStore.fetchProductionLines()
      ] )
    } catch ( error ) {
      console.error( 'Failed to initialize common data:', error )
    }
  }

  return {
    // State
    loading,
    list,
    total,
    listQuery,
    expandedRows,

    // Computed
    hasData,
    isEmpty,

    // Methods
    fetchWorkOrders,
    loadChildren,
    handleFilter,
    handleSizeChange,
    handleCurrentChange,
    toggleRowHighlight,
    getRowClass,
    handleDelete,
    initializeCommonData
  }
}

/**
 * Work Order Form Composable
 * Handles form state and validation for work order creation/editing
 */
export function useWorkOrderForm() {
  const { t } = useI18n()

  // Form state
  const form = reactive( {
    name : '',
    description : '',
    estimated_minutes : 30,
    production_line_id : null,
    equipment_group_id : null,
    equipment_id : null,
    component_id : null,
    priority_id : null,
    category_id : null,
    work_type_id : null,
    state_id : 1,
    halt_type : 0,
    time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
    created_by : 37, // Get from user store
    recurrence_type : null,
    image_list : [],
    files_list : [],
    recurrence_setting : {}
  } )

  // Validation rules
  const rules = reactive( {
    name : [{ required : true, message : t( 'workOrder.validation.nameRequired' ), trigger : 'blur' }],
    halt_type : [{ required : true, message : t( 'workOrder.validation.haltTypeRequired' ), trigger : 'change' }],
    production_line_id : [
      { required : true, message : t( 'workOrder.validation.productionLineRequired' ), trigger : 'change' }
    ],
    priority_id : [{ required : true, message : t( 'workOrder.validation.priorityRequired' ), trigger : 'change' }],
    category_id : [{ required : true, message : t( 'workOrder.validation.categoryRequired' ), trigger : 'change' }],
    work_type_id : [{ required : true, message : t( 'workOrder.validation.workTypeRequired' ), trigger : 'change' }],
    recurrence_type : [{ required : true, message : t( 'workOrder.validation.recurrenceRequired' ), trigger : 'change' }],
    'recurrence_setting.start_date_time' : [
      { required : true, message : t( 'workOrder.validation.startDateRequired' ), trigger : 'change' }
    ],
    'recurrence_setting.end_date_time' : [
      { required : true, message : t( 'workOrder.validation.endDateRequired' ), trigger : 'change' }
    ]
  } )

  // Reset form to initial state, hardcode some values for testing purposes
  const resetForm = () => {
    Object.assign( form, {
      name : '',
      description : '',
      estimated_minutes : 30,
      production_line_id : null,
      equipment_group_id : null,
      equipment_id : null,
      component_id : null,
      priority_id : null,
      category_id : null,
      work_type_id : null,
      state_id : 1,
      halt_type : 0,
      time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_by : 37,
      recurrence_type : null,
      image_list : [],
      files_list : [],
      recurrence_setting : {}
    } )
  }

  // Validate form
  const validateForm = formRef => {
    return new Promise( resolve => {
      formRef.validate( valid => {
        resolve( valid )
      } )
    } )
  }

  return {
    form,
    rules,
    resetForm,
    validateForm
  }
}
