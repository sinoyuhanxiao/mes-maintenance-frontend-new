<template>
  <div class="recurrence-editor">
    <el-form-item
      :label="$t('workOrder.create.recurrenceSettings')"
      prop="recurrence_type"
      :show-message="false"
      required
    >
      <el-select
        v-model="recurrence"
        :placeholder="$t('workOrder.placeholder.selectRecurrence')"
        style="width: 500px"
        clearable
      >
        <el-option :label="$t('workOrder.recurrence.none')" value="none"></el-option>
        <el-option :label="$t('workOrder.recurrence.daily')" value="daily"></el-option>
        <el-option :label="$t('workOrder.recurrence.weekly')" value="weekly"></el-option>
        <el-option :label="$t('workOrder.recurrence.monthlyByDate')" value="monthlyByDate"></el-option>
        <el-option :label="$t('workOrder.recurrence.yearly')" value="yearly"></el-option>
      </el-select>
    </el-form-item>

    <!-- Weekly Interval Selection -->
    <div v-if="recurrence === 'weekly'" class="weekly-interval-selection">
      <el-form-item label="">
        <div class="repeat-interval">
          <span>{{ $t('workOrder.recurrence.every') }}</span>
          <el-input-number
            v-model="repeatInterval"
            :min="1"
            :max="52"
            style="width: 120px; margin: 0 10px"
          ></el-input-number>
          <span>{{ $t('workOrder.recurrence.weeksRepeat') }}</span>
        </div>
      </el-form-item>
    </div>

    <!-- Days of the Week Selection -->
    <div v-if="recurrence === 'weekly'" class="weekly-selection">
      <el-form-item label="">
        <el-checkbox-group v-model="selectedDays" @change="handleDaySelectionChange">
          <el-checkbox-button :label="1">{{ $t('workOrder.days.monday') }}</el-checkbox-button>
          <el-checkbox-button :label="2">{{ $t('workOrder.days.tuesday') }}</el-checkbox-button>
          <el-checkbox-button :label="3">{{ $t('workOrder.days.wednesday') }}</el-checkbox-button>
          <el-checkbox-button :label="4">{{ $t('workOrder.days.thursday') }}</el-checkbox-button>
          <el-checkbox-button :label="5">{{ $t('workOrder.days.friday') }}</el-checkbox-button>
          <el-checkbox-button :label="6">{{ $t('workOrder.days.saturday') }}</el-checkbox-button>
          <el-checkbox-button :label="0">{{ $t('workOrder.days.sunday') }}</el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
    </div>
  </div>

  <!-- Monthly By Date Selection -->
  <div v-if="recurrence === 'monthlyByDate'" class="monthly-by-date-selection">
    <el-form-item label="">
      <div class="repeat-interval">
        <span>{{ $t('workOrder.recurrence.every') }}</span>
        <el-input-number
          v-model="monthlyRepeatInterval"
          :min="1"
          :max="12"
          style="width: 120px; margin: 0 10px"
        ></el-input-number>
        <span>{{ $t('workOrder.recurrence.monthsOn') }}</span>
        <el-select
          v-model="monthlyDate"
          :placeholder="$t('workOrder.recurrence.selectDate')"
          style="width: 100px; margin: 0 10px"
        >
          <el-option
            v-for="day in 31"
            :key="day"
            :label="`${day}${$t('workOrder.recurrence.dayOfMonth')}`"
            :value="day"
          ></el-option>
        </el-select>
        <span>{{ $t('workOrder.recurrence.repeat') }}</span>
      </div>
    </el-form-item>
  </div>

  <!-- Yearly Selection -->
  <div v-if="recurrence === 'yearly'" class="yearly-selection">
    <el-form-item label="">
      <div class="repeat-interval">
        <span>{{ $t('workOrder.recurrence.every') }}</span>
        <el-input-number v-model="yearlyRepeatInterval" :min="1" :max="10" style="width: 120px; margin: 0 6px" />
        <span>{{ $t('workOrder.recurrence.yearsOn') }}</span>

        <el-select
          v-model="yearlyMonth"
          :placeholder="$t('workOrder.recurrence.selectMonth')"
          style="width: 100px; margin: 0 6px"
        >
          <el-option
            v-for="month in 12"
            :key="month"
            :label="`${month}${$t('workOrder.recurrence.month')}`"
            :value="month"
          />
        </el-select>

        <el-select
          v-model="yearlyDay"
          :placeholder="$t('workOrder.recurrence.selectDate')"
          style="width: 100px; margin: 0 6px"
        >
          <el-option
            v-for="day in 31"
            :key="day"
            :label="`${day}${$t('workOrder.recurrence.dayOfMonth')}`"
            :value="day"
          />
        </el-select>

        <span>{{ $t('workOrder.recurrence.repeat') }}</span>
      </div>
    </el-form-item>
  </div>

  <!-- For 'none' recurrence, use date-time fields -->
  <template v-if="recurrence === 'none'">
    <!-- Start Date Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.startDateTime')"
      prop="recurrence_setting.start_date_time"
      required
      :show-message="false"
    >
      <el-date-picker
        v-model="startDate"
        type="datetime"
        :placeholder="$t('workOrder.recurrence.selectStartTime')"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 500px"
        :disabled-date="disabledStartDate"
        :disabled-hours="disabledStartHours"
        :disabled-minutes="disabledStartMinutes"
      />
      <div v-if="showRecurrenceStartWarning" class="recurrence-warning">
        <el-text type="warning" size="small">
          <el-icon><Warning /></el-icon>
          Recurrence start time should not be before work order start time
        </el-text>
      </div>
    </el-form-item>

    <!-- End Date Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.endDateTime')"
      prop="recurrence_setting.end_date_time"
      required
      :show-message="false"
    >
      <el-date-picker
        v-model="endDate"
        type="datetime"
        :placeholder="$t('workOrder.recurrence.selectEndTime')"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 500px"
        :disabled-date="disabledEndDate"
        :disabled-hours="disabledEndHours"
        :disabled-minutes="disabledEndMinutes"
      />
      <div v-if="showDurationWarning" class="duration-warning">
        <el-text type="warning" size="small">
          <el-icon><Warning /></el-icon>
          Duration: {{ formatDuration(calculateDuration()) }}
        </el-text>
      </div>
    </el-form-item>
  </template>

  <!-- For recurring types, use only time fields -->
  <template v-else-if="['daily', 'weekly', 'monthlyByDate', 'yearly'].includes(recurrence)">
    <!-- Start Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.startTime')"
      prop="recurrence_setting.start_time"
      required
      :show-message="false"
    >
      <el-time-picker
        v-model="startTime"
        :placeholder="$t('workOrder.recurrence.selectStartTime')"
        format="HH:mm"
        value-format="HH:mm:ss"
        style="width: 500px"
      />
    </el-form-item>

    <!-- End Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.endTime')"
      prop="recurrence_setting.end_time"
      required
      :show-message="false"
    >
      <el-time-picker
        v-model="endTime"
        :placeholder="$t('workOrder.recurrence.selectEndTime')"
        format="HH:mm"
        value-format="HH:mm:ss"
        style="width: 500px"
        :disabled-hours="disabledEndTimeHours"
        :disabled-minutes="disabledEndTimeMinutes"
      />
      <div v-if="showTimeDurationInfo" class="duration-info">
        <el-text type="info" size="small">
          <el-icon><Clock /></el-icon>
          Duration: {{ formatDuration(calculateTimeDuration()) }}
        </el-text>
      </div>
      <div v-if="showTimeValidationError" class="time-validation-error">
        <el-text type="danger" size="small">
          <el-icon><Warning /></el-icon>
          End time must be after start time
        </el-text>
      </div>
    </el-form-item>
  </template>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { Warning, Clock } from '@element-plus/icons-vue'
