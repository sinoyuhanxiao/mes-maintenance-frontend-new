<template>
  <span :title="priority?.description" class="priority-tag" :class="priorityClass">
    <el-icon :style="{ color: priorityColor, marginRight: '4px' }">
      <Flag />
    </el-icon>
    {{ priorityName }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Flag } from '@element-plus/icons-vue'
import { getPriorityColor } from '@/utils/general'

// Props
const props = defineProps({
  priority: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()

// Computed
const priorityName = computed(() => {
  if (!props.priority?.name) return '-'

  // Map English priority names to translated names
  const priorityMap = {
    Urgent: t('workOrder.priority.urgent'),
    High: t('workOrder.priority.high'),
    Medium: t('workOrder.priority.medium'),
    Low: t('workOrder.priority.low'),
  }

  return priorityMap[props.priority.name] || props.priority.name
})

const priorityColor = computed(() => {
  return getPriorityColor(props.priority?.name)
})

const priorityClass = computed(() => {
  const name = props.priority?.name?.toLowerCase()
  return {
    'priority-urgent': name === 'urgent',
    'priority-high': name === 'high',
    'priority-medium': name === 'medium',
    'priority-low': name === 'low',
  }
})

defineOptions({
  name: 'PriorityTag',
})
</script>

<style scoped lang="scss">
.priority-tag {
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 15px;

  &.priority-urgent {
    color: #f56c6c;
  }

  &.priority-high {
    color: #409eff;
  }

  &.priority-medium {
    color: #e6a23c;
  }

  &.priority-low {
    color: #909399;
  }
}
</style>
