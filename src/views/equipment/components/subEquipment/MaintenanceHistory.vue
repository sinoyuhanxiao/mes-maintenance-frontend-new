<template>
  <div class="t4-sub-items">
    <!-- LOADING -->
    <div v-if="loading" class="loading-state" v-loading="loading" />

    <!-- NO DATA: plain text only -->
    <template v-else-if="!hasAnyData">
      <div class="no-data-message">No maintenance history available</div>
    </template>

    <!-- HAS DATA: search + table + pagination (original design) -->
    <template v-else>
      <!-- SEARCH BAR -->
      <el-descriptions :column="1" direction="vertical">
        <el-descriptions-item>
          <div class="search-bar">
            <el-input v-model="searchQuery" placeholder="Search" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- TABLE OR EMPTY MESSAGE -->
      <template v-if="filteredData.length > 0">
        <el-table
          :data="paginatedData"
          :default-sort="{ prop: 'maintenanceDate', order: 'ascending' }"
          class="schedule-table"
        >
          <el-table-column prop="deviceTag" label="Pos" sortable width="140" />
          <el-table-column prop="sparePart" label="Spare Part" sortable width="180" />
          <el-table-column prop="vendorSuggestedDays" label="Vendor Suggested Service Days" sortable width="200" />
          <el-table-column prop="estimatedServiceDays" label="Estimated Service Days" sortable width="180" />

          <el-table-column prop="previousRuntime" label="Previous Runtime" sortable width="150">
            <template #default="{ row }">
              {{ formatRuntime(row.previousRuntime) }}
            </template>
          </el-table-column>

          <el-table-column prop="maintenanceType" label="Maintenance Type" sortable width="140">
            <template #default="{ row }">
              <el-tag :type="getMaintenanceTypeColor(row.maintenanceType)" size="small">
                {{ row.maintenanceType || '—' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="maintenanceDate" label="Maintenance Date" sortable width="150">
            <template #default="{ row }">
              {{ formatDate(row.maintenanceDate) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            @current-change="handlePageChange"
          />
        </div>
      </template>

      <!-- EMPTY STATE (same style as "No tier 5 spare parts available.") -->
      <template v-else>
        <div class="no-data-message">No maintenance history available.</div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, useAttrs, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getEquipmentById, getEquipmentSubtree } from '@/api/equipment'
import { getSparePartById } from '@/api/resources'

/* ---------- loading & fetch state ---------- */
const loading = ref( false )
const sparePartsData = ref( [] ) // raw T5 rows

/* ---------- table state ---------- */
const searchQuery = ref( '' )
const currentPage = ref( 1 )
const pageSize = ref( 10 )

/* ---------- cache spare-parts ---------- */
const spCache = new Map()
async function getSparePartCached( id ) {
  if ( !id ) return null
  if ( spCache.has( id ) ) return spCache.get( id )
  const resp = await getSparePartById( Number( id ) )
  const sp = resp?.data?.data ?? resp?.data ?? resp ?? {}
  spCache.set( id, sp )
  return sp
}

/* ---------- map Tier-5 rows -> table schema ---------- */
function coalesce( ...xs ) {
  for ( const x of xs ) if ( x !== undefined && x !== null && x !== '' ) return x
}
function inferType( row ) {
  if ( row?.maintenanceType ) return row.maintenanceType
  if ( row?.suggestedServiceDays != null ) return 'Preventive'
  if ( row?.estimatedServiceDays != null ) return 'Predictive'
  return 'Inspection'
}
const tableData = computed( () =>
  ( sparePartsData.value || [] ).map( r => ( {
    locationCode : r.locationCode ?? r.location_code ?? '',
    deviceTag : String( r.deviceTagPositionCode ?? r.sequence_order ?? r.sequenceOrder ?? '' ) || '',
    sparePart : r.title || r.name || r.partNumber || r.code || '',
    vendorSuggestedDays : r.suggestedServiceDays ?? '',
    estimatedServiceDays : r.estimatedServiceDays ?? '',
    previousRuntime : r.previousRuntime || '',
    maintenanceType : inferType( r ),
    maintenanceDate : coalesce( r.lastInstallmentTime, r.last_maintenance_date, r.installation_date, null )
  } ) )
)

/* ---------- render guards ---------- */
const hasAnyData = computed( () => ( sparePartsData.value?.length || 0 ) > 0 )

/* ---------- search / pagination ---------- */
const filteredData = computed( () => {
  const q = ( searchQuery.value || '' ).toLowerCase().trim()
  if ( !q ) return tableData.value
  return tableData.value.filter(
    row =>
      ( row.locationCode || '' ).toLowerCase().includes( q ) ||
      ( row.deviceTag || '' ).toLowerCase().includes( q ) ||
      ( row.sparePart || '' ).toLowerCase().includes( q )
  )
} )
const paginatedData = computed( () => {
  const start = ( currentPage.value - 1 ) * pageSize.value
  return filteredData.value.slice( start, start + pageSize.value )
} )
function handlePageChange( page ) {
  currentPage.value = page
}

/* ---------- utils ---------- */
function formatDate( dateString ) {
  if ( !dateString ) return '—'
  const date = new Date( dateString )
  if ( Number.isNaN( date.valueOf() ) ) return '—'
  return date.toLocaleDateString( 'en-US', { year : 'numeric', month : 'short', day : 'numeric' } )
}
function formatRuntime( v ) {
  if ( v === null || v === undefined ) return '—'
  const s = String( v ).trim()
  return s || '—'
}
function getMaintenanceTypeColor( type ) {
  const colorMap = {
    Preventive : 'success',
    Predictive : 'primary',
    Corrective : 'warning',
    Emergency : 'danger',
    Routine : 'info',
    Overhaul : 'warning',
    Upgrade : 'primary',
    Inspection : 'info'
  }
  return colorMap[type] || 'info'
}

/* ---------- attrs / T4 id ---------- */
const attrs = useAttrs()
function resolveTier4Id() {
  const a = attrs.tier4Id ?? attrs['tier4-id']
  if ( a == null || a === '' || Number.isNaN( Number( a ) ) ) return null
  return Number( a )
}

/* ---------- data pipeline (unchanged) ---------- */
async function fetchTier5Detail( t5id, fallbackIndex = 0 ) {
  const res = await getEquipmentById( Number( t5id ) )
  const d = res?.data?.data ?? res?.data ?? res ?? {}

  const spId = d.spare_part_id ?? d.spare_part_definition_id ?? d.sparePartId ?? d.sparePartDefinitionId ?? null
  let sp = null
  if ( spId ) {
    try {
      sp = await getSparePartCached( spId )
    } catch ( _ ) {}
  }

  const spName = sp?.name ?? ''
  const spCode = sp?.code ?? ''
  const seqRaw = d.sequence_order ?? d.sequenceOrder
  const seq = seqRaw == null ? fallbackIndex + 1 : seqRaw
  const qty = d.spare_part_quantity ?? d.device_quantity ?? 1
  const autoTrig = d.is_auto_trigger === true ? 'Yes' : d.is_auto_trigger === false ? 'No' : ''
  const last = d.last_maintenance_date ?? d.installation_date ?? null

  return {
    id : d.id ?? Number( t5id ),
    title : spName || '',
    partNumber : spCode || '',
    sparePartId : spId ?? null,
    deviceTagPositionCode : seq != null ? String( seq ) : '',
    deviceQuantity : String( qty ),
    suggestedServiceDays : d.suggested_maintenance_interval_days ?? null,
    estimatedServiceDays : d.estimated_maintenance_interval_days ?? null,
    autoTriggerCycle : autoTrig,
    lastInstallmentTime : last,
    location_code : d.location_code ?? d.locationCode ?? ''
  }
}
async function fetchTier5DetailsInChunks( ids, chunkSize = 8 ) {
  const out = []
  for ( let i = 0; i < ids.length; i += chunkSize ) {
    const slice = ids.slice( i, i + chunkSize )
    const rows = await Promise.allSettled( slice.map( ( id, idxInSlice ) => fetchTier5Detail( id, i + idxInSlice ) ) )
    for ( const s of rows ) {
      if ( s.status === 'fulfilled' && s.value && typeof s.value === 'object' ) out.push( s.value )
      else {
        const id = typeof s?.reason?.id === 'number' ? s.reason.id : null
        if ( id != null ) out.push( { id, title : `Part ${id}`, partNumber : `P-${id}` } )
      }
    }
  }
  return out
}
async function loadSubtree( id ) {
  if ( id == null ) return
  try {
    const resp = await getEquipmentSubtree( id )
    const json = resp?.data ?? resp
    const children = Array.isArray( json?.data?.children )
      ? json.data.children
      : Array.isArray( json?.children )
        ? json.children
        : []

    const sorted = [...children].sort( ( a, b ) => {
      const sa = a.sequenceOrder ?? a.sequence_order ?? Number.MAX_SAFE_INTEGER
      const sb = b.sequenceOrder ?? b.sequence_order ?? Number.MAX_SAFE_INTEGER
      if ( sa !== sb ) return sa - sb
      return ( a.id || 0 ) - ( b.id || 0 )
    } )

    const ids = sorted.map( c => c.id ).filter( Boolean )
    let rows = []
    if ( ids.length ) rows = await fetchTier5DetailsInChunks( ids, 8 )
    sparePartsData.value = rows.map( r =>
      r && typeof r === 'object' ? r : { id : r, title : `Part ${r}`, partNumber : `P-${r}` }
    )
  } catch ( err ) {
    console.error( 'loadSubtree failed:', err )
    sparePartsData.value = []
  }
}

/* ---------- lifecycle ---------- */
const isWide = ref( false )
function updateIsWide() {
  isWide.value = typeof window !== 'undefined' && window.innerWidth >= 1440
}
onMounted( async() => {
  updateIsWide()
  window.addEventListener( 'resize', updateIsWide )
  await refreshAll()
} )
onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateIsWide )
} )

async function refreshAll() {
  const id = resolveTier4Id()
  loading.value = true
  try {
    await loadSubtree( id )
  } finally {
    loading.value = false
  }
}
watch(
  () => [attrs.tier4Id, attrs['tier4-id']],
  () => {
    currentPage.value = 1
    refreshAll()
  }
)
</script>

<style scoped>
.t4-sub-items {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.search-bar {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}
.schedule-table {
  width: 100%;
  height: calc(100vh - 445px);
}
.loading-state {
  width: 100%;
  height: 320px;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  padding: 10px 0;
}
.no-data-message {
  color: var(--el-text-color-regular, #606266); /* darker than secondary */
  text-align: left;
  padding: 20px 0;
  font-size: 14px;
}
</style>