import { getAllRecurrenceTypes } from '@/api/work-order'

const startDate = ref( null )
const endDate = ref( null )
const recurrence = ref( 'none' ) // Initialize with 'none' instead of empty string
const repeatInterval = ref( 1 ) // Control for how many weeks to repeat
const selectedDays = ref( [] ) // Store selected days as numbers (1 to 7)
const monthlyRepeatInterval = ref( 1 ) // Control for how many months to repeat
const monthlyDate = ref( 1 ) // Control for which date to repeat
const yearlyRepeatInterval = ref( 1 ) // Control for how many years to repeat
const yearlyMonth = ref( 1 ) // default to January
const yearlyDay = ref( 1 ) // default to 1st

// New fields for recurring time only
const startTime = ref( null )
const endTime = ref( null )
const props = defineProps( {
  workOrderStartDate : {
    type : String,
    default : null
  },
  workOrderDueDate : {
    type : String,
    default : null
  },
  recurrenceSetting : {
    type : Object,
    default : () => ( {} )
  }
} )

const emit = defineEmits( ['update:recurrenceSetting'] )

// Dynamic recurrence types from backend
const recurrenceTypes = ref( [] )
const recurrenceTypeMap = ref( {} )

// Load recurrence types from API
const loadRecurrenceTypes = async() => {
  try {
    const response = await getAllRecurrenceTypes()
    if ( response.data ) {
      recurrenceTypes.value = response.data

      // Create mapping from name/key to ID
      const mapping = {}
      response.data.forEach( type => {
        // Map based on type name or create a standard mapping
        switch ( type.name?.toLowerCase() || type.type?.toLowerCase() ) {
          case 'none':
          case 'does not repeat':
          case '不重复':
            mapping.none = type.id
            break
          case 'daily':
          case '每日':
            mapping.daily = type.id
            break
          case 'weekly':
          case '每周':
            mapping.weekly = type.id
            break
          case 'monthly':
          case 'monthly (by date)':
          case '每月 (按日期)':
            mapping.monthlyByDate = type.id
            break
          case 'yearly':
          case '每年':
            mapping.yearly = type.id
            break
          default:
            // If we can't match by name, use the ID as key
            mapping[type.id] = type.id
        }
      } )
      recurrenceTypeMap.value = mapping
    }
  } catch ( error ) {
    console.error( 'Failed to load recurrence types:', error )
    // Fallback to hardcoded values if API fails
    recurrenceTypeMap.value = {
      none : 1,
      daily : 2,
      weekly : 3,
      monthlyByDate : 4,
      yearly : 5
    }
  }
}

