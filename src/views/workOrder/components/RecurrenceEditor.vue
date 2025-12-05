<template>
  <div class="recurrence-editor">
    <el-form-item
      v-if="!isSingleInstanceMode"
      :label="$t('workOrder.create.recurrenceSettings')"
      prop="recurrence_type"
      :show-message="false"
      required
      :class="{ 'is-disabled': isDisabled }"
    >
      <el-select
        v-model="recurrence"
        :placeholder="$t('workOrder.placeholder.selectRecurrence')"
        style="width: 100%"
        clearable
        :disabled="isDisabled"
      >
        <el-option :label="$t('workOrder.recurrence.none')" value="none"></el-option>
        <el-option :label="$t('workOrder.recurrence.daily')" value="daily"></el-option>
        <el-option :label="$t('workOrder.recurrence.weekly')" value="weekly"></el-option>
        <el-option :label="$t('workOrder.recurrence.monthlyByDate')" value="monthlyByDate"></el-option>
        <el-option :label="$t('workOrder.recurrence.yearly')" value="yearly"></el-option>
      </el-select>
    </el-form-item>

    <!-- Work Order Start Date (hidden for 'none' recurrence) -->
    <el-form-item v-if="recurrence !== 'none'" :label="$t('workOrder.create.startDate')" prop="start_date">
      <template #label>
        <span>{{ $t('workOrder.create.startDate') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.rangeStartDate')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker
        :model-value="startDateModel"
        type="date"
        :placeholder="$t('workOrder.create.startDatePlaceholder')"
        style="width: 100%"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @update:model-value="updateStartDate"
      />
    </el-form-item>

    <!-- Work Order Due Date (hidden for 'none' recurrence) -->
    <el-form-item v-if="recurrence !== 'none'" :label="$t('workOrder.create.dueDate')" prop="due_date">
      <template #label>
        <span>{{ $t('workOrder.create.dueDate') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.rangeEndDate')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker
        :model-value="dueDateModel"
        type="date"
        :placeholder="$t('workOrder.create.dueDatePlaceholder')"
        style="width: 100%"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @update:model-value="updateDueDate"
      />
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
  <template v-if="isSingleInstanceMode || recurrence === 'none'">
    <!-- Start Date Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.startDateTime')"
      prop="recurrence_setting.start_date_time"
      required
      :show-message="false"
    >
      <template #label>
        <span>{{ $t('workOrder.recurrence.startDateTime') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.singleStartDateTime')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker
        v-model="startDateTimeValue"
        type="datetime"
        :placeholder="$t('workOrder.recurrence.selectStartTime')"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>

    <!-- End Date Time Selection -->
    <el-form-item
      :label="$t('workOrder.recurrence.endDateTime')"
      prop="recurrence_setting.end_date_time"
      required
      :show-message="false"
    >
      <template #label>
        <span>{{ $t('workOrder.recurrence.endDateTime') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.singleEndDateTime')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker
        v-model="endDateTimeValue"
        type="datetime"
        :placeholder="$t('workOrder.recurrence.selectEndTime')"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>
  </template>

  <!-- For recurring types, use only time fields -->
  <template v-else-if="!isSingleInstanceMode && ['daily', 'weekly', 'monthlyByDate', 'yearly'].includes(recurrence)">
    <!-- Start Time Selection -->
    <el-form-item prop="recurrence_setting.start_time" required :show-message="false">
      <template #label>
        <span>{{ $t('workOrder.recurrence.startTime') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.startTime')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-time-picker
        v-model="startTime"
        :placeholder="$t('workOrder.recurrence.selectStartTime')"
        format="HH:mm"
        value-format="HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>

    <!-- End Time Selection -->
    <el-form-item prop="recurrence_setting.end_time" required :show-message="false">
      <template #label>
        <span>{{ $t('workOrder.recurrence.endTime') }}</span>
        <el-tooltip :content="$t('workOrder.tooltips.endTime')" placement="top">
          <el-icon style="margin-left: 4px; cursor: help; color: var(--el-color-info)">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </template>
      <el-time-picker
        v-model="endTime"
        :placeholder="$t('workOrder.recurrence.selectEndTime')"
        format="HH:mm"
        value-format="HH:mm:ss"
        style="width: 100%"
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
import { Warning, Clock, QuestionFilled } from '@element-plus/icons-vue'
import { getAllRecurrenceTypes } from '@/api/work-order'

const startDateTimeValue = ref( null )
const endDateTimeValue = ref( null )
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
  },
  startDate : {
    type : String,
    default : null
  },
  dueDate : {
    type : String,
    default : null
  },
  disabled : {
    type : Boolean,
    default : false
  },
  singleInstanceMode : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['update:recurrenceSetting', 'update:startDate', 'update:dueDate'] )

const isDisabled = computed( () => !!props.disabled )
const isSingleInstanceMode = computed( () => !!props.singleInstanceMode )
const forcedRecurrenceTypeId = ref( null )

// Computed properties for v-model binding
const startDateModel = computed( {
  get : () => props.startDate,
  set : value => emit( 'update:startDate', value )
} )

const dueDateModel = computed( {
  get : () => props.dueDate,
  set : value => emit( 'update:dueDate', value )
} )

// Update methods
const updateStartDate = value => {
  emit( 'update:startDate', value )
}

const updateDueDate = value => {
  emit( 'update:dueDate', value )
}

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

  if ( isSingleInstanceMode.value ) {
    forcedRecurrenceTypeId.value = setting.recurrence_type || recurrenceTypeMap.value[recurrenceTypeString] || null
    recurrence.value = 'none'
  } else {
    forcedRecurrenceTypeId.value = null
    recurrence.value = recurrenceTypeString
  }

  if ( recurrenceTypeString === 'none' || isSingleInstanceMode.value ) {
    if ( setting.start_date_time ) {
      // Value should be a string in format YYYY-MM-DD HH:mm:ss to match value-format
      // Handle various datetime formats: YYYY-MM-DDTHH:mm:ss, YYYY-MM-DD HH:mm:ss, with/without timezone
      const startStr = String( setting.start_date_time )
      // Extract first 19 characters (YYYY-MM-DD HH:mm:ss) by replacing T with space and removing any extra characters
      const normalized = startStr.replace( 'T', ' ' ).substring( 0, 19 )
      // Validate format before assigning
      if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalized ) ) {
        startDateTimeValue.value = normalized
      }
    } else if ( props.workOrderStartDate ) {
      const startStr = String( props.workOrderStartDate )
      const normalized = startStr.replace( 'T', ' ' ).substring( 0, 19 )
      if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalized ) ) {
        startDateTimeValue.value = normalized
      }
    }

    if ( setting.end_date_time ) {
      const endStr = String( setting.end_date_time )
      const normalized = endStr.replace( 'T', ' ' ).substring( 0, 19 )
      if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalized ) ) {
        endDateTimeValue.value = normalized
      }
    } else if ( props.workOrderDueDate ) {
      const endStr = String( props.workOrderDueDate )
      const normalized = endStr.replace( 'T', ' ' ).substring( 0, 19 )
      if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalized ) ) {
        endDateTimeValue.value = normalized
      }
    }
  } else {
    if ( setting.start_time ) {
      startTime.value = setting.start_time
    }
    if ( setting.end_time ) {
      endTime.value = setting.end_time
    }

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
  // Use nextTick to ensure parent has time to populate props
  nextTick( () => {
    initializeFromRecurrenceSetting()
  } )
} )

