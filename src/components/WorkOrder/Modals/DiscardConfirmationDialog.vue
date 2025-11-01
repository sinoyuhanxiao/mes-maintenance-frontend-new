<template>
  <el-dialog
    v-model="visible"
    title="Discard Changes"
    width="500px"
    :before-close="handleClose"
    class="discard-confirmation-dialog"
  >
    <div class="confirmation-content">
      <div class="warning-icon">
        <el-icon class="warning-icon-svg" size="48" color="#E6A23C">
          <WarningFilled />
        </el-icon>
      </div>
      <div class="confirmation-text">
        <h3>Are you sure you want to discard your current changes?</h3>
        <p>Any unsaved changes to this work order will be lost permanently. This action cannot be undone.</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" size="default"> Cancel </el-button>
        <el-button type="danger" @click="handleConfirm" size="default"> Discard Changes </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    visible.value = newValue
  }
)

watch(visible, newValue => {
  emit('update:modelValue', newValue)
})

const handleClose = () => {
  visible.value = false
  emit('cancel')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleConfirm = () => {
  visible.value = false
  emit('confirm')
}

defineOptions({
  name: 'DiscardConfirmationDialog',
})
</script>

<style scoped>
.discard-confirmation-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px 20px;
    text-align: center;
  }

  :deep(.el-dialog__body) {
    padding: 10px 20px 20px 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 20px 20px 20px;
    text-align: center;
  }
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
}

.warning-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.warning-icon-svg {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.confirmation-text {
  max-width: 400px;
}

.confirmation-text h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.confirmation-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 120px;
  padding: 8px 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .discard-confirmation-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 0 auto;
    }
  }

  .confirmation-text h3 {
    font-size: 16px;
  }

  .confirmation-text p {
    font-size: 13px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