// Initialize form from incoming recurrence setting
const initializeFromRecurrenceSetting = () => {
  if ( !props.recurrenceSetting || Object.keys( props.recurrenceSetting ).length === 0 ) {
    return
  }

  const setting = props.recurrenceSetting

  // Find the recurrence type string from the ID
  let recurrenceTypeString = 'none'
  if ( setting.recurrence_type ) {
    // Find the string key that maps to this ID
    for ( const [key, value] of Object.entries( recurrenceTypeMap.value ) ) {
      if ( value === setting.recurrence_type ) {
        recurrenceTypeString = key
        break
      }
    }
  }

  recurrence.value = recurrenceTypeString

  // Initialize date/time fields based on type
  if ( recurrenceTypeString === 'none' ) {
    if ( setting.start_date_time ) {
      startDate.value = setting.start_date_time
    }
    if ( setting.end_date_time ) {
      endDate.value = setting.end_date_time
    }
  } else {
    // For recurring types, initialize time fields
    if ( setting.start_time ) {
      startTime.value = setting.start_time
    }
    if ( setting.end_time ) {
      endTime.value = setting.end_time
    }

    // Initialize type-specific fields
    if ( recurrenceTypeString === 'weekly' ) {
      if ( setting.interval ) repeatInterval.value = setting.interval
      if ( setting.days_of_week ) selectedDays.value = setting.days_of_week
    } else if ( recurrenceTypeString === 'monthlyByDate' ) {
      if ( setting.interval ) monthlyRepeatInterval.value = setting.interval
      if ( setting.day_of_month ) monthlyDate.value = setting.day_of_month
    } else if ( recurrenceTypeString === 'yearly' ) {
      if ( setting.interval ) yearlyRepeatInterval.value = setting.interval
      if ( setting.month ) yearlyMonth.value = setting.month
      if ( setting.day_of_month ) yearlyDay.value = setting.day_of_month
    }
  }
}

