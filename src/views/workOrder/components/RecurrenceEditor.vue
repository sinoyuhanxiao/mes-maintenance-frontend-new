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
        <!--        <el-option label="每月 (按星期几)" value="monthlyByWeekday"></el-option>-->
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

  <!-- Start Date Time Selection (Always Displayed) -->
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
    />
  </el-form-item>

  <!--  <el-form-item label="预估分钟">-->
  <!--    <el-input-number-->
  <!--        v-model="durationMinutes"-->
  <!--        :min="1"-->
  <!--        :step="5"-->
  <!--        style="width: 120px"-->
  <!--        controls-position="right"-->
  <!--    />-->
  <!--  </el-form-item>-->

  <!-- End Date Time Selection (Displayed if recurrence is not 'daily') -->
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
    />
  </el-form-item>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { getAllRecurrenceTypes } from '@/api/workorder'

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

onMounted( () => {
  loadRecurrenceTypes()
} )

const recurrenceSetting = computed( () => {
  const setting = {}
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
watch(
  recurrenceSetting,
  newSetting => {
    emit( 'update:recurrenceSetting', newSetting )
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
</style>
