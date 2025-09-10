<template>
  <div class="service-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Service Operation' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <div class="service-config-preview">
      <!-- First Row -->
      <div class="config-row">
        <div class="config-column">
          <div class="config-item">
            <span class="config-label">Service Type:</span>
            <el-tag :type="getServiceTypeTagType(step.config?.service_type)" size="small">
              {{ step.config?.service_type || 'Replace' }}
            </el-tag>
          </div>
          <div class="config-item">
            <span class="config-label">Device Tag:</span>
            <el-tag type="info" size="small" class="device-tag">
              {{ step.config?.device_tag || 'P100016' }}
            </el-tag>
          </div>
        </div>
        <div class="config-column">
          <div class="config-item" style="width: 100%">
            <span class="config-label">Quantity:</span>
            <el-input-number
              v-model="currentQuantity"
              :min="1"
              :max="999"
              :step="1"
              :precision="0"
              size="small"
              :disabled="!interactive"
              style="width: 100%"
              class="quantity-input-preview"
            />
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="config-row">
        <div class="config-item status-row">
          <el-button-group class="pass-fail-group">
            <el-button
              :type="getStatusButtonType('pass')"
              size="small"
              :disabled="!interactive"
              class="status-button"
              @click="interactive && setStatus('pass')"
            >
              <el-icon><Check /></el-icon>
              Pass
            </el-button>
            <el-button
              :type="getStatusButtonType('fail')"
              size="small"
              :disabled="!interactive"
              class="status-button"
              @click="interactive && setStatus('fail')"
            >
              <el-icon><Close /></el-icon>
              Fail
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  previewMode: {
    type: Boolean,
    default: true,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
})

// Reactive state for user input
const currentQuantity = ref(props.step.config?.quantity || 1)
const currentStatus = ref(props.step.config?.status || 'fail')

// Watch for prop changes to sync initial values
watch(
  () => props.step.config?.quantity,
  newValue => {
    if (!props.interactive) {
      currentQuantity.value = newValue || 1
    }
  },
  { immediate: true }
)

watch(
  () => props.step.config?.status,
  newValue => {
    if (!props.interactive) {
      currentStatus.value = newValue || 'fail'
    }
  },
  { immediate: true }
)

const getServiceTypeTagType = serviceType => {
  return serviceType === 'Replace' ? 'danger' : 'warning'
}

const getStatusButtonType = status => {
  if (status === currentStatus.value) {
    return status === 'pass' ? 'success' : 'danger'
  }
  return 'info'
}

const setStatus = status => {
  if (props.interactive) {
    currentStatus.value = status
  }
}
</script>

<style scoped>
.service-step-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.required-asterisk {
  color: #f56c6c;
  margin-right: 2px;
}

.step-description {
  font-size: 12px;
  color: #909399;
  padding: 6px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.service-config-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-column {
  display: flex;
  flex-direction: row;
  gap: 40px;
  flex: 1;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.config-label {
  font-size: 11px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.device-tag {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.quantity-input-preview {
  width: 80px;
}

.quantity-input-preview :deep(.el-input__wrapper) {
  padding: 0 8px;
}

.pass-fail-group {
  display: flex;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  width: 100%;
}

.status-button .el-icon {
  font-size: 12px;
}

.status-row {
  justify-content: center;
  width: 100%;
}

.status-row .pass-fail-group {
  width: 100%;
}
</style>