onMounted( async() => {
  await loadRecurrenceTypes()
  // Initialize after recurrence types are loaded
  initializeFromRecurrenceSetting()
} )

// Watch for changes to recurrenceSetting prop
watch(
  () => props.recurrenceSetting,
  () => {
    if ( Object.keys( recurrenceTypeMap.value ).length > 0 ) {
      initializeFromRecurrenceSetting()
    }
  },
  { deep : true }
)

// Date validation functions
const disabledStartDate = date => {
  // Allow dates from 30 days ago to 2 years in the future
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 )

  const twoYearsFromNow = new Date()
  twoYearsFromNow.setFullYear( twoYearsFromNow.getFullYear() + 2 )

  // Check if date is outside the general allowed range
  if ( date < thirtyDaysAgo || date > twoYearsFromNow ) {
    return true
  }

  // If work order start date is provided, recurrence start cannot be before it
  if ( props.workOrderStartDate ) {
    const workOrderStart = new Date( props.workOrderStartDate )
    workOrderStart.setHours( 0, 0, 0, 0 ) // Reset time for date-only comparison

    const compareDate = new Date( date )
    compareDate.setHours( 0, 0, 0, 0 )

    return compareDate < workOrderStart
  }

  return false
}

const disabledEndDate = date => {
  if ( !startDate.value ) return false

  const start = new Date( startDate.value )
  start.setHours( 0, 0, 0, 0 )

  const twoYearsFromNow = new Date()
  twoYearsFromNow.setFullYear( twoYearsFromNow.getFullYear() + 2 )

  // Check if date is before start date or beyond 2 years
  if ( date < start || date > twoYearsFromNow ) {
    return true
  }

  // Check if date exceeds the work order due date
  if ( props.workOrderDueDate ) {
    const dueDate = new Date( props.workOrderDueDate )
    dueDate.setHours( 23, 59, 59, 999 ) // Allow end times up to end of due date

    const compareDate = new Date( date )
    compareDate.setHours( 0, 0, 0, 0 )

    return compareDate > dueDate
  }

  return false
}

const disabledStartHours = () => {
  if ( !props.workOrderStartDate || !startDate.value ) return []

  const workOrderStart = new Date( props.workOrderStartDate )
  const recurrenceStart = new Date( startDate.value )

  // If same day as work order start, disable hours before work order start hour
  if ( workOrderStart.toDateString() === recurrenceStart.toDateString() ) {
    const disabledHours = []
    for ( let i = 0; i < workOrderStart.getHours(); i++ ) {
      disabledHours.push( i )
    }
    return disabledHours
  }

  return []
}

const disabledStartMinutes = hour => {
  if ( !props.workOrderStartDate || !startDate.value ) return []

  const workOrderStart = new Date( props.workOrderStartDate )
  const recurrenceStart = new Date( startDate.value )

  // If same day and same hour as work order start, disable minutes before work order start minute
  if ( workOrderStart.toDateString() === recurrenceStart.toDateString() && hour === workOrderStart.getHours() ) {
    const disabledMinutes = []
    for ( let i = 0; i < workOrderStart.getMinutes(); i++ ) {
      disabledMinutes.push( i )
    }
    return disabledMinutes
  }

  return []
}

const disabledEndHours = () => {
  if ( !startDate.value || !endDate.value ) return []

  const start = new Date( startDate.value )
  const end = new Date( endDate.value )
  const disabledHours = []

  // If same day as start, disable hours before start hour
  if ( start.toDateString() === end.toDateString() ) {
    for ( let i = 0; i < start.getHours(); i++ ) {
      disabledHours.push( i )
    }
  }

  // If same day as due date, disable hours after due date hour
  if ( props.workOrderDueDate ) {
    const dueDate = new Date( props.workOrderDueDate )
    if ( dueDate.toDateString() === end.toDateString() ) {
      for ( let i = dueDate.getHours() + 1; i <= 23; i++ ) {
        disabledHours.push( i )
      }
    }
  }

  return disabledHours
}

