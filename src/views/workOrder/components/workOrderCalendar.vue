<template>
  <div v-loading="props.loading" class="calendar-root-container">
    <FullCalendar ref="fullCalendarRef" :options="calendarOptions">
      <template #eventContent="{ event, timeText }">
        <div class="fc-ref">
          <!-- Work order event display -->
          <div
            class="fc-item"
            :class="{
              'fc-item-hover': hoveredEventId === event.id,
              'fc-item-selected': selectedEventId === event.id,
            }"
          >
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

    <el-dialog
      v-model="showWorkOrderModalDialog"
      :modal="false"
      :modal-penetrable="true"
      :show-close="true"
      class="wo-custom-dialog"
      :top="workOrderDialogTop"
      width="520px"
    >
      <template #header>
        <div class="work-order-popover-header">
          <!-- ID -->
          <div>
            <el-text size="large" style="font-weight: 600; color: var(--el-color-primary)">
              #{{ workOrderDialogEventData.id }}
            </el-text>
          </div>

          <div>
            <el-button :icon="View" @click="goToDetail(workOrderDialogEventData.id)">
              {{ 'View Detail' }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="work-order-popover-root">
        <div class="content">
          <!-- Left content -->
          <div class="left-section">
            <!-- Work Order Title -->
            <div style="flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 350px">
              <el-tooltip placement="top" effect="dark" :content="workOrderDialogEventData.title">
                <el-text tag="b" size="large">{{ workOrderDialogEventData.title }}</el-text>
              </el-tooltip>
            </div>

            <!--                <div v-if="event.extendedProps.recurrence_type">-->
            <!--                  <el-text>{{ $t('workOrder.table.recurrenceType') }}: </el-text>-->

            <!--                  <el-text>{{ event.extendedProps.recurrence_type.name }}</el-text>-->
            <!--                </div>-->

            <div>
              <el-text class="item-label">{{ $t('workOrder.table.startDate') }}: </el-text>

              <el-text class="item-value">
                {{ formatDate(workOrderDialogEventData.start) }}
              </el-text>
            </div>

            <!--        <div v-if="popoverData.endDate">-->
            <!--          <el-text>{{ $t('workOrder.calendar.endDate') }}: </el-text>-->
            <!--          <el-text>{{ formatDate(popoverData.endDate || popoverData.startDate) }}</el-text>-->
            <!--        </div>-->

            <div>
              <el-text class="item-label">{{ $t('workOrder.table.dueDate') }}: </el-text>

              <el-text
                class="item-value"
                :type="getTextTypeByDueDate(workOrderDialogEventData.extendedProps.isOverDue)"
              >
                {{ formatDate(workOrderDialogEventData.extendedProps.dueDate) }}
              </el-text>
            </div>

            <!--                <div v-if="event.extendedProps.finished_at">-->
            <!--                  <el-text>{{ $t('workOrder.table.finishedDate') }}: </el-text>-->
            <!--                  <el-text>-->
            <!--                    {{ formatDate(event.extendedProps.finished_at) }}-->
            <!--                  </el-text>-->
            <!--                </div>-->

            <div
              v-if="
                workOrderDialogEventData.extendedProps.user_list &&
                workOrderDialogEventData.extendedProps.user_list.length > 0
              "
              style="display: flex; flex-direction: row; gap: 8px"
            >
              <el-text class="item-label">{{ $t('workOrder.calendar.assignedUser') }}: </el-text>

              <el-tooltip placement="top" effect="dark" :content="fullAssignedUserList">
                <div class="assigned-users-text">
                  {{ truncatedAssignedUserList }}
                </div>
              </el-tooltip>
            </div>

            <!--                  <div v-if="event.extendedProps.equipment_node_ids && event.extendedProps.equipment_node_ids.length > 0">-->
            <!--                    <el-text class="item-label">{{ $t('workOrder.calendar.equipment') }}: </el-text>-->

            <!--                    <template v-for="e in event.extendedProps.equipment_node_ids" :key="e">-->
            <!--                      <el-text class="item-value" style="margin-right: 8px">{{ e }}</el-text>-->
            <!--                    </template>-->
            <!--                  </div>-->

            <!-- Task Progress -->
            <div style="display: flex">
              <el-text class="item-label" style="margin-right: 8px">{{ 'Progress' }}: </el-text>

              <el-progress
                :percentage="
                  Number(
                    (
                      (workOrderDialogEventData.extendedProps.work_order_progress?.completed_task_amount /
                        workOrderDialogEventData.extendedProps.work_order_progress?.total_task_amount || 0) * 100
                    ).toFixed(2)
                  )
                "
                style="flex: 1"
              />
            </div>

            <!-- Badges (state , priority, category, is over due) -->
            <div class="tag-row">
              <el-tag
                :type="getStateTagType(workOrderDialogEventData.extendedProps.state?.name)"
                :effect="getStateTagEffect(workOrderDialogEventData.extendedProps.state?.name)"
              >
                {{ getStatusName(workOrderDialogEventData.extendedProps.state?.name) }}
              </el-tag>

              <el-tag :type="getPriorityTagType(workOrderDialogEventData.extendedProps.priority?.name)" effect="plain">
                <el-icon style="margin: 0 0 4px 0">
                  <Flag />
                </el-icon>
                {{ getPriorityName(workOrderDialogEventData.extendedProps.priority?.name) }}
              </el-tag>

              <RecurrenceTag
                v-if="
                  workOrderDialogEventData.extendedProps.recurrence_type &&
                  workOrderDialogEventData.extendedProps.recurrence_type.id !== 1
                "
                :recurrence-type="workOrderDialogEventData.extendedProps.recurrence_type"
              />

              <div v-for="category in workOrderDialogEventData.extendedProps.category_list" :key="category.id">
                <CategoryTag :category="category" />
              </div>

              <!-- Overdue tag -->
              <el-tag v-if="workOrderDialogEventData.extendedProps.isOverDue" type="danger" effect="dark">
                {{ $t('workOrder.status.overdue') }}
              </el-tag>
            </div>
          </div>

          <!-- Image (First one only) -->
          <div
            class="card-thumbnail-circle"
            v-if="
              workOrderDialogEventData.extendedProps.image_list &&
              workOrderDialogEventData.extendedProps.image_list.length
            "
          >
            <el-image
              :src="workOrderDialogEventData.extendedProps.image_list[0]"
              fit="cover"
              :preview-src-list="workOrderDialogEventData.extendedProps.image_list"
              class="circular-image"
              :z-index="9999"
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
      </div>
    </el-dialog>
  </div>
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
import { onMounted, ref, watch, onDeactivated, onActivated, onBeforeUnmount, computed } from 'vue'
import { CircleCheck, CircleClose, Refresh, Picture, View, Flag } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import { useAppStore } from '@/store'
import CategoryTag from '@/components/WorkOrder/Display/CategoryTag.vue'
import { getStateTagEffect, getStateTagType } from '@/components/WorkOrder/utils/stateUtils'
import RecurrenceTag from '../../../components/WorkOrder/Display/RecurrenceTag.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

let observer = null
let lastPopoverId = null
let adjustScheduled = false
const showWorkOrderModalDialog = ref( false )
const workOrderDialogEventData = ref( null )
const workOrderDialogLeft = ref( '0px' )
const workOrderDialogTop = ref( '0px' )
const hoveredEventId = ref( null )
const selectedEventId = ref( null )

onMounted( () => {
  observer = new MutationObserver( () => {
    adjustMorePopoverPosition()
  } )

  observer.observe( document.body, { childList : true, subtree : true } )
} )

onBeforeUnmount( () => {
  observer?.disconnect()
} )

window.addEventListener( 'resize', () => {
  lastPopoverId = null // force recompute
  adjustMorePopoverPosition()
} )

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

  showWorkOrderModalDialog.value = false
  selectedEventId.value = null
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
  eventTimeFormat : {
    hour : '2-digit',
    minute : '2-digit',
    hour12 : false
  },
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
  dayMaxEventRows : true,
  dayMaxEvents : true,
  // multiMonthMaxColumns : 1, // This sets multiMonthYear view to be stacked of months
  eventMaxStack : 6,
  eventClick : handleEventClick,
  eventMouseEnter : handleEventMouseEnter,
  eventMouseLeave : handleEventMouseLeave,
  locales : [enLocale, zhLocale],
  locale : 'en',
  nowIndicator : true,
  nowIndicatorClassNames : ['custom-now-indicator'],
  viewDidMount : handleViewMount,
  height : '100%',
  contentHeight : '100%'
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
    backgroundColor : isOverDue ? '#fef2f2' : '#4285F4',
    // borderColor : overdue ? '#fef2f2' : '#dddddd',
    borderColor : isOverDue ? '#909399FF' : '#4285F4',
    textColor : isOverDue ? 'red' : 'white',
    display : 'block', // other options are 'auto' ,'list-item'
    extendedProps : {
      ...raw,
      stateId,
      dueDate : raw.due_date,
      category_list : raw.category_list,
      stateName : raw.state?.name,
      priorityId : raw.priority?.id,
      priorityName : raw.priority?.name,
      image_list : raw.image_list,
      work_order_progress : raw.work_order_progress || null,
      equipment_node_ids : raw.equipment_node_ids || null,
      isOverDue,
      user_list : raw.user_list
    }
  }
}

