<script setup>
import { useI18n } from 'vue-i18n'

defineProps( {
  location : {
    type : Object,
    default : null
  }
} )

const { t } = useI18n()
</script>

<template>
  <!-- Unknown location -->
  <span v-if="!location">
    <el-tag size="small" type="info" effect="light">
      {{ t('location.unknownLocation') }}
    </el-tag>
  </span>

  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>
        <el-text>{{ 'ID' }}: {{ location.id }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.name') }}: {{ location.name }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.code') }}: {{ location.code }}</el-text>
      </div>
      <div v-if="location.location_type">
        <el-text>{{ t('common.type') }}: {{ location.location_type?.name }}</el-text>
      </div>

      <div v-if="location.image_list?.length > 0">
        <el-image
            :src="location.image_list[0]"
            fit="cover"
            :preview-src-list="location.image_list"
            class="location-image-preview"
            :z-index="2000"
            preview-teleported
        />
      </div>

    </template>

    <template #reference>
      <el-tag :type="'primary'" size="small" effect="light">
        {{ location.name }}
      </el-tag>
    </template>
  </el-popover>
</template>

<style scoped>
.location-image-preview {
  flex-shrink: 0;
  width: 200px;
  height: 100px;
  overflow: hidden;
  border: 2px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
  cursor: pointer;
}
</style>
