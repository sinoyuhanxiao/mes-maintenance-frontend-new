<template>
  <el-tree-select
    v-model="selectedLocationIds"
    :data="locationTree"
    :props="locationNodeDefaultProps"
    multiple
    check-strictly
    show-checkbox
    node-key="id"
    :default-expand-all="false"
    :filterable="true"
    :placeholder="t('team.placeholder.selectLocation')"
    style="width: 100%"
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="2"
    @change="emitSelection"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLocationTree } from '@/api/location.js'
import { ElTreeSelect } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const selectedLocationIds = ref( [] )
const locationTree = ref( [] )

const locationNodeDefaultProps = {
  label : node => node.name,
  children : 'children',
  value : 'id'
}

const emit = defineEmits( ['update:modelValue', 'change'] )

async function fetchLocationTree() {
  try {
    const res = await getLocationTree()
    locationTree.value = res.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch location tree:', err )
  }
}

function emitSelection() {
  // Emit flat array of selected node ids
  const flatSelected = Array.isArray( selectedLocationIds.value )
    ? selectedLocationIds.value
    : [selectedLocationIds.value]

  emit( 'update:modelValue', flatSelected )
  emit( 'change', flatSelected )
}

onMounted( async() => {
  await fetchLocationTree()
} )
</script>

<style scoped></style>
