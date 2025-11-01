<template>
  <div class="checkbox-widget">
    <div class="widget-content">
      <div v-if="step.ui.description" class="step-description">
        {{ step.ui.description }}
      </div>

      <div class="checkbox-container" :class="stackDirection">
        <el-checkbox v-model="isChecked" :disabled="!interactive" size="large">
          <span class="checkbox-label">
            {{ step.ui.label || 'Completed' }}
          </span>
        </el-checkbox>
      </div>

      <div v-if="step.ui.note" class="checkbox-note">
        <el-icon><InfoFilled /></el-icon>
        {{ step.ui.note }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => ({
      stackDirection: 'vertical',
    }),
  },
})

const isChecked = ref(props.step.ui.default || false)

const stackDirection = computed(() => {
  return props.config.stackDirection === 'horizontal' ? 'horizontal' : 'vertical'
})
</script>

<style scoped>
.checkbox-widget {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.2s;
}

.checkbox-widget:hover {
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

.checkbox-container {
  margin-bottom: 12px;
}

.checkbox-container.horizontal {
  display: flex;
  align-items: center;
}

.checkbox-label {
  font-weight: 600;
  color: #1e293b;
  margin-left: 8px;
  font-size: 15px;
}

.checkbox-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e0;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  font-weight: 500;
}
</style>
