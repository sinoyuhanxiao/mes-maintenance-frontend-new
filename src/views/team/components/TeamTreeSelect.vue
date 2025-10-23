<template>
  <el-tree-select
    v-model="selectedValue"
    :data="treeData"
    :props="defaultProps"
    :multiple="false"
    :show-checkbox="false"
    check-strictly
    node-key="id"
    :filterable="true"
    :default-expand-all="true"
    :render-after-expand="false"
    clearable
    style="width: 100%"
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="maxCollapseTags"
    :placeholder="'Select a team'"
    teleported
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElTreeSelect } from 'element-plus'
import { getAllTeamTree } from '@/api/team'

const props = defineProps( {
  /** v-model for selected team id */
  modelValue : {
    type : [Number, String, null],
    default : null
  },
  /** ID of team that should be disabled (e.g. current team when editing) */
  disableTeamId : {
    type : [Number, String, null],
    default : null
  },
  maxCollapseTags : {
    type : Number,
    default : 2
  }
} )

const emit = defineEmits( ['update:modelValue', 'change'] )
const treeData = ref( [] )

/**
 * Recursively mark nodes disabled if they match the disabled ID or are children of it.
 */
function markDisabled( nodes, disabledId ) {
  return nodes.map( node => {
    const newNode = { ...node }

    if ( node.id === disabledId || disabledId === '__disable_all__' ) {
      newNode.disabled = true
      if ( node.children?.length ) {
        newNode.children = markDisabled( node.children, '__disable_all__' )
      }
      return newNode
    }

    if ( node.children?.length ) {
      newNode.children = markDisabled( node.children, disabledId )
    }
    return newNode
  } )
}

// Helper to load tree and disable target nodes
async function reloadTree( disableId ) {
  try {
    const res = await getAllTeamTree()
    let tree = res.data || []

    if ( disableId ) {
      tree = markDisabled( tree, disableId )
    }

    treeData.value = tree
  } catch ( err ) {
    console.error( 'Failed to load team tree:', err )
  }
}

/**
 * Computed binding for el-tree-select
 * Keeps consistent type between single and multi modes
 */
const selectedValue = computed( {
  get() {
    return props.modelValue
  },
  set( val ) {
    emit( 'update:modelValue', val ?? null )
  }
} )

// Tree node rendering
const defaultProps = {
  label : node => {
    const namePart = `${node.name}  (ID: ${node.id}, Code: ${node.code || '-'})`
    return `${namePart}`
  },
  value : 'id',
  children : 'children'
}

// Load tree data
onMounted( async() => {
  await reloadTree( props.disableTeamId )
} )

// Watch prop updates
watch(
  () => props.disableTeamId,
  async newId => {
    await reloadTree( newId )
  }
)

// --- Watch for modelValue changes ---
watch(
  () => props.modelValue,
  async newVal => {
    // Reload the tree each time the selected team changes
    await reloadTree( props.disableTeamId )
  }
)
</script>
