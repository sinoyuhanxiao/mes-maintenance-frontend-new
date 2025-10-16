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
    :style="{ width }"
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="maxCollapseTags"
    :default-expanded-keys="expandedKeys"
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
  },
  maxCollapseTags : {
    type : Number,
    default : 2
  },
  width : {
    type : String,
    default : '100%'
  }
} )

const emit = defineEmits( ['update:modelValue', 'change'] )
const selectedLocationIds = ref( [] )
const locationTree = ref( [] )
const expandedKeys = ref( [] )

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
  updateExpandedKeys()
}

/**
 * Compute ancestor IDs for all selected nodes.
 * When a node is selected, recursively find all its parent nodes and add them to expandedKeys.
 */
function updateExpandedKeys() {
  if ( !Array.isArray( selectedLocationIds.value ) || !selectedLocationIds.value.length ) {
    expandedKeys.value = []
    return
  }

  const parentMap = buildParentMap( locationTree.value )
  const expanded = new Set()

  for ( const id of selectedLocationIds.value ) {
    let current = parentMap[id]
    while ( current ) {
      expanded.add( current )
      current = parentMap[current]
    }
  }

  expandedKeys.value = Array.from( expanded )
}

/**
 * Build a map of node.id → parent.id
 */
function buildParentMap( tree, parentId = null, map = {} ) {
  for ( const node of tree ) {
    map[node.id] = parentId
    if ( node.children?.length ) {
      buildParentMap( node.children, node.id, map )
    }
  }
  return map
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
    updateExpandedKeys()
  },
  { immediate : true }
)

onMounted( async() => {
  await fetchLocationTree()
} )
</script>

<style scoped></style>
