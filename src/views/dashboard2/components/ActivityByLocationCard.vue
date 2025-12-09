<template>
  <div class="panel tracking">
    <div class="panel-header">
      <div>
        <div class="h-title">Activity by Location</div>
        <div class="h-sub">Work order percentage by root location</div>
      </div>
    </div>

    <div class="panel-body">
      <!-- Map displaying multiple dots -->
      <div class="map-shell">
        <!-- ⭐ Animated skeleton while loading -->
        <el-skeleton v-if="locationLoading" animated :throttle="0" style="height: 100%">
          <template #template>
            <el-skeleton-item variant="rect" class="map-skeleton-rect" />
          </template>
        </el-skeleton>

        <!-- Actual map -->
        <MesStreetMap v-else-if="locationStats.length" :key="mapKey" :locations="locationStats" :zoom="mapZoom" />

        <!-- Fallback -->
        <div v-else class="map-loading-placeholder">No locations</div>
      </div>

      <!-- List of locations + percentages -->
      <div class="loc-list">
        <!-- ⭐ Skeleton rows while loading -->
        <template v-if="locationLoading">
          <el-skeleton v-for="n in 4" :key="n" animated style="margin-bottom: 10px">
            <template #template>
              <div class="loc-skeleton-row">
                <el-skeleton-item variant="text" style="width: 40%" />
                <el-skeleton-item variant="rect" style="flex: 1; height: 10px; margin-left: 8px" />
              </div>
            </template>
          </el-skeleton>
        </template>

        <!-- Actual data -->
        <template v-else>
          <div v-for="loc in locationStats" :key="loc.id || loc.name" class="loc-row">
            <!-- Left: name -->
            <div class="loc-left">
              <div class="loc-text">
                <el-text class="loc-name" truncated>{{ loc.name }}</el-text>
              </div>
            </div>

            <!-- Middle: bar -->
            <div class="loc-bar">
              <el-progress :percentage="loc.percentage" :show-text="false" stroke-width="8" />
            </div>

            <!-- Right: percentage text -->
            <el-text class="loc-percentage" size="small"> {{ loc.percentage }}% </el-text>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MesStreetMap from 'src/components/MesStreetMap'
import { getLocationTree, getLocationById } from 'src/api/location'
import { getEquipmentNodes } from '@/api/equipment'
import { searchWorkOrders } from '@/api/work-order'

/* ──────────────────────────────────────────────────────────────
   State
────────────────────────────────────────────────────────────── */
const locationStats = ref( [] )
const locationLoading = ref( false )
const mapZoom = ref( 8 )
const mapKey = ref( 0 )

/* fallback for no data */
const STATIC_LOCATIONS = [
  { name : 'Richmond, BC', lon : -123.136, lat : 49.1666, percentage : 45 },
  { name : 'Vancouver, BC', lon : -123.1207, lat : 49.2827, percentage : 30 },
  { name : 'Surrey, BC', lon : -122.849, lat : 49.1044, percentage : 15 },
  { name : 'Burnaby, BC', lon : -122.978, lat : 49.2488, percentage : 10 },
  { name : 'Coquitlam, BC', lon : -122.7932, lat : 49.2838, percentage : 8 }
]

function updateMapZoom() {
  const w = window.innerWidth

  if ( w >= 1600 ) mapZoom.value = 6
  else if ( w >= 1200 ) mapZoom.value = 7
  else mapZoom.value = 8
}

function handleResize() {
  updateMapZoom()
  mapKey.value += 1
}

/** Extract rows from searchWorkOrders result */
function extractRows( res ) {
  const root = res?.data ?? res
  return root?.data?.content ?? root?.content ?? root?.records ?? root?.list ?? root?.items ?? root?.rows ?? []
}

/** Extract page object from getEquipmentNodes */
function unwrapPage( res ) {
  const root = res?.data ?? res
  return root?.data ?? root
}

/** Collect all descendant location IDs (including root) */
function collectLocationIds( root ) {
  const ids = []
  function dfs( node ) {
    if ( !node ) return
    if ( node.id != null ) {
      const n = Number( node.id )
      if ( Number.isFinite( n ) ) ids.push( n )
    }
    if ( Array.isArray( node.children ) ) {
      node.children.forEach( child => dfs( child ) )
    }
  }
  dfs( root )
  return ids
}

/** Fetch all equipment nodes under root + descendants */
async function fetchEquipmentNodeIdsForRoot( root ) {
  const locationIds = collectLocationIds( root )
  if ( !locationIds.length ) return []

  const ids = []
  let page = 1
  const size = 200
  const MAX_PAGES = 20

  while ( page <= MAX_PAGES ) {
    const body = { location_ids : locationIds }
    const res = await getEquipmentNodes( page, size, 'createdAt', 'DESC', body )
    const pageData = unwrapPage( res )

    const list = Array.isArray( pageData?.content ) ? pageData.content : Array.isArray( pageData ) ? pageData : []

    ids.push( ...list.map( e => Number( e.id ) ).filter( n => Number.isFinite( n ) ) )

    const total = Number( pageData?.totalElements ?? pageData?.total ?? list.length )
    if ( ids.length >= total || list.length < size ) break

    page++
  }

  return Array.from( new Set( ids ) )
}

