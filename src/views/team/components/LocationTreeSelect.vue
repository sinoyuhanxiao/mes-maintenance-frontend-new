<template>
  <el-tree-select
    v-model="selectedLocationIds"
    :data="locationTree"
    :props="locationNodeDefaultProps"
    :multiple="multiple"
    check-strictly
    show-checkbox
    node-key="id"
    :default-expand-all="false"
    :filterable="true"
    :placeholder="t('common.filterByLocationPlaceholder')"
    style="width: 100%"
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="2"
    @change="emitSelection"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getLocationTree } from '@/api/location.js'
import { ElTreeSelect } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps( {
  modelValue : {
    type : [Array, Number, String],
    default : () => []
  },
  multiple : {
    type : Boolean,
    default : true
  }
} )

const emit = defineEmits( ['update:modelValue', 'change'] )
const selectedLocationIds = ref( [] )
const locationTree = ref( [] )

const locationNodeDefaultProps = {
  label : node => node.name,
  children : 'children',
  value : 'id'
}

async function fetchLocationTree() {
  try {
    const res = await getLocationTree()
    locationTree.value = res.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch location tree:', err )
  }
}

function emitSelection() {
  if ( props.multiple ) {
    // Already an array
    emit( 'update:modelValue', selectedLocationIds.value || [] )
    emit( 'change', selectedLocationIds.value || [] )
  } else {
    // Single selection: wrap as array for consistency
    const val = selectedLocationIds.value
    emit( 'update:modelValue', val ? [val] : [] )
    emit( 'change', val ? [val] : [] )
  }
}

// keep local state in sync with parent
watch(
  () => props.modelValue,
  newVal => {
    if ( props.multiple ) {
      // expect array
      selectedLocationIds.value = Array.isArray( newVal ) ? newVal : newVal ? [newVal] : []
    } else {
      // expect single value
      selectedLocationIds.value = Array.isArray( newVal ) ? newVal[0] || null : newVal
    }
  },
  { immediate : true }
)

onMounted( async() => {
  await fetchLocationTree()
} )
</script>

<style scoped></style>