const disabledEndMinutes = hour => {
  if ( !startDate.value || !endDate.value ) return []

  const start = new Date( startDate.value )
  const end = new Date( endDate.value )
  const disabledMinutes = []

  // If same day and same hour as start, disable minutes before start minute
  if ( start.toDateString() === end.toDateString() && hour === start.getHours() ) {
    for ( let i = 0; i <= start.getMinutes(); i++ ) {
      disabledMinutes.push( i )
    }
  }

  // If same day and same hour as due date, disable minutes after due date minute
  if ( props.workOrderDueDate ) {
    const dueDate = new Date( props.workOrderDueDate )
    if ( dueDate.toDateString() === end.toDateString() && hour === dueDate.getHours() ) {
      for ( let i = dueDate.getMinutes() + 1; i <= 59; i++ ) {
        disabledMinutes.push( i )
      }
    }
  }

  return disabledMinutes
}

// Helper function to get work order start date part
const getWorkOrderStartDate = () => {
  if ( !props.workOrderStartDate ) return null

  // Extract date part from work order start date (e.g., "2025-09-29T07:00:00.000Z" -> "2025-09-29")
  const date = new Date( props.workOrderStartDate )
  return date.toISOString().split( 'T' )[0]
}

// Helper function to get work order due date part
const getWorkOrderDueDate = () => {
  if ( !props.workOrderDueDate ) return null

  // Extract date part from work order due date (e.g., "2025-09-30T17:00:00.000Z" -> "2025-09-30")
  const date = new Date( props.workOrderDueDate )
  return date.toISOString().split( 'T' )[0]
}

const disabledEndTimeHours = () => {
  if ( !startTime.value ) return []

  const [startHour] = startTime.value.split( ':' ).map( Number )
  const disabledHours = []

  // Disable hours before start time hour
  for ( let i = 0; i < startHour; i++ ) {
    disabledHours.push( i )
  }

  return disabledHours
}

const disabledEndTimeMinutes = hour => {
  if ( !startTime.value ) return []

  const [startHour, startMinute] = startTime.value.split( ':' ).map( Number )
  const disabledMinutes = []

  // If same hour as start time, disable minutes before or equal to start minute
  if ( hour === startHour ) {
    for ( let i = 0; i <= startMinute; i++ ) {
      disabledMinutes.push( i )
    }
  }

  return disabledMinutes
}

// Duration helpers
const calculateDuration = () => {
  if ( !startDate.value || !endDate.value ) return 0

  const start = new Date( startDate.value )
  const end = new Date( endDate.value )
  const diffMs = end - start

  return diffMs > 0 ? Math.ceil( diffMs / ( 1000 * 60 ) ) : 0
}

const formatDuration = minutes => {
  if ( minutes < 60 ) return `${minutes} minutes`

  const hours = Math.floor( minutes / 60 )
  const remainingMinutes = minutes % 60

  if ( remainingMinutes === 0 ) return `${hours} hour${hours !== 1 ? 's' : ''}`

  return `${hours}h ${remainingMinutes}m`
}

// New duration calculation for time-only fields
const calculateTimeDuration = () => {
  if ( !startTime.value || !endTime.value ) return 0

  const [startHour, startMinute] = startTime.value.split( ':' ).map( Number )
  const [endHour, endMinute] = endTime.value.split( ':' ).map( Number )

  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute

  // Handle case where end time is after start time (same day)
  if ( endTotalMinutes > startTotalMinutes ) {
    return endTotalMinutes - startTotalMinutes
  }

  return 0
}

const showDurationWarning = computed( () => {
  const duration = calculateDuration()
  return duration > 0 && duration <= 1440 // Show for any duration within one day (1440 minutes = 24 hours)
} )

const showRecurrenceStartWarning = computed( () => {
  // For 'none' recurrence type, check startDate
  if ( recurrence.value === 'none' ) {
    if ( !props.workOrderStartDate || !startDate.value ) return false

    const workOrderStart = new Date( props.workOrderStartDate )
    const recurrenceStart = new Date( startDate.value )

    return recurrenceStart < workOrderStart
  }

  // For recurring types, no warning needed since we use work order date
  return false
} )

