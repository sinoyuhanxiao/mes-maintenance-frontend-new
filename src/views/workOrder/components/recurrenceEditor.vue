<template>
  <div class="recurrence-editor">
    <el-form-item label="重复设置" prop="recurrence_type" :show-message="false" required>
      <el-select v-model="recurrence" placeholder="请选择重复设置" style="width: 500px" clearable>
        <el-option label="不重复" value="none"></el-option>
        <el-option label="每日" value="daily"></el-option>
        <el-option label="每周" value="weekly"></el-option>
        <el-option label="每月 (按日期)" value="monthlyByDate"></el-option>
        <!--        <el-option label="每月 (按星期几)" value="monthlyByWeekday"></el-option>-->
        <el-option label="每年" value="yearly"></el-option>
      </el-select>
    </el-form-item>

    <!-- Weekly Interval Selection -->
    <div v-if="recurrence === 'weekly'" class="weekly-interval-selection">
      <el-form-item label="">
        <div class="repeat-interval">
          <span>每</span>
          <el-input-number
            v-model="repeatInterval"
            :min="1"
            :max="52"
            style="width: 120px; margin: 0 10px"
          ></el-input-number>
          <span>周重复</span>
        </div>
      </el-form-item>
    </div>

    <!-- Days of the Week Selection -->
    <div v-if="recurrence === 'weekly'" class="weekly-selection">
      <el-form-item label="">
        <el-checkbox-group v-model="selectedDays" @change="handleDaySelectionChange">
          <el-checkbox-button :label="1">周一</el-checkbox-button>
          <el-checkbox-button :label="2">周二</el-checkbox-button>
          <el-checkbox-button :label="3">周三</el-checkbox-button>
          <el-checkbox-button :label="4">周四</el-checkbox-button>
          <el-checkbox-button :label="5">周五</el-checkbox-button>
          <el-checkbox-button :label="6">周六</el-checkbox-button>
          <el-checkbox-button :label="0">周日</el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
    </div>
  </div>

  <!-- Monthly By Date Selection -->
  <div v-if="recurrence === 'monthlyByDate'" class="monthly-by-date-selection">
    <el-form-item label="">
      <div class="repeat-interval">
        <span>每</span>
        <el-input-number
          v-model="monthlyRepeatInterval"
          :min="1"
          :max="12"
          style="width: 120px; margin: 0 10px"
        ></el-input-number>
        <span>个月的第</span>
        <el-select v-model="monthlyDate" placeholder="选择日期" style="width: 100px; margin: 0 10px">
          <el-option v-for="day in 31" :key="day" :label="`${day}日`" :value="day"></el-option>
        </el-select>
        <span>重复</span>
      </div>
    </el-form-item>
  </div>

  <!-- Yearly Selection -->
  <div v-if="recurrence === 'yearly'" class="yearly-selection">
    <el-form-item label="">
      <div class="repeat-interval">
        <span>每</span>
        <el-input-number v-model="yearlyRepeatInterval" :min="1" :max="10" style="width: 120px; margin: 0 6px" />
        <span>年的</span>

        <el-select v-model="yearlyMonth" placeholder="选择月份" style="width: 100px; margin: 0 6px">
          <el-option v-for="month in 12" :key="month" :label="`${month}月`" :value="month" />
        </el-select>

        <el-select v-model="yearlyDay" placeholder="选择日期" style="width: 100px; margin: 0 6px">
          <el-option v-for="day in 31" :key="day" :label="`${day}号`" :value="day" />
        </el-select>

        <span>重复</span>
      </div>
    </el-form-item>
  </div>

  <!-- 开始时间 Selection (Always Displayed) -->
  <el-form-item label="开始时间" prop="recurrence_setting.start_date_time" required :show-message="false">
    <el-date-picker
      v-model="startDate"
      type="datetime"
      placeholder="选择开始时间"
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

  <!-- 结束时间 Selection (Displayed if recurrence is not 'daily') -->
  <el-form-item label="结束时间" prop="recurrence_setting.end_date_time" required :show-message="false">
    <el-date-picker
      v-model="endDate"
      type="datetime"
      placeholder="选择结束时间"
      format="YYYY-MM-DD HH:mm"
      value-format="YYYY-MM-DD HH:mm:ss"
      style="width: 500px"
    />
  </el-form-item>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const startDate = ref( null )
const endDate = ref( null )
const recurrence = ref( '' )
const repeatInterval = ref( 1 ) // Control for how many weeks to repeat
const selectedDays = ref( [] ) // Store selected days as numbers (1 to 7)
const monthlyRepeatInterval = ref( 1 ) // Control for how many months to repeat
const monthlyDate = ref( 1 ) // Control for which date to repeat
const yearlyRepeatInterval = ref( 1 ) // Control for how many years to repeat
const yearlyMonth = ref( 1 ) // default to January
const yearlyDay = ref( 1 ) // default to 1st
const emit = defineEmits( ['update:recurrenceSetting'] )

// should be from backend
const recurrenceTypeMap = {
  none : 1,
  daily : 2,
  weekly : 3,
  monthlyByDate : 4,
  yearly : 5
}

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
  setting.recurrence_type = recurrenceTypeMap[recurrence.value] || 1
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