/** Count work orders linked to the equipment under this root subtree */
async function fetchWorkOrderCountForEquipment( equipmentNodeIds ) {
  if ( !equipmentNodeIds.length ) return 0

  const now = new Date()
  const start = new Date( now.getFullYear(), 0, 1 )
  const end = new Date( now.getFullYear(), 11, 31, 23, 59, 59 )

  const payload = {
    latest_per_recurrence : true,
    start_date_from : start.toISOString(),
    start_date_to : end.toISOString(),
    equipment_node_ids : equipmentNodeIds
  }

  const res = await searchWorkOrders( 1, 2000, 'startDate', 'ASC', payload )
  return extractRows( res ).length
}

/* ──────────────────────────────────────────────────────────────
   Main loader - real stats!
────────────────────────────────────────────────────────────── */
async function loadLocationStats() {
  locationLoading.value = true

  try {
    const treeRes = await getLocationTree()
    const payloadTree = treeRes?.data ?? treeRes
    const roots = Array.isArray( payloadTree?.data ) ? payloadTree.data : Array.isArray( payloadTree ) ? payloadTree : []

    if ( !roots.length ) {
      locationStats.value = STATIC_LOCATIONS
      return
    }

    const detailed = []

    await Promise.all(
      roots.map( async root => {
        try {
          const locId = Number( root.id )
          if ( !Number.isFinite( locId ) ) return

          // 1) Get location info + coords first
          const locRes = await getLocationById( locId )
          const payloadLoc = locRes?.data ?? locRes
          const loc = payloadLoc?.data ?? payloadLoc ?? {}

          let latFinal = Number( loc.latitude )
          let lonFinal = Number( loc.longitude )

          if ( !Number.isFinite( latFinal ) || !Number.isFinite( lonFinal ) ) {
            // fallback coords if missing (you can change this)
            latFinal = 49.1666
            lonFinal = -123.1336
          }

          // 2) All equipment under this root subtree
          const equipmentIds = await fetchEquipmentNodeIdsForRoot( root )

          // 3) Real work order count (or 0 if no equipment)
          const count = equipmentIds.length ? await fetchWorkOrderCountForEquipment( equipmentIds ) : 0

          detailed.push( {
            id : loc.id ?? locId,
            name : loc.name ?? root.name ?? `Location #${locId}`,
            lat : latFinal,
            lon : lonFinal,
            count
          } )
        } catch ( err ) {
          console.warn( 'Failed root stats:', root.id, err )
        }
      } )
    )

    if ( !detailed.length ) {
      locationStats.value = STATIC_LOCATIONS
      return
    }

    const total = detailed.reduce( ( sum, l ) => sum + ( l.count || 0 ), 0 )

    if ( !total ) {
      locationStats.value = detailed
        .map( l => ( {
          ...l,
          percentage : 0
        } ) )
        .sort( ( a, b ) => b.percentage - a.percentage )
      return
    }

    let remaining = 100
    locationStats.value = detailed
      .map( ( loc, idx ) => {
        const raw = ( ( loc.count || 0 ) / total ) * 100
        const pct = idx === detailed.length - 1 ? remaining : Math.round( raw )
        remaining -= pct
        return { ...loc, percentage : pct }
      } )
      .sort( ( a, b ) => b.percentage - a.percentage )
  } catch ( e ) {
    console.error( 'Failed location stats:', e )
    locationStats.value = STATIC_LOCATIONS
  } finally {
    locationLoading.value = false
  }
}

/* ──────────────────────────────────────────────────────────────
   Lifecycle
────────────────────────────────────────────────────────────── */
onMounted( () => {
  updateMapZoom()
  window.addEventListener( 'resize', handleResize )
  loadLocationStats()
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
} )
</script>

<style scoped lang="scss">
/* Reuse generic panel look from parent (class names are the same) */
.panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(16, 24, 40, 0.02), 0 1px 2px rgba(16, 24, 40, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.panel-body {
  padding: 16px;
}

.h-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
.h-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

/* ── Tracking Card / Location-specific styles ──────────────────── */
.panel.tracking {
  display: flex;
  flex-direction: column;
}

.panel.tracking .panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.map-shell {
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
  margin-bottom: 12px;
}

/* ⭐ skeleton rect to roughly match the map */
.map-skeleton-rect {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

/* simple placeholder */
.map-loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.loc-list {
  margin-top: 12px;
  display: grid;
  gap: 14px;
}

/* skeleton row for locations */
.loc-skeleton-row {
  display: flex;
  align-items: center;
}

/* each row: left block, bar, % */
.loc-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* left side: name */
.loc-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 40%;
  min-width: 0;
}

.loc-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.loc-name {
  font-weight: 500;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

/* middle bar stretches */
.loc-bar {
  flex: 1;
}

/* right percentage */
.loc-percentage {
  width: 40px;
  text-align: right;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* Larger screens: taller map, extra bottom spacing */
@media (min-width: 992px) {
  .map-shell {
    height: 260px;
    margin-bottom: 60px;
  }
}
</style>
