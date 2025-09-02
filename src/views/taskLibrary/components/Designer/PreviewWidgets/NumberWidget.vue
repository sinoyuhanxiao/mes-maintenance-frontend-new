<template>
  <div class="number-widget">
    <div class="widget-content">
      <div v-if="step.ui.description" class="step-description">
        {{ step.ui.description }}
      </div>

      <div class="number-input-container">
        <el-input-number
          v-model="numberValue"
          :precision="step.ui.decimal_places || 0"
          :min="limits?.lower"
          :max="limits?.upper"
          :disabled="!interactive"
          :placeholder="getPlaceholder()"
          class="number-input"
        />

        <span v-if="showUnits && unit" class="unit-label">
          {{ unit }}
        </span>
      </div>

      <div v-if="showLimits && limits" class="limits-display">
        <div class="limits-info">
          <el-icon><DataAnalysis /></el-icon>
          <span class="limits-text">
            Range:
            <strong>{{ limits.lower ?? 'No min' }}</strong> -
            <strong>{{ limits.upper ?? 'No max' }}</strong>
            {{ unit ? unit : '' }}
          </span>
        </div>

        <div v-if="isOutOfRange" class="out-of-range-warning">
          <el-icon><Warning /></el-icon>
          Value is outside acceptable range
        </div>
      </div>

      <div v-if="step.ui.target_value" class="target-info">
        <div class="target-display">
          <el-icon><Aim /></el-icon>
          Target: <strong>{{ step.ui.target_value }} {{ unit }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DataAnalysis, Warning, Aim } from '@element-plus/icons-vue'

const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  interactive : {
    type : Boolean,
    default : false
  },
  config : {
    type : Object,
    default : () => ( {
      showUnits : true,
      showLimits : true,
      unitsField : 'unit',
      limitsField : 'limits'
    } )
  }
} )

const numberValue = ref( props.step.ui.default || null )

const showUnits = computed( () => props.config.showUnits )
const showLimits = computed( () => props.config.showLimits )

const unit = computed( () => {
  const unitField = props.config.unitsField || 'unit'
  return props.step.ui[unitField] || ''
} )

const limits = computed( () => {
  const limitsField = props.config.limitsField || 'limits'
  return props.step.ui[limitsField] || null
} )

const isOutOfRange = computed( () => {
  if ( !limits.value || numberValue.value === null || numberValue.value === undefined ) {
    return false
  }

  const value = numberValue.value
  const { lower, upper } = limits.value

  if ( lower !== undefined && value < lower ) return true
  if ( upper !== undefined && value > upper ) return true

  return false
} )

const getPlaceholder = () => {
  if ( limits.value ) {
    const { lower, upper } = limits.value
    if ( lower !== undefined && upper !== undefined ) {
      return `${lower} - ${upper}`
    } else if ( lower !== undefined ) {
      return `Min: ${lower}`
    } else if ( upper !== undefined ) {
      return `Max: ${upper}`
    }
  }
  return 'Enter value'
}
</script>

<style scoped>
.number-widget {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.2s;
}

.number-widget:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-description {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.number-input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.number-input {
  flex: 1;
  min-width: 120px;
}

.unit-label {
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #cbd5e0;
}

.limits-display {
  margin-bottom: 8px;
}

.limits-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.limits-text {
  color: #606266;
}

.out-of-range-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  font-size: 12px;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
}

.target-info {
  margin-top: 8px;
}

.target-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0369a1;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #7dd3fc;
  font-weight: 500;
}
</style>