watch(
  () => props.singleInstanceMode,
  () => {
    if ( Object.keys( recurrenceTypeMap.value ).length > 0 ) {
      initializeFromRecurrenceSetting()
    }
  }
)

// Track if we're processing our own emission to avoid circular updates
let isProcessingOwnEmission = false

// Watch for changes to recurrenceSetting prop to reinitialize
watch(
  () => props.recurrenceSetting,
  ( newVal, oldVal ) => {
    // Skip if this update came from our own emission (avoid circular updates)
    if ( isProcessingOwnEmission ) {
      return
    }

    if ( !newVal || Object.keys( newVal ).length === 0 ) {
      return
    }

    // Check if this update has datetime values
    const hasDatetime = newVal.start_date_time || newVal.end_date_time

    if ( hasDatetime ) {
      // Directly set the internal datetime values without waiting for recurrenceTypeMap
      // This ensures we capture the datetime values before they get overwritten
      const startStr = String( newVal.start_date_time )
      const normalized = startStr.replace( 'T', ' ' ).substring( 0, 19 )
      if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalized ) ) {
        startDateTimeValue.value = normalized
      }

      if ( newVal.end_date_time ) {
        const endStr = String( newVal.end_date_time )
        const normalizedEnd = endStr.replace( 'T', ' ' ).substring( 0, 19 )
        if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( normalizedEnd ) ) {
          endDateTimeValue.value = normalizedEnd
        }
      }

      // Temporarily disable emissions to prevent overwriting parent
      const wasInitializing = isInitializing
      isInitializing = true
      nextTick( () => {
        isInitializing = wasInitializing
      } )
    } else if ( Object.keys( recurrenceTypeMap.value ).length > 0 ) {
      // Only call initializeFromRecurrenceSetting if recurrenceTypeMap is loaded
      initializeFromRecurrenceSetting()
    }
  },
  { deep : true, immediate : false }
)

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

