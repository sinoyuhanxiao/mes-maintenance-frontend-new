<template>
  <div v-loading="props.loading">
    <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="wo-calendar">
      <template #eventContent="{ event, timeText }">
        <div class="fc-ref">
          <!-- Work order event display -->
          <div class="fc-item">
            <span class="fc-title"> {{ timeText }} {{ event.title }} </span>

            <!-- State icon -->
            <el-icon v-if="getIconByStateId(event)" class="status-icon" :color="getColorByStateId(event)">
              <component :is="getIconByStateId(event)" />
            </el-icon>

            <!-- Recurrence icon -->
            <el-icon v-if="recurrenceIcon(event)" class="status-icon">
              <component :is="recurrenceIcon(event)" />
            </el-icon>
          </div>
        </div>
      </template>
    </FullCalendar>
  </div>

  <!-- Tooltip on hover for work order events -->
  <el-popover
    ref="workOrderHoverPopover"
    :visible="popoverVisible"
    virtual-triggering
    :virtual-ref="virtualTrigger"
    :width="popperWidth"
    popper-class="wo-popover"
  >
    <div style="display: flex; align-items: center">
      <!-- Left content -->
      <div style="margin-right: 10px">
        <!-- Priority / Category / Status on same row -->
        <div class="tag-row">
          <!-- ID -->
          <div>
            <el-text size="large" style="font-weight: 600; color: var(--el-color-primary)">
              #{{ popoverData.id }}
            </el-text>
          </div>

          <PriorityTag v-if="popoverData.priority !== null" :priority="popoverData.priority" />
          <CategoryTag v-if="popoverData.category !== null" :category="popoverData.category" />
          <StatusTag v-if="popoverData.state !== null" :status="popoverData.state" />

          <!-- Overdue tag -->
          <el-tag v-if="popoverData.isOverDue" type="danger" size="default" effect="dark">
            {{ $t('workOrder.status.overdue') }}
          </el-tag>
        </div>

        <!-- Work Order Title -->
        <div>
          <el-text tag="b" size="large">{{ popoverData.title }}</el-text>
        </div>

        <!-- Recurrence ID -->
        <div v-if="popoverData.groupId">
          <el-text>{{ $t('workOrder.calendar.recurrenceId') }}: </el-text>
          <el-text>{{ popoverData.groupId }}</el-text>
        </div>

        <div v-if="popoverData.recurrence_type">
          <el-text>{{ $t('workOrder.table.recurrenceType') }}: </el-text>
          <el-text>{{ popoverData.recurrence_type.name }}</el-text>
        </div>

        <div>
          <el-text>{{ $t('workOrder.table.startDate') }}: </el-text>
          <el-text>{{ formatDate(popoverData.startDate) }}</el-text>
        </div>

        <!--        <div v-if="popoverData.endDate">-->
        <!--          <el-text>{{ $t('workOrder.calendar.endDate') }}: </el-text>-->
        <!--          <el-text>{{ formatDate(popoverData.endDate || popoverData.startDate) }}</el-text>-->
        <!--        </div>-->

        <div>
          <el-text>{{ $t('workOrder.table.dueDate') }}: </el-text>
          <el-text :type="getTextTypeByDueDate(popoverData.isOverDue)">
            {{ formatDate(popoverData.dueDate) }}
          </el-text>
        </div>

        <div v-if="popoverData.finished_at">
          <el-text>{{ $t('workOrder.table.finishedDate') }}: </el-text>
          <el-text>
            {{ formatDate(popoverData.finished_at) }}
          </el-text>
        </div>

        <div>
          <el-text>{{ $t('workOrder.calendar.assignedUser') }}: </el-text>
          <template v-for="user in temporaryUserList" :key="user.id">
            <el-tag style="margin-right: 5px">
              {{ user.name }}
            </el-tag>
          </template>
        </div>

        <div v-if="popoverData.equipment_node">
          <el-text>{{ $t('workOrder.calendar.equipment') }}: </el-text>
          <el-text>
            {{ popoverData.equipment_node?.name }}
          </el-text>
        </div>

        <!-- Task Progress -->
        <div style="display: flex">
          <el-text style="margin-right: 10px">{{ $t('workOrder.calendar.taskProgress') }}: </el-text>
          <el-progress
            :percentage="
              popoverData.work_order_progress?.completed_task_amount /
                popoverData.work_order_progress?.total_task_amount || 0
            "
            style="flex: 1"
          />
        </div>
      </div>

      <!-- Image (First one only) -->
      <div class="card-thumbnail-circle" v-if="popoverData.image_list && popoverData.image_list.length">
        <el-image
          :src="popoverData.image_list[0]"
          fit="cover"
          :preview-src-list="popoverData.image_list"
          class="circular-image"
          :z-index="2000"
          preview-teleported
        >
          <template #error>
            <div class="image-slot-circle">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import listPlugin from '@fullcalendar/list'