function handleEventClick( info ) {
  selectedEventId.value = info.event.id
  openWorkOrderDialog( info.event, info.jsEvent, info.el )
}

function handleEventMouseEnter( info ) {
  hoveredEventId.value = info.event.id
}

function handleEventMouseLeave( info ) {
  if ( hoveredEventId.value === info.event.id ) {
    hoveredEventId.value = null
  }
}

function goToDetail( id ) {
  emit( 'view', { id } )
}

document.addEventListener( 'click', e => {
  // ignore inside dialog
  if ( e.target.closest( '.wo-custom-dialog' ) ) {
    console.log( 'clicked event target closest to .wo-custom-dialog' )
    return
  }

  // ignore FullCalendar events
  if ( e.target.closest( '.fc-event' ) ) {
    console.log( 'clicked event target closest to .fc-event' )
    return
  }

  selectedEventId.value = null
} )

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
  return isOverDue ? 'danger' : 'primary' // null → v-if removes wrapper
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

function adjustMorePopoverPosition() {
  const popover = document.querySelector( '.fc-popover' )

  if ( !popover ) {
    return
  }

  const currentPopoverId = popover.dataset.adjustId

  // Assign an id if missing
  if ( !currentPopoverId ) {
    popover.dataset.adjustId = Date.now() + Math.random()
  }

  // Skip if this is the same popover, and we already adjusted
  if ( lastPopoverId === popover.dataset.adjustId ) {
    return
  }

  // Debounce: only run once per animation frame
  if ( adjustScheduled ) {
    return
  }

  adjustScheduled = true

  requestAnimationFrame( () => {
    doPopoverAdjustment( popover )
    lastPopoverId = popover.dataset.adjustId
    adjustScheduled = false
  } )
}

