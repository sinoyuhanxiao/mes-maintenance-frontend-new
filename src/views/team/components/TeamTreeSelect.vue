<template>
  <el-tree-select
    v-model="selectedValue"
    :data="treeData"
    :props="defaultProps"
    :multiple="multiple"
    :show-checkbox="multiple"
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
  /** v-model for selected team ids */
  modelValue : {
    type : [Array, Number, String, null],
    default : null
  },
  /** Control single or multiple selection */
  multiple : {
    type : Boolean,
    default : true
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

/**
 * Computed binding for el-tree-select
 * Keeps consistent type between single and multi modes
 */
const selectedValue = computed( {
  get() {
    if ( props.multiple ) {
      return Array.isArray( props.modelValue ) ? props.modelValue : props.modelValue ? [props.modelValue] : []
    } else {
      return Array.isArray( props.modelValue ) ? props.modelValue[0] || null : props.modelValue
    }
  },
  set( val ) {
    if ( props.multiple ) {
      emit( 'update:modelValue', Array.isArray( val ) ? val : [val] )
    } else {
      // Emit scalar number/string/null in single mode
      emit( 'update:modelValue', val ?? null )
    }
  }
} )

// Tree node rendering
const defaultProps = {
  label : node => {
    // Safely compute member count (placeholder for now)
    // const memberCount = 'x' // ← or node.team_members_id?.length ?? 0 later

    // Compose label: name (code) - member count
    const namePart = node.code ? `${node.name} (${node.code})` : node.name
    return `${namePart}`
  },
  value : 'id',
  children : 'children'
}

// Load tree data
onMounted( async() => {
  try {
    const res = await getAllTeamTree()
    let tree = res.data || []

    // Disable specific node and its descendants if applicable
    if ( props.disableTeamId ) {
      tree = markDisabled( tree, props.disableTeamId )
    }

    treeData.value = tree
  } catch ( err ) {
    console.error( 'Failed to load team tree:', err )
  }
} )

// Watch prop updates
watch(
  () => props.disableTeamId,
  async newId => {
    if ( !treeData.value.length || !newId ) return

    // Re-mark tree
    treeData.value = markDisabled( treeData.value, newId )
  }
)
</script>