import enLocale from '@fullcalendar/core/locales/en-gb'
import zhLocale from '@fullcalendar/core/locales/zh-cn'
import { onMounted, ref, reactive, watch, computed, onDeactivated, onActivated } from 'vue'
import { ElPopover } from 'element-plus'
import { CircleCheck, CircleClose, Refresh, Picture } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import { useAppStore } from '@/store'
import PriorityTag from '@/components/WorkOrder/Display/PriorityTag.vue'
import CategoryTag from '@/components/WorkOrder/Display/CategoryTag.vue'
import StatusTag from '@/components/WorkOrder/Display/StatusTag.vue'

const fullCalendarRef = ref( null )
const events = ref( [] )
const appStore = useAppStore()

const props = defineProps( {
  data : {
    type : Array,
    required : true
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['date-range-change', 'view'] )

// Allow parent component to control when to sync full calendar's internal data
defineExpose( {
  refetchEvents : () => {
    fullCalendarRef.value?.getApi()?.refetchEvents()
  }
} )

// Watch app's locale and update calendar's locale and button texts
watch(
  () => appStore.lang,
  newLang => {
    setCalendarLocale( newLang )
  },
  { immediate : true }
)

const currentViewName = ref( '' )

const handleViewMount = arg => {
  currentViewName.value = arg.view.type
}

function getScrollContainer( viewName ) {
  const calendarEl = fullCalendarRef.value?.el || fullCalendarRef.value?.$el
  if ( !calendarEl ) return null

  return calendarEl.querySelector( '.fc-scroller, .fc-scroller-harness .fc-scroller' )
}

const scrollPositions = new Map()

// Remember scroll position when deactivated
onDeactivated( () => {
  const container = getScrollContainer( currentViewName.value )
  if ( container ) {
    scrollPositions.set( currentViewName.value, container.scrollTop )
  }
} )

// Apply scroll position when activated back
onActivated( () => {
  setTimeout( () => {
    const container = getScrollContainer( currentViewName.value )
    if ( container ) {
      const top = scrollPositions.get( currentViewName.value ) ?? 0
      container.scrollTop = top
    }
  }, 0 )
} )

// Trigger repaint when activated
onActivated( () => {
  fullCalendarRef.value?.getApi()?.updateSize()
} )

// Full calendar buttons label map
const buttonTextMap = {
  en : {
    today : 'Today',
    year : 'Year',
    month : 'Month',
    week : 'Week',
    day : 'Day',
    list : 'Weekly List'
  },
  zh : {
    today : '今天',
    year : '年',
    month : '月',
    week : '周',
    day : '日',
    list : '周列表'
  }
}

// Options config for full calendar instance
const calendarOptions = ref( {
  plugins : [dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin, listPlugin],
  initialView : 'dayGridMonth',
  headerToolbar : {
    left : 'today',
    center : 'prev,title,next',
    right : 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  events : events.value,
  // Event source for the calendar. events function is called automatically by FC when it needs new event data. Ex. Prev or next button is clicked
  eventSources : [
    {
      events( fetchInfo, success, failure ) {
        const { startStr, endStr } = fetchInfo
        emit( 'date-range-change', { start_date_from : startStr, end_date_to : endStr, resolve : success, reject : failure } )
      }
    }
  ],
  // FC automatically calls this on each event object
  eventDataTransform : convertWorkOrderDTOToEventFormat,
  eventClick : handleEventClick,
  eventMouseEnter : handleEventMouseEnter,
  eventMouseLeave : handleEventMouseLeave,
  locales : [enLocale, zhLocale],
  locale : 'en',
  aspectRatio : '2.9',
  multiMonthMaxColumns : 1,
  nowIndicator : true,
  nowIndicatorClassNames : ['custom-now-indicator'],
  viewDidMount : handleViewMount,
  eventMaxStack : true,
  dayMaxEventRows : true
} )

// Transform work order dto to full calendar's event object, also decorate event block styling
function convertWorkOrderDTOToEventFormat( raw ) {
  const stateId = raw.state?.id
  const isOverDue = isDateBeforeToday( raw.due_date ) && stateId !== 7 && stateId !== 12 // 7 is completed, 12 is failed

  return {
    id : raw.id,
    title : raw.name,
    start : raw.start_date,
    end : raw.end_date || null,
    groupId : raw.recurrence_uuid || null,
    backgroundColor : isOverDue ? '#fef2f2' : '#f9fafb',
    // borderColor : overdue ? '#fef2f2' : '#dddddd',
    borderColor : '#dddddd',
    textColor : isOverDue ? 'red' : 'black',
    display : 'block', // other options are 'auto' ,'list-item'
    extendedProps : {
      ...raw,
      stateId,
      dueDate : raw.due_date,
      categories : raw.categories,
      stateName : raw.state?.name,
      priorityId : raw.priority?.id,
      priorityName : raw.priority?.name,
      image_list : raw.image_list || [],
      work_order_progress : raw.work_order_progress || null,
      equipment_node : raw.equipment_node || null,
      isOverDue
    }
  }
}

function handleEventClick( arg ) {
  emit( 'view', { id : arg.event.id } )
}

const getIconByStateId = ( { extendedProps } ) => {
  const id = extendedProps.stateId
  return id === 7 ? CircleCheck : id === 12 ? CircleClose : undefined // null → v-if removes wrapper
}

const recurrenceIcon = event => {
  const groupId = event.groupId
  const recurrenceId = event.extendedProps.recurrence_type?.id || null
  return !!groupId !== false && recurrenceId != null && recurrenceId !== 1 ? Refresh : undefined // null → v-if removes wrapper
}

const getColorByStateId = ( { extendedProps } ) => {
  const id = extendedProps.stateId
  return id === 7 ? 'green' : id === 12 ? 'red' : '' // null → v-if removes wrapper
}

const getTextTypeByDueDate = isOverDue => {
  return isOverDue ? 'danger' : 'default' // null → v-if removes wrapper
}

// Virtual popover and trigger for work order on hover tooltip
const workOrderHoverPopover = ref()

const virtualTrigger = ref( {
  getBoundingClientRect : () => new DOMRect( 0, 0, 0, 0 ),
  contextElement : document.body
} )

const popoverVisible = ref( false )

const popoverData = reactive( {
  id : '',
  gropuId : '',
  title : '',
  startDate : '',
  endDate : '',
  dueDate : '',
  finished_at : '',
  priority : null,
  category : null,
  state : null,
  stateId : '',
  stateName : '',
  recurrence_type : null,
  image_list : [],
  isOverDue : null
} )

// Added delays for show/hide hover popover to ease the transition, prevent distracting rapid toggling
const showDelayMs = 250
const hideDelayMs = 100
let hoverTimer = null
let hideTimer = null

function handleEventMouseEnter( mouseEnterInfo ) {
  const { event, jsEvent } = mouseEnterInfo
  const { clientX, clientY } = jsEvent

  // Cancel pending hide (if user hovered back in quickly)
  if ( hideTimer ) {
    clearTimeout( hideTimer )
  }

  // Cancel previous show attempt
  if ( hoverTimer ) {
    clearTimeout( hoverTimer )
    hoverTimer = null
  }

  hoverTimer = window.setTimeout( () => {
    // Populate data through hover event's data
    popoverData.id = event.id
    popoverData.groupId = event.groupId
    popoverData.title = event.title
    popoverData.startDate = event.start
    popoverData.endDate = event.end
    popoverData.finished_at = event.extendedProps.finished_at
    popoverData.priority = event.extendedProps.priority
    popoverData.category = event.extendedProps.categories
    popoverData.dueDate = event.extendedProps.dueDate
    popoverData.state = event.extendedProps.state
    popoverData.stateId = event.extendedProps.stateId
    popoverData.stateName = event.extendedProps.stateName
    popoverData.recurrence_type = event.extendedProps.recurrence_type
    popoverData.image_list = event.extendedProps.image_list
    popoverData.work_order_progress = event.extendedProps.work_order_progress
    popoverData.equipment_node = event.extendedProps.equipment_node
    popoverData.isOverDue = event.extendedProps.isOverDue

    // Set the virtual reference for the popover position based on mouse hover event position
    virtualTrigger.value.getBoundingClientRect = () => new DOMRect( clientX, clientY, 0, 0 )
    virtualTrigger.value.contextElement = document.body
    popoverVisible.value = true
  }, showDelayMs )
}

function handleEventMouseLeave( mouseLeaveInfo ) {
  if ( hoverTimer ) {
    clearTimeout( hoverTimer )
  }

  hideTimer = window.setTimeout( () => {
    popoverVisible.value = false
    hideTimer = null
  }, hideDelayMs )
}

const formatDate = d => ( d ? convertToLocalTime( d ) : '-' )

function setCalendarLocale( locale ) {
  const calendarApi = fullCalendarRef.value?.getApi()

  if ( calendarApi ) {
    calendarApi.setOption( 'locale', locale )
    calendarApi.setOption( 'buttonText', buttonTextMap[locale] )
  }
}

function isDateBeforeToday( dueDateStr ) {
  if ( !dueDateStr ) return false

  const today = new Date()
  today.setHours( 0, 0, 0, 0 )

  const dueDate = new Date( dueDateStr )
  return dueDate < today
}

const popperWidth = computed( () => {
  return popoverData.image_list && popoverData.image_list.length > 0 ? 540 : 420
} )

// TODO: Sample user data, swap with data using user service api once its ready
const temporaryUserList = [
  { id : 1, name : 'Erik Yu' },
  { id : 2, name : 'Jane Smith' },
  { id : 3, name : 'Mike Johnson' }
]

// const loadedMonths = new Set<String>()
//
// function parseMonthTextToDate(text) {
//   // Supports "August 2025" or localized versions
//   try {
//     return new Date(`${text} 1`) // Adds day to ensure parse success
//   } catch {
//     return null
//   }
// }
//
// async function fetchEventsForMonth(date) {
//   const start = new Date(date.getFullYear(), date.getMonth(), 1)
//   const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
//
//   const start_date_from = start.toISOString().split('T')[0]
//   const end_date_to = end.toISOString().split('T')[0]
//
//   try {
//     const response = await fetchWorkOrders({
//       start_date_from,
//       end_date_to,
//       page: 1,
//       limit: 500,
//     })
//
//     const events = response.data.map(convertWorkOrderDTOToEventFormat)
//     const calendarApi = fullCalendarRef.value?.getApi()
//     calendarApi?.addEventSource(events)
//   } catch (e) {
//     console.error(`Failed to load events for ${start_date_from}`, e)
//   }
// }
//
//
// function handleLazyScroll(e) {
//   const container = e.target
//   const monthEls = container.querySelectorAll('.fc-multimonth-month')
//
//   monthEls.forEach(monthEl => {
//     const rect = monthEl.getBoundingClientRect()
//     const containerRect = container.getBoundingClientRect()
//
//     // Check if this month is partially or fully visible in the scroll container
//     const isVisible =
//         rect.bottom > containerRect.top && rect.top < containerRect.bottom
//
//     if (isVisible) {
//       const headerEl = monthEl.querySelector('.fc-multimonth-month-header')
//       if (!headerEl) return
//
//       const monthText = headerEl.textContent?.trim()
//       const parsedDate = parseMonthTextToDate(monthText)
//       if (!parsedDate) return
//
//       const yearMonthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
//
//       if (!loadedMonths.has(yearMonthKey)) {
//         loadedMonths.add(yearMonthKey)
//         fetchEventsForMonth(parsedDate) // 👈 you define this
//       }
//     }
//   })
// }

onMounted( () => {
  setCalendarLocale( appStore.lang )

  // const container = fullCalendarRef.value?.$el.querySelector('.fc-multimonth')
  //
  // if (container) {
  //   container.addEventListener('scroll', handleLazyScroll)
  // }
} )
</script>

<style scoped>
/* full-size reference so hovering anywhere on the event fires the popover */
:deep(.fc-ref) {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%; /* takes full event height */
  overflow: hidden;
}

/* wrapper around event’s content */
:deep(.fc-item) {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Work order title styling */
:deep(.fc-title) {
  flex: 1 1 auto; /* take remaining width, shrink if needed */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis; /* … */
  margin-left: 2px;
}

/* event status icons */
.status-icon {
  flex: 0 0 auto; /* fixed size, never shrinks */
  margin-left: 2px;
  margin-bottom: 2px;
  vertical-align: middle;
}

/* time grid layout now indicator line */
::v-deep(.fc-timegrid-now-indicator-line) {
  border-color: #60aeff !important;
}

/* today background color */
::v-deep(.fc-day-today) {
  background-color: #ecf5ff !important;
}

/* today date's text color */
::v-deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  color: #60aeff !important;
}

/* FC header toolbar button style */
::v-deep(.fc .fc-button-primary) {
  background-color: #ffffff;
  border-color: #ebeef5;
  color: #707276;
}

/* FC header toolbar button active style */
::v-deep(.fc-button-primary:not(:disabled).fc-button-active),
::v-deep(.fc-button-primary:not(:disabled):active) {
  color: #60aeff !important;
  background-color: #ffffff;
  border-color: #ebeef5;
}

/* Now indicator arrow style */
::v-deep(.fc-timegrid-now-indicator-arrow) {
  width: 0;
  height: 0;
  border-left: 5px solid #60aeff;
  border-right: 5px solid transparent;
  border-top: 5px solid transparent; /* <-- This is your desired color */
  position: absolute;
  margin-top: -5px;
  z-index: 4;
}

/* FC button hover style */
::v-deep(.fc-button-group > .fc-button:not(.fc-button-active):hover) {
  color: #60aeff !important;
}

::v-deep(.fc-theme-standard .fc-popover) {
  background: var(--el-bg-color); /* match Element Plus dialog bg */
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px; /* rounded corners like dialogs */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* subtle shadow */
  overflow: hidden; /* ensures rounded corners clip contents */
  z-index: 2;
}

/* Optional: adjust popover header if needed */
::v-deep(.fc-theme-standard .fc-popover .fc-popover-header) {
  padding: 8px 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* Optional: adjust popover content */
::v-deep(.fc-theme-standard .fc-popover .fc-popover-body) {
  padding: 8px 12px;
}

::v-deep(.fc-toolbar) {
  flex-wrap: nowrap !important; /* prevent wrapping */
}

::v-deep(.fc-toolbar-chunk:nth-child(2) > div) {
  display: flex !important; /* make sure it's flex row */
  align-items: center !important;
  gap: 10px; /* optional spacing */
}

.tag-row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  z-index: 9999;
}

::v-deep(.wo-popper .el-progress--line) {
  max-width: 200px;
}

.card-thumbnail-circle {
  flex-shrink: 0;
  width: 120px;
  height: 120px;

  .circular-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--el-border-color-lighter);
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
      transform: scale(1.05);
    }

    /* Only apply border-radius to the image container, not the preview */
    :deep(.el-image__inner) {
      border-radius: 50%;
      object-fit: cover;
    }

    /* Ensure preview functionality works correctly */
    :deep(.el-image__preview) {
      border-radius: 0 !important;
    }
  }

  .image-slot-circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 24px;
    border-radius: 50%;
    border: 2px solid var(--el-border-color-lighter);
  }
}
</style>
