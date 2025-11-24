<template>
  <div class="work-order-image">
    <el-image
      v-if="hasImage"
      class="circular-image"
      style="width: 50px; height: 50px"
      :src="imagePath[0]"
      :preview-src-list="[imagePath[0]]"
      loading="lazy"
      :alt="$t('workOrder.table.preview')"
      fit="cover"
    >
      <template #error>
        <div class="image-slot">
          <el-icon><IconPicture /></el-icon>
        </div>
      </template>
    </el-image>

    <el-image v-else class="circular-image" style="width: 50px; height: 50px">
      <template #error>
        <el-tooltip>
          <template #content>
            <span>{{ $t('workOrder.messages.noImagePlaceholder') }}</span>
          </template>
          <div class="image-slot">
            <el-icon><IconPicture /></el-icon>
          </div>
        </el-tooltip>
      </template>
    </el-image>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Picture as IconPicture } from '@element-plus/icons-vue'

// Props
const props = defineProps( {
  imagePath : {
    type : Array,
    default : () => []
  }
} )

// Computed
const hasImage = computed( () => {
  return props.imagePath && props.imagePath.length > 0
} )

defineOptions( {
  name : 'WorkOrderImage'
} )
</script>

<style scoped lang="scss">
.work-order-image {
  .circular-image {
    border-radius: 50%;
    overflow: hidden;

    :deep(img) {
      border-radius: 50%;
    }
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
    border-radius: 50%;
  }
}
</style>
