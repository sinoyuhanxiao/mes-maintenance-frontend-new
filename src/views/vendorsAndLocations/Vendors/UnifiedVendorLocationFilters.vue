<template>
  <div class="filter-bar">
    <div class="right-controls">
      <div class="filter-item">
        <el-button size="default" type="primary" :icon="Plus" @click="$emit('create')">
          {{ createButtonText }}
        </el-button>
      </div>
      <div class="filter-item">
        <el-button size="default" type="default" :icon="Refresh" @click="$emit('refresh')"> Refresh </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
  },
})

const createButtonText = computed(() => (props.activeTab === 'vendors' ? 'Vendor' : 'Root Location'))
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  flex-wrap: wrap;
  gap: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.right-controls {
  margin-left: auto; /* push buttons to the right */
  display: flex;
  gap: 10px;
}
</style>
