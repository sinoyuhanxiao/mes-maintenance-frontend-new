/**
 * Spare Part Management Composable
 */
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

import {
  searchSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  searchInventory, searchInventoryTransactionLogs
} from '@/api/resources'

export function useSparePart() {
  const { t } = useI18n()

  // List state
  const loading = ref( false )
  const list = ref( [] )
  const total = ref( 0 )
  const inventoryTransferRecords = ref( [] )

  // Right pane state
  const selected = ref( null )
  const editing = ref( false )

  // Query & filters
  const listQuery = reactive( {
    page : 1,
    limit : 20,
    sort_by : 'newest',
    keyword : '',
    category_ids : null,
    stock : null, // 'in_stock' | 'low' | 'out_of_stock'
    vendor_ids : [],
    manufacturer_ids : [],
    location_ids : [],
    unit_cost_min : null,
    unit_cost_max : null
  } )

  const hasData = computed( () => list.value && list.value.length > 0 )
  const isEmpty = computed( () => !loading.value && !hasData.value )

  function getSearchPayload() {
    const p = {
      keyword : listQuery.keyword || null,
      spare_part_class_ids : listQuery.category_ids ? listQuery.category_ids : [],
      vendor_ids : listQuery.vendor_ids ? listQuery.vendor_ids : [],
      location_ids : listQuery.location_ids ? listQuery.location_ids : [],
      stock : listQuery.stock || null,
      min_price : listQuery.unit_cost_min,
      max_price : listQuery.unit_cost_max
    }

    Object.keys( p ).forEach( k => {
      const v = p[k]
      if ( v === undefined || v === null || ( Array.isArray( v ) && v.length === 0 ) ) {
        delete p[k]
      }
    } )
    return p
  }

  function resolveSort( sortKey ) {
    switch ( sortKey ) {
      case 'oldest':
        return { sortField : 'createdAt', sortDirection : 'ASC' }
      case 'newest':
        return { sortField : 'createdAt', sortDirection : 'DESC' }
      case 'alphabetical-asc':
        return { sortField : 'name', sortDirection : 'ASC' }
      case 'alphabetical-desc':
        return { sortField : 'name', sortDirection : 'DESC' }
      default:
        return { sortField : 'createdAt', sortDirection : 'DESC' }
    }
  }

  async function fetchSpareParts() {
    loading.value = true
    try {
      const sort_setting = resolveSort( listQuery.sort_by )

      const [invRes, spRes] = await Promise.all( [
        searchInventory( 1, 10000, 'createdAt', 'ASC', {} ),
        searchSpareParts(
          listQuery.page,
          listQuery.limit,
          sort_setting.sortField,
          sort_setting.sortDirection,
          getSearchPayload()
        )
      ] )

      // Build inventory lookup map: material_id → list of inventories
      const inventories = invRes.data.content || []
      const inventoryMap = inventories.reduce( ( accumulated, inventoryObj ) => {
        // Filter out status 0 inventories
        if ( inventoryObj.status !== 1 ) {
          return accumulated
        }

        // Initialize if array does not exist
        if ( !accumulated[inventoryObj.material_id] ) {
          accumulated[inventoryObj.material_id] = []
        }

        accumulated[inventoryObj.material_id].push( inventoryObj )
        return accumulated
      }, {} )

      list.value = ( spRes.data.content || [] ).map( sp => {
        const validSparePartVendors = ( sp.spare_part_vendors || [] ).filter( spv => spv.vendor?.status === 1 )

        return {
          ...sp,
          average_unit_cost : computeAverageVendorCost( validSparePartVendors ),
          spare_part_vendors : validSparePartVendors,
          spare_parts_class : sp.spare_parts_class?.status === 1 ? sp.spare_parts_class : null,
          manufacturer : sp.manufacturer?.status === 1 ? sp.manufacturer : null,
          inventories : inventoryMap[sp.id] || []
        }
      } )

      total.value = spRes.data.totalElements ?? 0
    } catch ( err ) {
      console.error( err )
      ElMessage.error( 'Error loading spare part list ' + err.message )
    } finally {
      loading.value = false
    }
  }

  async function fetchSparePartById( id ) {
    try {
      const res = await getSparePartById( id )
      selected.value = res.data
    } catch ( err ) {
      console.error( err )
      ElMessage.error( 'Error loading spare part by id' )
    }
  }

  async function fetchInventoryTransactionLogs( ) {
    try {
      const res = await searchInventoryTransactionLogs( )
      inventoryTransferRecords.value = res.data.content || []
    } catch ( err ) {
      console.error( err )
      ElMessage.error( 'Error loading spare part by id' )
    }
  }

  function openCreate() {
    selected.value = null
    editing.value = true
  }
  function openEdit() {
    if ( !selected.value ) {
      return
    }

    editing.value = true
  }
  function closeForm() {
    editing.value = false
  }

  async function save( formData ) {
    try {
      if ( formData.id ) {
        await updateSparePart( formData.id, formData )
        ElNotification( { title : t( 'common.success' ), message : 'Spare part updated successfully', type : 'success' } )
      } else {
        await createSparePart( formData )
        ElNotification( { title : t( 'common.success' ), message : 'Spare part created successfully', type : 'success' } )
      }

      editing.value = false
      await fetchSpareParts()
    } catch ( err ) {
      console.error( err )
      ElMessage.error( "Error saving spare part form's data" )
    }
  }

  async function remove( id ) {
    try {
      await deleteSparePart( id )
      ElNotification( { title : t( 'common.success' ), message : 'Spare part deleted successfully', type : 'success' } )
      await fetchSpareParts()

      if ( selected.value?.id === id ) {
        selected.value = null
      }
    } catch ( err ) {
      console.error( err )
      ElMessage.error( 'Error deleting spare part' )
    }
  }

  function selectRow( row ) {
    selected.value = row
    editing.value = false
  }

  function setPage( p ) {
    listQuery.page = p
    fetchSpareParts()
  }

  function resetFilters() {
    Object.assign( listQuery, {
      page : 1,
      limit : 20,
      sort_by : 'newest',
      keyword : '',
      category_ids : null,
      stock : null,
      vendor_ids : [],
      manufacturer_ids : [],
      location_ids : [],
      unit_cost_min : null,
      unit_cost_max : null
    } )

    fetchSpareParts()
  }

  // Backend filtering on this transaction log is not finished
  function getMaterialInventoryTransactionLog( material_id ) {
    if ( !material_id ) {
      return []
    }

    // Filter records whose material_id matches
    return inventoryTransferRecords.value.filter(
      itr => itr.material_id === material_id
    )
  }

  return {
    // state
    loading,
    list,
    total,
    selected,
    editing,
    listQuery,
    hasData,
    isEmpty,
    // actions
    fetchSpareParts,
    fetchSparePartById,
    openCreate,
    openEdit,
    closeForm,
    save,
    remove,
    selectRow,
    setPage,
    resetFilters,
    getMaterialInventoryTransactionLog,
    fetchInventoryTransactionLogs
  }
}

/** Helpers */
export function computeAverageVendorCost( material_suppliers = [] ) {
  if ( !Array.isArray( material_suppliers ) || material_suppliers.length === 0 ) {
    return { avg : null, currency : null }
  }

  const withPrice = material_suppliers.filter( v => typeof v.unit_price === 'number' && v.unit_price >= 0 )

  if ( !withPrice.length ) {
    return { avg : null, currency : material_suppliers[0]?.price_uom?.name || null }
  }

  // TODO: refactor later, uses first supplier's price uom for now
  const currency = withPrice[0]?.price_uom?.name || null
  const avg = withPrice.reduce( ( s, v ) => s + v.unit_price, 0 ) / withPrice.length

  return { avg, currency }
}
