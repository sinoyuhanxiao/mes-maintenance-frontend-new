<template>
  <div>
    <!-- Header: Search + Edit/Done -->
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px">
      <el-input v-model="filterText" placeholder="Search Location" clearable style="flex: 1" />
      <el-button size="default" :type="editMode ? 'success' : 'primary'" @click="toggleEdit" class="edit-toggle-btn">
        {{ editMode ? 'Done' : 'Edit' }}
      </el-button>
    </div>

    <el-scrollbar ref="scrollRef">
      <el-tree
        ref="treeRef"
        :data="displayedTree"
        :props="defaultProps"
        node-key="id"
        :default-expanded-keys="expandedKeys"
        :filter-node-method="filterNode"
        @node-click="onNodeClick"
        @node-expand="onExpand"
        @node-collapse="onCollapse"
        accordion
        :expand-on-click-node="false"
      >
        <!-- Custom node content -->
        <template #default="{ data }">
          <div class="node-row">
            <span class="node-label" :title="data.name">{{ data.name }}</span>

            <!-- Hide sub-loc text while editing -->
            <span v-if="!editMode && (data.children?.length ?? 0) > 0" class="node-subcount">
              {{ subCountText(data) }}
            </span>

            <span v-if="editMode" class="node-actions">
              <el-button link type="primary" size="default" @click.stop="onAddChildClick(data)">Add</el-button>
              <el-button
                link
                type="danger"
                size="default"
                :disabled="deleting.has(data.id)"
                @click.stop="deleteNode(data)"
              >
                Delete
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { deactivateLocation } from '@/api/location'
import { useErrorHandler } from '@/composables/useErrorHandler'

/* ---------------- Props & Emits ---------------- */
const props = defineProps( {
  treeData : { type : Array, required : true },
  defaultProps : { type : Object, required : true }
} )
const emit = defineEmits( ['node-click', 'save-tree', 'deleted', 'add-child'] )

/* ---------------- Refs ---------------- */
const treeRef = ref()
const scrollRef = ref()
const filterText = ref( '' )

/* ---------------- Edit Mode & Trees ---------------- */
const editMode = ref( false )
const liveTree = ref( [] )
const draftTree = ref( [] )

function deepClone( obj ) {
  return JSON.parse( JSON.stringify( obj ?? [] ) )
}

watch(
  () => props.treeData,
  val => {
    liveTree.value = deepClone( val )
    if ( editMode.value ) {
      draftTree.value = deepClone( val )
    }
  },
  { immediate : true, deep : true }
)

const displayedTree = computed( () => ( editMode.value ? draftTree.value : liveTree.value ) )

/* ---------------- Expanded state ---------------- */
const expandedSet = ref( new Set() )
const expandedKeys = computed( () => Array.from( expandedSet.value ) )

function onExpand( data ) {
  expandedSet.value.add( data.id )
}
function onCollapse( data ) {
  expandedSet.value.delete( data.id )
}

function reapplyExpanded() {
  const tree = treeRef.value
  if ( !tree ) return
  for ( const id of expandedSet.value ) {
    const node = tree.getNode?.( id )
    if ( node ) tree.expandNode?.( node, true )
  }
}

/* ---------------- Scroll helpers ---------------- */
function getScrollTop() {
  const wrap = scrollRef.value?.wrapRef
  return wrap ? wrap.scrollTop : 0
}
function setScrollTop( top ) {
  const wrap = scrollRef.value?.wrapRef
  if ( wrap ) wrap.scrollTop = top || 0
}

async function restoreTreeState( prevKey, prevTop ) {
  await nextTick()
  reapplyExpanded()
  if ( prevKey != null && treeRef.value?.getCurrentKey?.() !== prevKey ) {
    treeRef.value?.setCurrentKey( prevKey )
  }
  if ( prevTop != null ) setScrollTop( prevTop )
}

/* ---------------- Toggle Edit ---------------- */
async function toggleEdit() {
  const prevKey = treeRef.value?.getCurrentKey?.()
  const prevTop = getScrollTop()

  if ( !editMode.value ) {
    draftTree.value = deepClone( liveTree.value )
    editMode.value = true
  } else {
    liveTree.value = deepClone( draftTree.value )
    editMode.value = false
    emit( 'save-tree', deepClone( liveTree.value ) )
  }

  restoreTreeState( prevKey, prevTop )
}

/* ---------------- Search / Filter ---------------- */
const filterNode = ( value, data ) => {
  if ( !value ) return true
  return String( data.name || '' )
    .toLowerCase()
    .includes( String( value ).toLowerCase() )
}

watch( filterText, async val => {
  treeRef.value?.filter( val )
  await nextTick()
  const list = displayedTree.value
  const firstMatched = findFirstMatched( list, val )
  if ( firstMatched ) {
    emit( 'node-click', { id : firstMatched.id } )
    nextTick( () => {
      treeRef.value?.setCurrentKey( firstMatched.id )
    } )
  }
} )