// Duration helpers
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

const formatDuration = minutes => {
  if ( minutes <= 0 ) return ''
  const hours = Math.floor( minutes / 60 )
  const remainingMinutes = minutes % 60

  if ( hours === 0 ) {
    return `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`
  }

  if ( remainingMinutes === 0 ) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }

  return `${hours}h ${remainingMinutes}m`
}

// New computed properties for time-based validation
const showTimeDurationInfo = computed( () => {
  const duration = calculateTimeDuration()
  return duration > 0
} )

const showTimeValidationError = computed( () => {
  if ( !startTime.value || !endTime.value ) return false
  return calculateTimeDuration() === 0
} )

const computedRecurrenceSetting = computed( () => {
  const setting = {}

  // Handle different recurrence types
  if ( recurrence.value === 'none' || isSingleInstanceMode.value ) {
    // For 'none' recurrence, use the original date-time fields (as strings from value-format)
    if ( startDateTimeValue.value ) {
      setting.start_date_time = startDateTimeValue.value
    }
    if ( endDateTimeValue.value ) {
      setting.end_date_time = endDateTimeValue.value
    }
    // Calculate duration_minutes based on date difference
    if ( startDateTimeValue.value && endDateTimeValue.value ) {
      const start = new Date( startDateTimeValue.value )
      const end = new Date( endDateTimeValue.value )
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

  const recurrenceId = forcedRecurrenceTypeId.value ?? recurrenceTypeMap.value[recurrence.value] ?? 1
  setting.recurrence_type = recurrenceId

  if ( !isSingleInstanceMode.value && recurrence.value === 'daily' ) {
    setting.interval = 1
  } else if ( !isSingleInstanceMode.value && recurrence.value === 'weekly' ) {
    setting.interval = repeatInterval.value
    setting.days_of_week = selectedDays.value.filter( v => typeof v === 'number' )
  } else if ( !isSingleInstanceMode.value && recurrence.value === 'monthlyByDate' ) {
    setting.interval = monthlyRepeatInterval.value
    setting.day_of_month = monthlyDate.value
  } else if ( !isSingleInstanceMode.value && recurrence.value === 'yearly' ) {
    setting.interval = yearlyRepeatInterval.value
    setting.month_of_year = yearlyMonth.value
    setting.day_of_month = yearlyDay.value
  }

  return setting
} )

// Sync recurrence_setting on internal changes
let isUpdating = false
let isInitializing = true

watch(
  computedRecurrenceSetting,
  newSetting => {
    if ( isUpdating ) return

    // Don't emit during initial mount - wait for parent to populate values first
    if ( isInitializing ) {
      return
    }

    isUpdating = true
    isProcessingOwnEmission = true
    emit( 'update:recurrenceSetting', newSetting )
    // Use nextTick to reset the flags after the update cycle completes
    nextTick( () => {
      isUpdating = false
      nextTick( () => {
        isProcessingOwnEmission = false
      } )
    } )
  },
  { deep : true }
)

// Mark initialization as complete after first tick
onMounted( () => {
  nextTick( () => {
    nextTick( () => {
      isInitializing = false
    } )
  } )
} )
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

.duration-info {
  margin-top: 8px;

  .el-text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.recurrence-editor .is-disabled {
  opacity: 0.6;
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
