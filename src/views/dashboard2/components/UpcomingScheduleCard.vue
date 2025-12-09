<template>
  <!-- flat content – parent .panel is the card -->
  <div class="upcoming">
    <!-- header -->
    <div class="up-header">
      <div class="up-title">Upcoming Schedule</div>

      <div class="up-controls">
        <el-button-group>
          <el-button size="small" :type="range === 'today' ? 'primary' : 'default'" @click="setRange('today')">
            Today
          </el-button>
          <el-button size="small" :type="range === 'week' ? 'primary' : 'default'" @click="setRange('week')">
            This Week
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- body -->
    <div class="up-body">
      <div v-if="schedule.length" class="schedule-list">
        <div v-for="item in schedule" :key="item.id" class="schedule-row">
          <!-- LEFT: date + time -->
          <div class="schedule-date">
            <div class="schedule-day">{{ item.day }}</div>
            <div class="schedule-time">{{ item.time }}</div>
          </div>

          <!-- RIGHT: title + meta -->
          <div class="schedule-main">
            <div class="schedule-title">
              {{ item.title }}
            </div>

            <div class="schedule-sub">
              <span v-if="item.code">{{ item.code }}</span>
              <span v-if="item.endDisplay"> · Ends {{ item.endDisplay }}</span>
              <span v-if="item.state"> · {{ item.state }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="schedule-empty">No upcoming schedule during this period</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { searchWorkOrders } from 'src/api/work-order'

const schedule = ref( [] )
const range = ref( 'today' )

function formatDay( dateStr ) {
  const d = new Date( dateStr )
  return d.toLocaleDateString( undefined, {
    weekday : 'short',
    month : 'short',
    day : 'numeric'
  } )
}

function formatTime( dateStr ) {
  const d = new Date( dateStr )
  return d.toLocaleTimeString( undefined, {
    hour : '2-digit',
    minute : '2-digit',
    hour12 : true
  } )
}

function normalizeState( raw ) {
  if ( !raw ) return ''
  const s = String( raw ).trim().toLowerCase()

  if ( s === 'forecast' ) return 'Forecast'
  if ( s === 'released' ) return 'Released'
  if ( s === 'pending' ) return 'Pending'
  if ( s === 'ready' ) return 'Ready'
  if ( s === 'in progress' || s === 'in_progress' ) return 'In Progress'
  if ( s === 'completed' ) return 'Completed'
  if ( s === 'aborted' ) return 'Aborted'
  if ( s === 'held' ) return 'Held'
  if ( s === 'suspended' ) return 'Suspended'
  if ( s === 'closed' ) return 'Closed'
  if ( s === 'failed' ) return 'Failed'
  if ( s === 'incomplete' ) return 'Incomplete'
  if ( s === 'pending approval' || s === 'pending_approval' ) {
    return 'Pending Approval'
  }

  return s.charAt( 0 ).toUpperCase() + s.slice( 1 )
}

function getDateRange() {
  const start = new Date()
  start.setHours( 0, 0, 0, 0 )

  const end = new Date( start )

  if ( range.value === 'today' ) {
    end.setHours( 23, 59, 59, 999 )
  } else {
    const day = end.getDay()
    const daysToSunday = ( 7 - day ) % 7
    end.setDate( end.getDate() + daysToSunday )
    end.setHours( 23, 59, 59, 999 )
  }

  return { start, end }
}

async function loadSchedule() {
  const { start, end } = getDateRange()

  const payload = {
    latest_per_recurrence : false,
    start_date_from : start.toISOString(),
    start_date_to : end.toISOString()
  }

  try {
    const res = await searchWorkOrders( 1, 20, 'startDate', 'ASC', payload )

    const root = res?.data ?? res
    const raw = root?.data?.content ?? root?.content ?? root?.records ?? root?.list ?? root?.items ?? root?.rows ?? []

    schedule.value = raw.map( r => {
      const startDate = r.start_date
      const endDate = r.end_date

      const name = r.name || r.title || 'Work Order'
      const code = r.code || r.wo_code || ''
      const rawState = r.state?.name || r.state_name || r.status_name || r.status || ''
      const stateLabel = normalizeState( rawState )

      const endDisplay = endDate ? `${formatDay( endDate )} ${formatTime( endDate )}` : ''

      return {
        id : r.id ?? code ?? name,
        day : formatDay( startDate ),
        time : formatTime( startDate ),
        title : name,
        code,
        state : stateLabel,
        endDisplay
      }
    } )
  } catch ( err ) {
    console.error( 'Failed to fetch schedule:', err )
    schedule.value = []
  }
}

function setRange( v ) {
  if ( range.value === v ) return
  range.value = v
}

onMounted( loadSchedule )
watch( range, loadSchedule )
</script>

<style scoped lang="scss">
/* root is flat – parent .panel gives card look */
.upcoming {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* header */
.up-header {
  padding: 14px 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.up-title {
  font-weight: 550;
  font-size: 16px;
  color: #111827;
}

.up-controls {
  display: flex;
  align-items: center;
}

/* body */
.up-body {
  padding: 8px 16px 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* list of rows */
.schedule-list {
  margin-top: 14px;
  max-height: 220px; /* ~3 rows */
  overflow-y: auto;
}

/* each row similar to your reference screenshot */
.schedule-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  column-gap: 32px;
  padding: 14px 0;
  align-items: flex-start;
}

/* left column – date + time */
.schedule-date {
  font-size: 13px;
  line-height: 1.4;
  color: #848b98;
}

.schedule-day {
  margin-bottom: 4px;
}

.schedule-time {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

/* right column – title + subtitle */
.schedule-main {
  flex: 1;
}

.schedule-title {
  font-weight: 550;
  font-size: 15px;
  color: #111827;
  margin-bottom: 4px;
}

.schedule-sub {
  font-size: 13px;
  color: #848b98;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* empty state */
.schedule-empty {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}
</style>
