<!-- src/components/Vendors/VendorCard.vue -->
<template>
  <div class="vendor-card" :class="{ selected: isSelected }" @click="$emit('select', vendor)">
    <div class="card-content">
      <!-- Left: text info -->
      <div class="content-main">
        <h4 class="card-title">{{ vendor.name }}</h4>
        <div class="card-meta" v-if="vendor.code">
          <span class="meta-label">Code:</span>
          <span class="meta-value">{{ vendor.code }}</span>
        </div>
      </div>

      <!-- Right: image -->
      <div class="card-image" v-if="validImage">
        <el-image :src="firstImage" fit="cover" class="vendor-avatar" @error="onImageError" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps( {
  vendor : Object,
  isSelected : Boolean
} )
defineEmits( ['select'] )

const validImage = ref( false )

// ✅ Safely get first image from image_list
const firstImage = computed( () => {
  const list = props.vendor?.image_list
  return Array.isArray( list ) && list.length > 0 ? list[0] : ''
} )

// ✅ Watch for valid image
watch(
  firstImage,
  newVal => {
    validImage.value = !!newVal && typeof newVal === 'string' && newVal.trim() !== ''
  },
  { immediate : true }
)

// ✅ Handle image error
function onImageError() {
  validImage.value = false
}
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

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px; /* default small gap */
}

/* 👇 Tighter gap on large screens (monitor size) */
@media (min-width: 1440px) {
  .card-content {
    gap: 6px;
  }
}

.content-main {
  flex: 1;

  .card-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }

  .card-meta {
    font-size: 13px;

    .meta-label {
      font-weight: 500;
      margin-right: 6px;
    }
  }
}

/* ✅ Circular avatar */
.vendor-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* 👇 Hide image on small screens */
@media (max-width: 768px) {
  .card-image {
    display: none;
  }
}
</style>
