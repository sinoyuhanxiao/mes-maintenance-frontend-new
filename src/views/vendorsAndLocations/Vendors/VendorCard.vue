<!-- src/components/Vendors/VendorCard.vue -->
<template>
  <div class="vendor-card" :class="{ selected: isSelected }" @click="$emit('select', vendor)">
    <div class="card-content">
      <div class="content-main">
        <h4 class="card-title">{{ vendor.name }}</h4>
        <div class="card-meta" v-if="vendor.code">
          <span class="meta-label">Code:</span>
          <span class="meta-value">{{ vendor.code }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps( {
  vendor : Object,
  isSelected : Boolean
} )
defineEmits( ['select'] )
</script>

<style scoped lang="scss">
.vendor-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.card-header {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 14px;
  margin-bottom: 8px;
}

.card-content {
  display: flex;
  .content-main {
    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 8px 0;
    }

    .card-meta {
      font-size: 13px;
      margin-bottom: 6px;

      .meta-label {
        font-weight: 500;
        margin-right: 6px;
      }
    }
  }
}
</style>
