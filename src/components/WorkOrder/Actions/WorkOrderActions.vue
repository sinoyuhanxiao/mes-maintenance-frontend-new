<template>
  <div class="work-order-actions">
    <el-button type="info" size="small" @click="$emit('view')" :aria-label="$t('workOrder.actions.view')">
      {{ $t('workOrder.actions.view') }}
    </el-button>

    <el-button type="primary" size="small" @click="$emit('edit')" :aria-label="$t('workOrder.actions.edit')">
      {{ $t('workOrder.actions.edit') }}
    </el-button>

    <el-button
      v-if="row.status !== 'deleted'"
      size="small"
      type="danger"
      @click="handleDelete"
      :aria-label="$t('workOrder.actions.delete')"
      :loading="deleteLoading"
    >
      {{ $t('workOrder.actions.delete') }}
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Props
const props = defineProps({
  row: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

// Emits
const emit = defineEmits(['view', 'edit', 'delete'])

const { t } = useI18n()
const { confirmAction } = useErrorHandler()

// State
const deleteLoading = ref(false)

// Methods
const handleDelete = async () => {
  const confirmed = await confirmAction({
    title: t('common.confirm'),
    message: t('common.deleteConfirmMessage', { name: props.row.name }),
    confirmButtonText: t('workOrder.actions.delete'),
    cancelButtonText: t('workOrder.actions.cancel'),
    type: 'warning',
  })

  if (confirmed) {
    deleteLoading.value = true
    try {
      emit('delete')
    } finally {
      deleteLoading.value = false
    }
  }
}

defineOptions({
  name: 'WorkOrderActions',
})
</script>

<style scoped lang="scss">
.work-order-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;

  .el-button {
    margin: 0;
  }
}
</style>