// New computed properties for time-based validation
const showTimeDurationInfo = computed( () => {
  const duration = calculateTimeDuration()
  return duration > 0
} )

const showTimeValidationError = computed( () => {
  if ( !startTime.value || !endTime.value ) return false
  return calculateTimeDuration() === 0
} )

// eslint-disable-next-line vue/no-dupe-keys
const recurrenceSetting = computed( () => {
  const setting = {}

  // Handle different recurrence types
  if ( recurrence.value === 'none' ) {
    // For 'none' recurrence, use the original date-time fields
    if ( startDate.value ) {
      setting.start_date_time = new Date( startDate.value ).toISOString()
    }
    if ( endDate.value ) {
      setting.end_date_time = new Date( endDate.value ).toISOString()
    }
    // Calculate duration_minutes based on date difference
    if ( startDate.value && endDate.value ) {
      const start = new Date( startDate.value )
      const end = new Date( endDate.value )
      const diffMs = end - start
      const minutes = Math.ceil( diffMs / ( 1000 * 60 ) )
      setting.duration_minutes = minutes > 0 ? minutes : 0
    } else {
      setting.duration_minutes = 0
    }
  } else if ( ['daily', 'weekly', 'monthlyByDate', 'yearly'].includes( recurrence.value ) ) {
    // For recurring types, use work order start date with start time, and due date with end time
    const workOrderStartDate = getWorkOrderStartDate()
    const workOrderDueDate = getWorkOrderDueDate()

    if ( workOrderStartDate && startTime.value ) {
      const startDateTime = new Date( `${workOrderStartDate}T${startTime.value}` )
      setting.start_date_time = startDateTime.toISOString()
    }
    if ( workOrderDueDate && endTime.value ) {
      const endDateTime = new Date( `${workOrderDueDate}T${endTime.value}` )
      setting.end_date_time = endDateTime.toISOString()
    }
    // Also set individual time fields for validation
    setting.start_time = startTime.value
    setting.end_time = endTime.value
    // Calculate duration from time difference (auto-calculated)
    setting.duration_minutes = calculateTimeDuration()
  }

  setting.recurrence_type = recurrenceTypeMap.value[recurrence.value] || 1

  if ( recurrence.value === 'daily' ) {
    setting.interval = 1
  } else if ( recurrence.value === 'weekly' ) {
    setting.interval = repeatInterval.value
    setting.days_of_week = selectedDays.value.filter( v => typeof v === 'number' )
  } else if ( recurrence.value === 'monthlyByDate' ) {
    setting.interval = monthlyRepeatInterval.value
    setting.day_of_month = monthlyDate.value
  } else if ( recurrence.value === 'yearly' ) {
    setting.interval = yearlyRepeatInterval.value
    setting.month_of_year = yearlyMonth.value
    setting.day_of_month = yearlyDay.value
  }

  return setting
} )

// Sync recurrence_setting on internal changes
let isUpdating = false
watch(
  recurrenceSetting,
  newSetting => {
    if ( isUpdating ) return
    isUpdating = true
    emit( 'update:recurrenceSetting', newSetting )
    // Use nextTick to reset the flag after the update cycle completes
    nextTick( () => {
      isUpdating = false
    } )
  },
  { deep : true }
)
</script>

<style scoped lang="scss">
.recurrence-editor {
  margin-top: 20px;
}

.weekly-selection {
  margin-top: 15px;
}

.instruction {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 10px;
}

.weekly-interval-selection {
  margin-top: 15px;
}

.repeat-interval {
  display: flex;
  align-items: center;
}

.instruction {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 10px;
}

.monthly-by-date-selection {
  margin-top: 15px;
}

.repeat-interval {
  display: flex;
  align-items: center;
}

.yearly-selection {
  margin-top: 15px;
}

.duration-warning {
  margin-top: 8px;

  .el-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.recurrence-warning {
  margin-top: 8px;

  .el-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.duration-info {
  margin-top: 8px;

  .el-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.time-validation-error {
  margin-top: 8px;

  .el-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
