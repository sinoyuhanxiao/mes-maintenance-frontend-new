<template>
  <div class="work-order-actions">
    <el-button type="info" plain size="small" @click="$emit('view')" :aria-label="$t('workOrder.actions.view')">
      {{ $t('workOrder.actions.view') }}
    </el-button>

    <el-button type="primary" plain size="small" @click="$emit('edit')" :aria-label="$t('workOrder.actions.edit')">
      {{ $t('workOrder.actions.edit') }}
    </el-button>

    <el-button
      v-if="row.status !== 'deleted'"
      size="small"
      type="danger"
      @click="$emit('delete')"
      :aria-label="$t('workOrder.actions.delete')"
    >
      {{ $t('workOrder.actions.delete') }}
    </el-button>
  </div>
</template>

<script setup>
// Props
defineProps( {
  row : {
    type : Object,
    required : true
  },
  index : {
    type : Number,
    required : true
  }
} )

// Emits
defineEmits( ['view', 'edit', 'delete'] )

defineOptions( {
  name : 'WorkOrderActions'
} )
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