function doPopoverAdjustment( popover ) {
  const margin = 8
  const parent = popover.offsetParent || document.body
  const bounds = parent.getBoundingClientRect()

  // Get initial rect
  let rect = popover.getBoundingClientRect()

  const availableAbove = rect.top - bounds.top - margin
  const availableBelow = bounds.bottom - rect.top - margin
  const availableHeight = Math.max( availableBelow, availableAbove )

  // Apply max-height before correcting position
  popover.style.maxHeight = availableHeight + 'px'

  const body = popover.querySelector( '.fc-popover-body' )
  if ( body ) {
    body.style.maxHeight = availableHeight - 40 + 'px'
  }

  // Re-measure after height changes
  rect = popover.getBoundingClientRect()

  // Now compute corrected position using UPDATED rect
  let newLeft = rect.left
  let newTop = rect.top

  // Horizontal correction
  if ( rect.right > bounds.right - margin ) {
    newLeft = bounds.right - rect.width - margin
  }
  if ( rect.left < bounds.left + margin ) {
    newLeft = bounds.left + margin
  }

  // Vertical correction
  if ( rect.bottom > bounds.bottom - margin ) {
    newTop = bounds.bottom - rect.height - margin
  }
  if ( rect.top < bounds.top + margin ) {
    newTop = bounds.top + margin
  }

  // Convert to parent-relative coords
  const offsetLeft = newLeft - bounds.left
  const offsetTop = newTop - bounds.top

  popover.style.left = offsetLeft + 'px'
  popover.style.top = offsetTop + 'px'
}

const getStatusName = status => {
  const statusMap = {
    Failed : t( 'workOrder.status.failed' ),
    Completed : t( 'workOrder.status.completed' ),
    'In Progress' : t( 'workOrder.status.inProgress' ),
    Pending : t( 'workOrder.status.pending' )
  }
  return statusMap[status] || status
}

const getPriorityTagType = priority => {
  switch ( priority ) {
    case 'Urgent':
      return 'danger'
    case 'High':
      return 'primary'
    case 'Medium':
      return 'warning'
    case 'Low':
      return 'info'
    default:
      return 'info'
  }
}

const getPriorityName = priority => {
  const priorityMap = {
    Urgent : t( 'workOrder.priority.urgent' ),
    High : t( 'workOrder.priority.high' ),
    Medium : t( 'workOrder.priority.medium' ),
    Low : t( 'workOrder.priority.low' )
  }
  return priorityMap[priority] || priority
}

