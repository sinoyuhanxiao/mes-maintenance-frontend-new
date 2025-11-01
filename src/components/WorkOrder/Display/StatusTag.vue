<template>
  <el-tag :type="tagType" effect="dark" round>
    {{ statusName }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps({
  status: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useI18n()

// Computed
const statusName = computed(() => {
  if (!props.status?.name) return '-'

  // Map English status names to translated names
  const statusMap = {
    Failed: t('workOrder.status.failed'),
    Completed: t('workOrder.status.completed'),
    'In Progress': t('workOrder.status.inProgress'),
    Pending: t('workOrder.status.pending'),
  }

  return statusMap[props.status.name] || props.status.name
})

const tagType = computed(() => {
  const name = props.status?.name
  switch (name) {
    case 'Failed':
      return 'danger'
    case 'Completed':
      return 'success'
    case 'In Progress':
      return 'warning'
    default:
      return 'info'
  }
})

defineOptions({
  name: 'StatusTag',
})
</script>
