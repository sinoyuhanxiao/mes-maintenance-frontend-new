<script setup>
import { useI18n } from 'vue-i18n'

defineProps( {
  equipment : {
    type : Object,
    default : null
  }
} )

const { t } = useI18n()
</script>

<template>
  <!-- Unknown equipment -->
  <span v-if="!equipment">
    <el-tag size="small" type="info" effect="light">
      {{ t('equipment.unknownEquipment') }}
    </el-tag>
  </span>

  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>
        <el-text>{{ 'ID' }}: {{ equipment.id }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.name') }}: {{ equipment.name }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.code') }}: {{ equipment.code }}</el-text>
      </div>
      <div v-if="equipment.node_type">
        <el-text>{{ t('common.type') }}: {{ equipment.node_type?.default_label }}</el-text>
      </div>
    </template>

    <template #reference>
      <el-tag :type="'primary'" size="small" effect="light">
        {{ equipment.name }}
      </el-tag>
    </template>
  </el-popover>
</template>

<style scoped></style>
