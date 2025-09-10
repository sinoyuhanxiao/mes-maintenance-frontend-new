<template>
  <el-tag :type="tagType" :title="category?.description || $t('workOrder.messages.noData')" effect="plain">
    {{ categoryName }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryTagType } from '@/utils/general'

// Props
const props = defineProps({
  category: {
    type: Object,
    default: () => ({}),
  },
})

// Computed
const categoryName = computed(() => {
  return props.category?.name || '-'
})

const tagType = computed(() => {
  return getCategoryTagType(props.category?.name)
})

defineOptions({
  name: 'CategoryTag',
})
</script>
