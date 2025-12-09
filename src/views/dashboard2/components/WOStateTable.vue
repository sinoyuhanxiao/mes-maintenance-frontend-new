<template>
  <div class="table-wrapper">
    <el-table ref="multipleTable" :data="newList" tooltip-effect="dark" style="width: 100%" v-loading="loading">
      <el-table-column label="Due Date" prop="dueDate" width="150">
        <template #default="{ row }">
          {{ formatDate(row.dueDate) }}
        </template>
      </el-table-column>

      <!-- separate columns for name + code -->
      <el-table-column label="Work Order Name" prop="workOrderName" min-width="180" align="left" />
      <el-table-column label="Code" prop="workOrderCode" min-width="180" align="left" />

      <el-table-column label="Assigned To" prop="assignedTo" min-width="150" align="left" />

      <el-table-column label="Status" width="150" align="left">
        <template #default="scope">
          <el-tag size="default" :type="scope.row.statusType" style="font-size: 13px">
            {{ scope.row.progress }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-foot">
      <div class="muted">Showing {{ pageStart }} to {{ pageEnd }} of {{ total }}</div>
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import { searchWorkOrders } from 'src/api/work-order'
import { getUserById } from 'src/api/user'

defineOptions( {
  name : 'WorkOrderActivityTable'
} )

const props = defineProps( {
  // from parent radio group: "All" / "Completed" / "Failed" / "Overdue" / "Others"
  status : {
    type : String,
    default : 'All'
  }
} )

const rawList = ref( [] ) // rows from backend for the current page + current status filter
const loading = ref( false )

// pagination state
const page = ref( 1 )
const pageSize = ref( 5 )
const total = ref( 0 ) // backend total for this query

/**
 * Backend state IDs (1-14) you shared:
 *  1  Forecast
 *  2  Released
 *  3  Cancelled
 *  4  Pending
 *  5  Ready
 *  6  In progress
 *  7  Completed
 *  8  Aborted
 *  9  Held
 * 10  Suspended
 * 11  Closed
 * 12  Failed
 * 13  Incomplete (your Overdue)
 * 14  Pending Approval
 *
 * Tab mapping:
 *  - Completed: [7]
 *  - Failed:    [12]
 *  - Overdue:   [13]
 *  - Others:    all except 7,12,13 → [1,2,3,4,5,6,8,9,10,11,14]
 */
const STATUS_TO_STATE_IDS = {
  Completed : [7],
  Failed : [12],
  Overdue : [13],
  Others : [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 14]
}

/**
 * Normalize backend state name -> UI label.
 * We treat backend "Incomplete" as "Overdue" in the UI.
 */
function normalizeState( raw ) {
  if ( !raw ) return ''
  const s = String( raw ).trim().toLowerCase()

  if ( s === 'forecast' ) return 'Forecast'
  if ( s === 'released' ) return 'Released'
  if ( s === 'cancelled' ) return 'Cancelled'
  if ( s === 'pending' ) return 'Pending'
  if ( s === 'ready' ) return 'Ready'
  if ( s === 'in progress' ) return 'In Progress'
  if ( s === 'completed' ) return 'Completed'
  if ( s === 'aborted' ) return 'Aborted'
  if ( s === 'held' ) return 'Held'
  if ( s === 'suspended' ) return 'Suspended'
  if ( s === 'closed' ) return 'Closed'
  if ( s === 'failed' ) return 'Failed'
  if ( s === 'incomplete' ) return 'Overdue' // 👈 your overdue
  if ( s === 'pending approval' ) return 'Pending Approval'

  // fallback: keep broad heuristics as backup
  if ( s.includes( 'overdue' ) ) return 'Overdue'
  if ( s.includes( 'fail' ) ) return 'Failed'
  if ( s.startsWith( 'complete' ) || s.includes( ' complete' ) ) return 'Completed'
  if ( s.startsWith( 'in progress' ) || s === 'in_progress' || s.includes( ' in-progress' ) ) {
    return 'In progress'
  }
  if ( s.includes( 'pending approval' ) || s === 'pending_approval' ) return 'Pending Approval'
  if ( s.startsWith( 'forecast' ) ) return 'Forecast'
  if ( s.startsWith( 'pending' ) ) return 'Pending'
  if ( s.startsWith( 'ready' ) ) return 'Ready'
  if ( s.startsWith( 'released' ) ) return 'Released'

  return s.charAt( 0 ).toUpperCase() + s.slice( 1 )
}

// map normalized status -> Element Plus tag type
const statusTagMap = {
  Completed : 'success',
  Failed : 'danger',
  Overdue : 'danger',
  'In Progress' : 'warning',
  Pending : 'pending',
  'Pending Approval' : 'pendingApproval',
  Forecast : 'info',
  Ready : 'warning',
  Released : 'released',
  Cancelled : 'info',
  Aborted : 'danger',
  Held : 'warning',
  Suspended : 'warning',
  Closed : 'success'
}

// cache userId -> user object
const userCache = new Map()

const getUserLabel = user => {
  if ( !user ) return ''
  const first = user.first_name ?? user.firstName ?? ''
  const last = user.last_name ?? user.lastName ?? ''
  const uname = user.username ?? ''
  const full = [first, last].filter( Boolean ).join( ' ' )
  return full || uname || ( user.id != null ? `#${user.id}` : '' )
}

const fetchUserById = async id => {
  const uid = Number( id )
  if ( !Number.isFinite( uid ) ) return null

  if ( userCache.has( uid ) ) return userCache.get( uid )

  try {
    const res = await getUserById( uid )
    const p = res?.data ?? res
    const user = p?.data ?? p
    userCache.set( uid, user )
    return user
  } catch ( err ) {
    console.error( 'Failed to fetch user:', uid, err )
    userCache.set( uid, null )
    return null
  }
}

/**
 * Build backend search payload based on current tab.
 * Matches your curl style:
 *
 * {
 *   "start_date_from": "...",
 *   "state_ids": [7] // e.g. Completed
 * }
 */
const buildSearchPayload = () => {
  const now = new Date()
  const sevenDaysAgo = new Date( now.getTime() - 7 * 24 * 60 * 60 * 1000 )

  const payload = {
    // optional: keep if you still want this behavior
    latest_per_recurrence : false,

    // match curl body:
    due_date_from : sevenDaysAgo.toISOString(),
    due_date_to : now.toISOString()
  }

  // All: no state_ids → backend returns everything
  if ( props.status && props.status !== 'All' ) {
    const stateIds = STATUS_TO_STATE_IDS[props.status]
    if ( stateIds && stateIds.length ) {
      payload.state_ids = stateIds
    }
  }

  return payload
}

// table data with tag types attached
const newList = computed( () => {
  const base = rawList.value || []

  return base.map( item => {
    const st = normalizeState( item.progress )
    return {
      ...item,
      statusType : statusTagMap[st] || 'info'
    }
  } )
} )

const fetchData = async() => {
  loading.value = true
  try {
    const searchPayload = buildSearchPayload()

    const res = await searchWorkOrders( page.value, pageSize.value, 'createdAt', 'DESC', searchPayload )

    const payload = res.data || res
    const data = payload.data || payload
    const items = data.content || []

    total.value = data.total_elements || data.totalElements || data.total || items.length

    rawList.value = await Promise.all(
      items.map( async wo => {
        const firstTask = wo.task_list && wo.task_list[0]

        let assignedTo = ''

        // 1) assignees from task (IDs -> users)
        const assigneeIds = firstTask?.assignees || []
        if ( assigneeIds.length ) {
          const users = await Promise.all( assigneeIds.map( id => fetchUserById( id ) ) )
          const names = users.map( u => getUserLabel( u ) ).filter( Boolean )
          assignedTo = names.join( ', ' )
        }

        // 2) personnel object if present
        if ( !assignedTo && firstTask?.personnel ) {
          assignedTo = getUserLabel( firstTask.personnel )
        }

        // 3) default fallback
        if ( !assignedTo ) {
          assignedTo = '--'
        }

        const rawStateName = wo.state?.name || wo.state_name || ''
        const stateName = normalizeState( rawStateName )

        return {
          dueDate : wo.due_date || wo.end_date || wo.start_date,
          workOrderName : wo.name || '',
          workOrderCode : wo.code || '',
          assignedTo,
          status : stateName,
          progress : stateName
        }
      } )
    )
  } catch ( error ) {
    console.error( 'Failed to fetch work orders:', error )
    rawList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = newPage => {
  page.value = newPage
  fetchData()
}

const pageStart = computed( () => ( total.value === 0 ? 0 : ( page.value - 1 ) * pageSize.value + 1 ) )

const pageEnd = computed( () => Math.min( page.value * pageSize.value, total.value ) )

const formatDate = iso => {
  if ( !iso ) return ''
  const d = new Date( iso )
  return d.toLocaleDateString()
}

// when the status tab changes, reset to page 1 and refetch
watch(
  () => props.status,
  () => {
    page.value = 1
    fetchData()
  }
)

onBeforeMount( fetchData )
</script>

<style scoped>
.table-wrapper {
  min-height: 285px;
  display: flex;
  flex-direction: column;
}

.table-wrapper :deep(.el-table) {
  flex: 1;
}

.table-foot {
  padding: 6px 12px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: auto;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
:deep(.el-tag--released) {
  background-color: #faf4ff !important; /* ultra light lilac */
  border-color: #e5d4ff !important; /* soft pale lavender */
  color: #9b59b6 !important; /* gentle purple text */
}
:deep(.el-tag--pendingApproval) {
  background-color: #fff9e6 !important; /* soft light yellow */
  border-color: #ffe18d !important; /* warm golden border */
  color: #efc31d !important; /* slightly darker than #FFDE21 */
}
:deep(.el-tag--pending) {
  background-color: #fdf7f2 !important; /* extremely light cream-beige */
  border-color: #e8cbb0 !important; /* soft tan border */
  color: #a46a3f !important; /* warm medium brown text */
}
</style>
