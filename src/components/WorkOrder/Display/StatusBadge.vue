<template>
  <el-tag :type="tagType" size="small" effect="dark" class="status-badge">
    {{ label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps( {
  status : {
    type : String,
    default : 'draft'
  }
} )

const tagTypeMap = {
  draft : 'info',
  completed : 'success',
  in_progress : 'warning',
  not_started : 'info'
}

const labelMap = {
  draft : 'Draft',
  completed : 'Completed',
  in_progress : 'In Progress',
  not_started : 'Not Started'
}

const normalized = computed( () => props.status?.toLowerCase?.() || 'draft' )

const tagType = computed( () => tagTypeMap[normalized.value] || 'info' )
const label = computed( () => labelMap[normalized.value] || 'Draft' )
</script>

<style scoped>
.status-badge {
  text-transform: capitalize;
}
</style>