function findFirstMatched( nodes, val ) {
  if ( !Array.isArray( nodes ) ) return null
  for ( const node of nodes ) {
    if ( filterNode( val, node ) ) return node
    const match = findFirstMatched( node.children, val )
    if ( match ) return match
  }
  return null
}

/* ---------------- Selection ---------------- */
const onNodeClick = data => {
  emit( 'node-click', data )
  treeRef.value?.setCurrentKey?.( data.id )
}

/* ---------------- Add / Delete ---------------- */
let tempId = 0
function genTempId() {
  tempId -= 1
  return tempId
}

function addChild( target ) {
  const newNode = {
    id : genTempId(),
    name : 'New Location',
    children : []
  }
  if ( !Array.isArray( target.children ) ) target.children = []
  target.children.push( newNode )

  nextTick( () => {
    const tnode = treeRef.value?.getNode( target )
    treeRef.value?.expandNode?.( tnode )
    treeRef.value?.setCurrentKey( newNode.id )
    emit( 'node-click', newNode )
  } )
}

function onAddChildClick( parent ) {
  const id = Number( parent?.id )
  if ( !Number.isFinite( id ) ) return
  emit( 'add-child', { id } )
}

function findContainer( arr, id, parent = null ) {
  if ( !Array.isArray( arr ) ) return null
  for ( let i = 0; i < arr.length; i++ ) {
    const n = arr[i]
    if ( n.id === id ) return { container : arr, index : i, parent }
    if ( Array.isArray( n.children ) ) {
      const res = findContainer( n.children, id, n )
      if ( res ) return res
    }
  }
  return null
}

function removeById( list, id ) {
  if ( !Array.isArray( list ) ) return false
  for ( let i = 0; i < list.length; i++ ) {
    const n = list[i]
    if ( n.id === id ) {
      list.splice( i, 1 )
      return true
    }
    if ( removeById( n.children, id ) ) return true
  }
  return false
}

function findAnyNode( list ) {
  if ( !Array.isArray( list ) ) return null
  const stack = [...list]
  while ( stack.length ) {
    const n = stack.shift()
    if ( n ) return n
    if ( n?.children?.length ) stack.push( ...n.children )
  }
  return null
}

const deleting = ref( new Set() )
const { confirmAction, showSuccess } = useErrorHandler()

async function deleteNode( target ) {
  const id = Number( target?.id )
  if ( !Number.isFinite( id ) ) return
  const prevTop = getScrollTop()

  const confirmed = await confirmAction( {
    title : 'Confirm',
    message : `Are you sure you want to delete "${target?.name || 'this location'}"?`,
    confirmButtonText : 'Delete',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
  if ( !confirmed ) return

  const source = editMode.value ? draftTree.value : liveTree.value
  const info = findContainer( source, id )
  let nextSelection = null
  if ( info ) {
    if ( info.parent ) {
      nextSelection = info.parent
    } else {
      const { container, index } = info
      const nextIdx = index + 1 < container.length ? index + 1 : -1
      const prevIdx = index - 1 >= 0 ? index - 1 : -1
      if ( nextIdx !== -1 ) nextSelection = container[nextIdx]
      else if ( prevIdx !== -1 ) nextSelection = container[prevIdx]
    }
  }

  deleting.value.add( id )
  try {
    await deactivateLocation( id )
    removeById( draftTree.value, id )
    removeById( liveTree.value, id )
    expandedSet.value.delete( id )
    showSuccess( 'Location deleted successfully' )
    emit( 'deleted', id )

    if ( !nextSelection ) nextSelection = findAnyNode( displayedTree.value )
    await nextTick()
    reapplyExpanded()
    if ( nextSelection ) {
      treeRef.value?.setCurrentKey( nextSelection.id )
      emit( 'node-click', nextSelection )
    } else {
      treeRef.value?.setCurrentKey?.( null )
      emit( 'node-click', null )
    }
    setScrollTop( prevTop )
  } catch ( err ) {
    ElMessage.error( 'Failed to delete location' )
    console.error( 'delete location failed:', err )
  } finally {
    deleting.value.delete( id )
  }
}

/* ---------------- Sub Location Counter ---------------- */
function subCountText( node ) {
  const n = Array.isArray( node?.children ) ? node.children.length : 0
  return `${n} sub-loc${n === 1 ? '' : 's'}`
}

/* ---------------- Expose ---------------- */
defineExpose( { treeRef, toggleEdit, addChild, deleteNode } )
</script>

<style scoped>
.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.node-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-subcount {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 6px;
  padding-right: 10px; /* 👈 added small right padding */
}

.node-actions {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 0;
  white-space: nowrap;
  padding-right: 4px;
}

.edit-toggle-btn {
  width: 60px;
  justify-content: center;
  margin-right: 8px;
}
</style>
