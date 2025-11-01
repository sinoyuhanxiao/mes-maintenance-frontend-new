<template>
  <CreateStandardDialog
    :visible="visible"
    :is-edit-mode="true"
    :initial-data="standard"
    :loading="loading"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CreateStandardDialog from './CreateStandardDialog.vue'
import { updateStandard } from '@/api/task-library'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  standard: {
    type: Object,
    default: () => ({}),
  },
  isWorkOrderContext: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'update:standard'])

const loading = ref(false)

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async updatedStandard => {
  loading.value = true
  try {
    if (props.isWorkOrderContext || props.standard.isStandalone) {
      // Work order context: just emit the updated standard without API call
      // The parent component (WorkOrderEdit/WorkOrderCreate) will handle tracking changes
      emit('update:standard', { ...props.standard, ...updatedStandard })
      ElMessage.success('Standard updated for this work order.')
    } else {
      // Template library context: update via API
      await updateStandard(props.standard.standardId, updatedStandard)
      ElMessage.success('Standard template updated successfully.')
      // Also update the local standard to reflect the change
      emit('update:standard', { ...props.standard, ...updatedStandard })
    }
    handleClose()
  } catch (error) {
    console.error('Failed to update standard:', error)
    ElMessage.error('Failed to update standard.')
  } finally {
    loading.value = false
  }
}
</script>
