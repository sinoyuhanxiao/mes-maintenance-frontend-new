<template>
  <div class="t2-personnel-container" v-loading="loading">
    <!-- No data -->
    <div v-if="!hasAnyRows" class="empty-wrap">No personnel wo stats available</div>

    <!-- Has data -->
    <div v-else class="table">
      <el-descriptions :column="1" direction="vertical">
        <el-descriptions-item label="Personnel WO Stats">
          <div class="table-wrapper">
            <el-table
              :data="filteredData"
              :default-sort="{ prop: 'active', order: 'descending' }"
              style="width: 100%"
              height="calc(100vh - 395px)"
            >
              <el-table-column prop="name" label="Name" sortable />
              <el-table-column prop="active" label="Active" sortable />
              <el-table-column prop="complete" label="Complete" sortable />
              <el-table-column prop="failed" label="Failed" sortable />
              <el-table-column prop="incomplete" label="Incomplete" sortable />
              <el-table-column prop="total" label="Total" sortable />
            </el-table>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { searchWorkOrders } from '@/api/work-order'
import { ElMessage } from 'element-plus'

const STATE_ID = {
  Completed : 7,
  Failed : 12,
  Incomplete : 13,
  ActiveSet : new Set( [4, 5, 6] )
}

const props = defineProps( {
  equipmentId : { type : [Number, String], required : false }
} )

const searchQuery = ref( '' )
const allRows = ref( [] )
const tableData = ref( [] )
const loading = ref( false )

function buildPersonMap( woRows ) {
  const map = new Map()
  for ( const wo of woRows ) {
    for ( const u of wo.user_list ?? [] ) {
      if ( u?.id != null ) {
        map.set( u.id, { firstName : u.first_name ?? '', lastName : u.last_name ?? '' } )
      }
    }
  }
  return map
}

function computePersonnelStats( woRows ) {
  const personMap = buildPersonMap( woRows )
  const per = new Map()
  const ensure = id => {
    if ( !per.has( id ) ) {
      per.set( id, {
        woAll : new Set(),
        woCompleted : new Set(),
        woFailed : new Set(),
        woIncomplete : new Set(),
        woActive : new Set()
      } )
    }
    return per.get( id )
  }

  for ( const wo of woRows ) {
    const woId = wo.id
    const stateId = wo?.state?.id
    for ( const t of wo.task_list ?? [] ) {
      for ( const pid of t.assignees ?? [] ) {
        const bucket = ensure( pid )
        bucket.woAll.add( woId )
        if ( stateId === STATE_ID.Completed ) bucket.woCompleted.add( woId )
        else if ( stateId === STATE_ID.Failed ) bucket.woFailed.add( woId )
        else if ( stateId === STATE_ID.Incomplete ) bucket.woIncomplete.add( woId )
        if ( STATE_ID.ActiveSet.has( stateId ) ) bucket.woActive.add( woId )
      }
    }
  }

  const rows = []
  for ( const [pid, b] of per.entries() ) {
    const p = personMap.get( pid )
    const name = p && ( p.firstName || p.lastName ) ? `${p.firstName} ${p.lastName}`.trim() : `User ${pid}`
    rows.push( {
      name,
      active : b.woActive.size,
      complete : b.woCompleted.size,
      failed : b.woFailed.size,
      incomplete : b.woIncomplete.size,
      total : b.woAll.size
    } )
  }

  rows.sort( ( a, b ) => b.total - a.total )
  return rows
}

async function loadPersonnelStats() {
  try {
    loading.value = true
    const page = 1
    const size = 500
    const eq = props.equipmentId ? Number( props.equipmentId ) : null

    const payload = {
      latest_per_recurrence : false,
      ...( eq ? { equipment_node_ids : [eq] } : {} )
    }

    const res = await searchWorkOrders( page, size, 'createdAt', 'DESC', payload )
    const root = res?.data
    const woRows = root?.data?.content ?? root?.content ?? root?.records ?? root?.list ?? root?.items ?? []
    allRows.value = woRows
    tableData.value = computePersonnelStats( woRows )
  } catch ( err ) {
    console.error( err )
    ElMessage.error( 'Failed to load personnel stats' )
  } finally {
    loading.value = false
  }
}

const hasAnyRows = computed( () => tableData.value.length > 0 )

const filteredData = computed( () => {
  if ( !searchQuery.value.trim() ) return tableData.value
  return tableData.value.filter( row => row.name.toLowerCase().includes( searchQuery.value.toLowerCase() ) )
} )

onMounted( loadPersonnelStats )
watch( () => props.equipmentId, loadPersonnelStats )

defineExpose( { reload : loadPersonnelStats } )
</script>

<style scoped>
.t2-personnel-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.table {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}
.empty-wrap {
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: left;
}
</style>
