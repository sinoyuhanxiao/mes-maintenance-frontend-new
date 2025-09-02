/**
 * Work Order Management Composable
 * Provides centralized state management and business logic for work orders
 */
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { searchWorkOrders, getWorkOrdersByRecurrence, searchWorkOrdersByList } from '@/api/work-order'
import { useCommonDataStore } from '@/store/modules/commonData'

export function useWorkOrder() {
  const { t } = useI18n()
  const commonDataStore = useCommonDataStore()

  // State
  const loading = ref( false )
  const list = ref( [] )
  const total = ref( 0 )
  const expandedRows = ref( new Set() )

  // Query parameters - Fixed to match filter properties used in fetchWorkOrders
  const listQuery = reactive( {
    page : 1,
    limit : 20,
    importance : undefined,
    title : undefined,
    type : undefined,
    latest_per_recurrence : true,
    // Filter properties that are actually used
    assignedTo : undefined,
    priority : undefined,
    workType : undefined,
    status : undefined,
    search : undefined,
    dueDate : undefined,
    customDateRange : undefined,
    sort : 'created_at_desc' // Use consistent created_at desc sorting for most recent first
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

      let response
      let data
      if ( listQuery.page === -1 && listQuery.limit === -1 ) {
        response = await searchWorkOrdersByList( getSearchFilterPayload() )
        data = response.data
      } else {
        response = await searchWorkOrders(
          listQuery.page,
          listQuery.limit,
          'createdAt',
          'DESC',
          getSearchFilterPayload()
        )

        data = response.data.content
      }

      total.value = response.data.totalElements || response.data.length

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

  const updateFilters = newFilters => {
    // Update filter properties in listQuery
    Object.keys( newFilters ).forEach( key => {
      if ( Object.prototype.hasOwnProperty.call( listQuery, key ) ) {
        listQuery[key] = newFilters[key]
      }
    } )
    // Reset to first page when filters change
    listQuery.page = 1
    fetchWorkOrders()
  }

  const handleSizeChange = val => {
    listQuery.limit = val
    listQuery.page = 1 // Reset to first page when changing page size
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
        commonDataStore.fetchStates()
        // TODO: REWORK USING EQUIPMENT NODE API
        // commonDataStore.fetchProductionLines()
      ] )
    } catch ( error ) {
      console.error( 'Failed to initialize common data:', error )
    }
  }

  // Return an object containing due_date_to and due_date_from field for filtering by due date
  const MS_IN_DAY = 24 * 60 * 60 * 1000
  const startOfLocalDay = dateLike => {
    const d = dateLike instanceof Date ? dateLike : new Date( dateLike )
    return new Date( d.getFullYear(), d.getMonth(), d.getDate() )
  }
  const endOfLocalDay = dateLike => {
    const start = startOfLocalDay( dateLike )
    return new Date( start.getTime() + MS_IN_DAY - 1 )
  }
  const processDueDateOptions = ( now = new Date() ) => {
    const opt = listQuery?.dueDate
    if ( !opt ) return {}

    const todayStart = startOfLocalDay( now )

    const y = now.getFullYear()
    const m = now.getMonth()
    const d = now.getDate()

    // Sunday-start week (Sun=0)
    const dow = now.getDay()
    const weekStart = new Date( y, m, d - dow ) // local 00:00
    const weekEnd = new Date( y, m, d - dow + 7 ) // next Sunday 00:00
    // Subtract 1 ms for 23:59:59.999
    const weekEndInclusive = new Date( weekEnd.getTime() - 1 )

    // Month range
    const monthStart = new Date( y, m, 1 )
    const nextMonthStart = new Date( y, m + 1, 1 )
    const monthEndInclusive = new Date( nextMonthStart.getTime() - 1 )

    switch ( opt ) {
      case 'overdue':
        // strictly before today
        return { due_date_to : todayStart }
      case 'today':
        return {
          due_date_from : todayStart,
          due_date_to : endOfLocalDay( todayStart )
        }
      case 'thisWeek':
        return {
          due_date_from : weekStart,
          due_date_to : weekEndInclusive
        }
      case 'thisMonth':
        return {
          due_date_from : monthStart,
          due_date_to : monthEndInclusive
        }
      case 'custom':
        // TODO later
        return {}
      default:
        return {}
    }
  }

  // Convert listQuery into searchWorkOrder api payload
  const getSearchFilterPayload = () => {
    const q = listQuery

    const payload = {
      keyword : q.search || null,
      work_type_ids : q.workType ? [q.workType] : [],
      priority_ids : q.priority ? [q.priority] : [],
      state_ids : q.state ? [q.state] : [],
      category_ids : q.category ? [q.category] : [],
      latest_per_recurrence : q.latest_per_recurrence,
      start_date_from : q.start_date_from,
      end_date_to : q.end_date_to
      // TODO: add more supported filter param later (equipment_node, recurrence_type_id, approved/finished at)
    }

    const dueDateObj = processDueDateOptions()
    Object.assign( payload, dueDateObj )

    // Clean undefined / null / empty arrays
    Object.keys( payload ).forEach( key => {
      const value = payload[key]
      if ( value === undefined || value === null || ( Array.isArray( value ) && value.length === 0 ) ) {
        delete payload[key]
      }
    } )

    return payload
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
    updateFilters,
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
