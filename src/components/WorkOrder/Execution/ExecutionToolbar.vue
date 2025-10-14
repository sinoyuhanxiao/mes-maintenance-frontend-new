<template>
  <div class="execution-toolbar">
    <div class="toolbar-left">
      <slot name="info" />
    </div>
    <div class="toolbar-actions">
      <el-button @click="$emit('close')">Close</el-button>
      <el-button type="primary" plain :disabled="disabled" @click="$emit('save-all')">Save Draft</el-button>
      <el-button type="primary" :disabled="disabled" @click="$emit('submit-all')">Complete All</el-button>
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps( {
  disabled : {
    type : Boolean,
    default : false
  }
} )
</script>

<style scoped>
.execution-toolbar {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  gap: 12px;
  z-index: 5;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}
</style>