function openWorkOrderDialog( event, jsEvent, eventEl ) {
  workOrderDialogEventData.value = event
  showWorkOrderModalDialog.value = true

  // --- Constants ---
  const rect = eventEl.getBoundingClientRect()
  const screenW = window.innerWidth
  const screenH = window.innerHeight

  const dialogW = 520
  const dialogH = 200
  const hMargin = 16

  const eventHeight = rect.height
  if ( eventHeight > dialogH * 1.5 ) {
    const centeredTop = rect.top + eventHeight / 2 - dialogH / 2
    const safeTop = Math.max( 16, Math.min( centeredTop, screenH - dialogH - 16 ) )
    workOrderDialogTop.value = safeTop + 'px'

    const canPlaceLeft = rect.left >= dialogW + hMargin
    workOrderDialogLeft.value = canPlaceLeft ? rect.left - dialogW - hMargin + 'px' : rect.right + hMargin + 'px'

    return
  }

  const spaceAbove = rect.top
  const spaceBelow = screenH - rect.bottom

  const isFullRowEvent = rect.width >= screenW * 0.7

  // FULL-ROW EVENT (span whole row → place above or below)
  if ( isFullRowEvent ) {
    const shouldPlaceAbove = spaceAbove >= dialogH || spaceAbove > spaceBelow

    const topPos = shouldPlaceAbove ? rect.top - dialogH : rect.bottom

    workOrderDialogTop.value = Math.max( 0, topPos ) + 'px'

    // center horizontally
    workOrderDialogLeft.value = screenW / 2 - 260 + 'px'
    return
  }

  // NORMAL EVENT (left/right, then top adjustment)

  const canPlaceLeft = rect.left >= dialogW + hMargin

  workOrderDialogLeft.value = canPlaceLeft ? rect.left - dialogW - hMargin + 'px' : rect.right + hMargin + 'px'

  // Vertical placement (avoid clipping)
  const clippedBottom = spaceBelow <= dialogH
  const clippedTop = spaceAbove <= dialogH

  if ( clippedBottom && !clippedTop ) {
    // place above
    workOrderDialogTop.value = rect.top - dialogH + 'px'
  } else if ( clippedTop && !clippedBottom ) {
    // place at bottommost available position
    workOrderDialogTop.value = screenH - dialogH + 'px'
  } else {
    // normal placement
    workOrderDialogTop.value = rect.top + 'px'
  }
}

const fullAssignedUserList = computed( () => {
  const list = workOrderDialogEventData.value?.extendedProps?.user_list || []
  return list.map( u => u.first_name + ' ' + u.last_name ).join( ', ' )
} )

const truncatedAssignedUserList = computed( () => {
  return fullAssignedUserList.value
} )

onMounted( () => {
  setCalendarLocale( appStore.lang )
} )
</script>

<style scoped lang="scss">
.calendar-root-container {
  height: 100%;
}

.work-order-popover-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: -8px;
}

.work-order-popover-root {
  display: flex;
  flex-direction: column;

  .content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .left-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      width: 100%;
      min-width: 0;

      .item-label {
        margin-right: 8px;
        color: var(--el-text-color-secondary) !important;
      }

      .item-value {
        color: var(--el-text-color-primary) !important;
      }
    }

    .card-thumbnail-circle {
      flex-shrink: 0;
      width: 120px;
      height: 120px;

      .circular-image {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--el-border-color-lighter);
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;

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
      }
    }
  }
}

.tag-row {
  display: flex;
  gap: 10px;
}

.assigned-users-text {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 250px;
  color: var(--el-text-color-primary);
}

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
  min-height: 20px;
  cursor: pointer;
}

:deep(.fc-item-hover) {
  background-color: #3b73d0 !important;
}

/* Allow event shadows */
:deep(.fc-event),
:deep(.fc-daygrid-event),
:deep(.fc-event-main),
:deep(.fc-ref),
:deep(.fc-item) {
  overflow: visible !important;
}

:deep(.fc-item-selected) {
  z-index: 50 !important; /* ensure it floats above siblings */
  position: relative;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.2);
}

:deep(.fc-event) {
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

/* Work order title styling */
:deep(.fc-title) {
  flex: 1 1 auto; /* take remaining width, shrink if needed */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis; /* … */
  padding-right: 6px;
  padding-left: 4px;
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
  //overflow: hidden; /* ensures rounded corners clip contents */
  //z-index: 2;
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

::v-deep(.fc-popover-body) {
  max-height: inherit; /* will be set dynamically */
  overflow-y: auto;
}

::v-deep(.fc-toolbar) {
  flex-wrap: nowrap !important; /* prevent wrapping */
}

::v-deep(.fc-toolbar-chunk:nth-child(2) > div) {
  display: flex !important; /* make sure it's flex row */
  align-items: center !important;
  gap: 10px; /* optional spacing */
}

::v-deep(.wo-popper .el-progress--line) {
  max-width: 200px;
}

:deep(.wo-custom-dialog) {
  position: fixed !important;
  left: v-bind(workOrderDialogLeft) !important;
  top: v-bind(workOrderDialogTop) !important;
  margin: 0 !important;
  transform: none !important;
  pointer-events: auto; /* restore interaction for dialog */
  border: 2px solid var(--el-border-color);
  border-radius: 10px;
  transition: top 0.18s ease, left 0.18s ease;
}
</style>