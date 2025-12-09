<template>
  <div class="simple-tree-container">
    <!-- Toolbar: Search + Edit toggle (now sticky) -->
    <div class="tree-toolbar">
      <el-input v-model="filterText" placeholder="Search by name" clearable class="tree-search" />
      <el-button class="edit-toggle" :type="isEditMode ? 'success' : 'primary'" @click="isEditMode = !isEditMode">
        {{ isEditMode ? 'Done' : 'Edit' }}
      </el-button>
    </div>

    <el-tree
      :key="treeRenderKey"
      ref="treeRef"
      :data="treeData"
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :current-node-key="currentKey"
      highlight-current
      :props="defaultProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      :render-after-expand="false"
      accordion
      @node-click="(data, node) => handleNodeClick(data, node)"
      style="max-width: 600px"
    >
      <template #default="{ node, data }">
        <div class="node-row" :class="{ 'is-view': !isEditMode }">
          <div class="node-content">
            <el-icon v-if="getIconForLevel(data.level)" class="node-icon">
              <component :is="getIconForLevel(data.level)" />
            </el-icon>
            <span class="node-label" :title="data.label">{{ data.label }}</span>
          </div>

          <!-- actions -->
          <div class="node-actions" v-if="isEditMode && canShowActions(data)">
            <!-- Add -->
            <el-button class="action-btn" link @click.stop="addNode(data, node)">
              <el-icon><Plus /></el-icon>
            </el-button>

            <!-- Delete -->
            <el-button class="action-btn delete-btn" link @click.stop="requestDelete(node, data)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getEquipmentTree } from '@/api/equipment.js'
import { Plus, Delete, OfficeBuilding } from '@element-plus/icons-vue'

const emit = defineEmits( ['node-click', 'request-delete', 'request-add'] )

/* ---------- state ---------- */
const isEditMode = ref( false )
const filterText = ref( '' )
const treeRef = ref( null )
const loading = ref( false )
const error = ref( null )
const treeData = ref( [] )

/* bind expanded state + selection so the left tree reflects default selection */
const expandedKeys = ref( [] ) // ids to expand
const currentKey = ref( null ) // id to highlight/select
const treeRenderKey = ref( 0 ) // bump to remount if needed

const defaultProps = { children : 'children', label : 'label' }

/* ---------- icons ---------- */
const getIconForLevel = level => {
  if ( level === 0 ) return OfficeBuilding
  return null
}

/* ---------- transform + fetch ---------- */
const transformNode = ( node, level = 0 ) => {
  const base = { id : node.id, label : level === 0 ? node.name : `T${level}: ${node.name}`, level }
  if ( level >= 4 ) return { ...base, children : undefined }
  const kids = Array.isArray( node.children ) ? node.children.map( c => transformNode( c, level + 1 ) ) : undefined
  return { ...base, children : kids && kids.length ? kids : undefined }
}

/* ---------- first T2 helper (with fallback to T1) ---------- */
function findFirstT2Path( nodes ) {
  for ( const root of nodes ?? [] ) {
    const l1s = root?.children ?? []
    for ( const t1 of l1s ) {
      const l2s = t1?.children ?? []
      if ( l2s.length ) {
        return { expand : [root.id, t1.id], select : l2s[0].id }
      }
    }
  }
  for ( const root of nodes ?? [] ) {
    const l1s = root?.children ?? []
    if ( l1s.length ) {
      return { expand : [root.id], select : l1s[0].id }
    }
  }
  return null
}

function applyExpandedPath( keys ) {
  expandedKeys.value = keys
  if ( treeRef.value?.setExpandedKeys ) {
    treeRef.value.setExpandedKeys( keys )
  } else {
    treeRenderKey.value++ // fallback remount so :default-expanded-keys applies
  }
}

async function openAndSelectFirstT2IfNoneOpen() {
  await nextTick()
  const haveAnyOpen = ( treeRef.value?.getExpandedKeys?.() ?? expandedKeys.value )?.length > 0
  if ( haveAnyOpen ) return

  const info = findFirstT2Path( treeData.value )
  if ( !info ) return

  applyExpandedPath( info.expand )
  currentKey.value = info.select

  // also emit to parent so right pane stays in sync
  const nodeToSelect = treeRef.value?.getNode?.( info.select )
  if ( nodeToSelect ) {
    const breadcrumb = []
    let cur = nodeToSelect
    while ( cur ) {
      breadcrumb.unshift( cur.data )
      cur = cur.parent
    }
    emit( 'node-click', nodeToSelect.data, breadcrumb )
  }
}

const fetchEquipmentTree = async() => {
  loading.value = true
  error.value = null
  try {
    const response = await getEquipmentTree()
    let dataArray
    if ( response.data?.data ) dataArray = response.data.data
    else if ( Array.isArray( response.data ) ) dataArray = response.data
    else if ( response.data ) dataArray = [response.data]
    else dataArray = []

    treeData.value = dataArray.map( n => transformNode( n, 0 ) )
    await nextTick()
    await openAndSelectFirstT2IfNoneOpen()
  } catch ( err ) {
    error.value = err.message || 'Failed to load equipment tree'
  } finally {
    loading.value = false
  }
}

const refreshTree = async() => {
  await fetchEquipmentTree()
}

onMounted( fetchEquipmentTree )

/* ---------- filter ---------- */
watch( filterText, val => treeRef.value?.filter( val ) )
const filterNode = ( value, data ) => !value || data.label.toLowerCase().includes( value.toLowerCase() )

/* ---------- click -> breadcrumb up + keep selection ---------- */
function handleNodeClick( data, node ) {
  currentKey.value = data.id
  const path = []
  let current = node
  while ( current ) {
    path.unshift( current.data )
    current = current.parent
  }
  emit( 'node-click', data, path )
}

/* ---------- show actions starting from Tier1 ---------- */
function canShowActions( item ) {
  return ( item.level ?? 0 ) >= 0
}

/* ---------- breadcrumbs helper for any node ctx ---------- */
function collectBreadcrumbFromNodeCtx( nodeCtx ) {
  const bc = []
  let cur = nodeCtx
  while ( cur ) {
    bc.unshift( cur.data )
    cur = cur.parent
  }
  return bc
}

/* ---------- NEW: expand the clicked node’s ancestor path (accordion-safe) ---------- */
function expandPathForNodeCtx( nodeCtx ) {
  const pathIds = []
  let cur = nodeCtx
  while ( cur ) {
    pathIds.unshift( cur.data.id )
    cur = cur.parent
  }
  // Keep ancestors expanded (exclude leaf itself) so caret is visible & branch open.
  const expandIds = pathIds.slice( 0, -1 )
  expandedKeys.value = expandIds
  treeRef.value?.setExpandedKeys?.( expandIds )
}

/* ---------- delete/add: emit to parent ---------- */
function addNode( target, nodeCtx ) {
  const nextLevel = ( target.level ?? 0 ) + 1
  if ( nextLevel > 4 ) return ElMessage.warning( 'Reached deepest level.' )

  // Ensure the clicked node’s branch is open immediately (works with accordion)
  expandPathForNodeCtx( nodeCtx )

  emit( 'request-add', {
    nextLevel,
    parentId : target.id, // new child’s parent
    node : target, // clicked node’s data
    breadcrumb : collectBreadcrumbFromNodeCtx( nodeCtx )
  } )
}

function requestDelete( nodeCtx, dataItem ) {
  const level = dataItem.level ?? 0
  emit( 'request-delete', {
    level, // 0, 1, 2, 3, or 4
    node : dataItem, // node data
    breadcrumb : collectBreadcrumbFromNodeCtx( nodeCtx )
  } )
}

/* ---- helpers used by parent ---- */
function findNodeById( id, nodes = treeData.value ) {
  for ( const n of nodes || [] ) {
    if ( n.id === id ) return n
    if ( Array.isArray( n.children ) ) {
      const hit = findNodeById( id, n.children )
      if ( hit ) return hit
    }
  }
  return null
}

function buildPathNodesTo( id, nodes = treeData.value, path = [] ) {
  for ( const n of nodes || [] ) {
    const nextPath = [...path, n]
    if ( n.id === id ) return nextPath
    if ( Array.isArray( n.children ) ) {
      const hit = buildPathNodesTo( id, n.children, nextPath )
      if ( hit ) return hit
    }
  }
  return null
}

function getChildrenOf( parentId ) {
  const p = findNodeById( parentId )
  return Array.isArray( p?.children ) ? p.children : []
}

/**
 * Programmatically expand all ancestors and select the node.
 * Call this from the parent after a successful "create" with the new node id:
 *   $refs.leftTree.focusNode(newId)
 */
function focusNode( id ) {
  const pathNodes = buildPathNodesTo( id )
  if ( !pathNodes ) {
    console.warn( `Equipment with ID ${id} not found in tree` )
    return false
  }
  const expandIds = pathNodes.slice( 0, -1 ).map( n => n.id )

  expandedKeys.value = expandIds
  treeRef.value?.setExpandedKeys?.( expandIds )

  currentKey.value = id
  treeRef.value?.setCurrentKey?.( id )

  const elNode = treeRef.value?.getNode?.( id )
  if ( elNode ) {
    const breadcrumb = []
    let cur = elNode
    while ( cur ) {
      breadcrumb.unshift( cur.data )
      cur = cur.parent
    }
    emit( 'node-click', elNode.data, breadcrumb )
    return true
  }
  return false
}

// ADD inside <script setup> of the tree component
async function removeNodeAndSelectNext( { deletedId, fallbackParentId = null } ) {
  const elTree = treeRef.value
  if ( !elTree ) return null

  const del = elTree.getNode?.( deletedId )

  // If already gone, try fallback parent
  if ( !del ) {
    if ( fallbackParentId != null ) {
      const p = elTree.getNode?.( fallbackParentId )
      if ( p ) {
        expandPathForNodeCtx( p ) // keep ancestors open (accordion-safe)
        currentKey.value = fallbackParentId
        elTree.setCurrentKey?.( fallbackParentId )
        emit( 'node-click', p.data, collectBreadcrumbFromNodeCtx( p ) )
        return fallbackParentId
      }
    }
    return null
  }

  // Decide next selection BEFORE removal: next sib -> prev sib -> parent
  const parent = del.parent
  let nextKey = null
  if ( parent && Array.isArray( parent.childNodes ) ) {
    const sibs = parent.childNodes.filter( n => n.key !== deletedId )
    if ( sibs.length ) {
      const idx = parent.childNodes.findIndex( n => n.key === deletedId )
      const candidate = sibs[idx] || sibs[idx - 1] || sibs[0]
      nextKey = candidate?.key ?? null
    } else {
      nextKey = parent.key
    }
  } else if ( fallbackParentId != null ) {
    nextKey = fallbackParentId
  }

  // Remove in place (no rebuild → no collapse)
  elTree.remove?.( del )

  // Reselect + re-expand ancestor path (works with accordion)
  if ( nextKey != null ) {
    await nextTick()
    const nextEl = elTree.getNode?.( nextKey )
    if ( nextEl ) {
      expandPathForNodeCtx( nextEl ) // opens ancestors; accordion keeps one per level
      currentKey.value = nextKey
      elTree.setCurrentKey?.( nextKey )
      emit( 'node-click', nextEl.data, collectBreadcrumbFromNodeCtx( nextEl ) )
      return nextKey
    }
  }

  // Fallback to parent if needed
  if ( parent ) {
    await nextTick()
    expandPathForNodeCtx( parent )
    currentKey.value = parent.key
    elTree.setCurrentKey?.( parent.key )
    emit( 'node-click', parent.data, collectBreadcrumbFromNodeCtx( parent ) )
    return parent.key
  }

  return null
}

defineExpose( { refreshTree, getChildrenOf, focusNode, removeNodeAndSelectNext } )
</script>

<style scoped>
.simple-tree-container {
  max-width: 620px;
  background-color: #fafafa;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Make the tree area the scroller so the sticky bar stays put */
.el-tree {
  background-color: #fafafa;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* Sticky, compact, fully opaque toolbar */
.tree-toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color-light);
}
.tree-search {
  flex: 1;
}

/* 2-column grid in edit mode: [label] [actions]; 1 column in view mode */
.node-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}
.node-row.is-view {
  grid-template-columns: 1fr;
}

/* label area + ellipsis */
.node-content {
  display: flex;
  align-items: center;
  min-width: 0;
}
.node-icon {
  margin-right: 8px;
  font-size: 16px;
  flex-shrink: 0;
}
.node-label {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* actions pinned right, compact */
.node-actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

/* remove Element Plus default 12px gap between adjacent buttons */
:deep(.node-actions .el-button + .el-button) {
  margin-left: 0 !important;
}

/* compact link buttons */
:deep(.node-actions .el-button.is-link) {
  padding: 0 2px;
  line-height: 18px;
  min-height: 0;
}

/* EP wrapper safety */
:deep(.el-tree-node__content) {
  min-width: 0;
}

.node-icon-img {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  display: inline-block;
}
.node-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  color: #409eff; /* default Element Plus primary */
}

.delete-btn {
  color: #f56c6c;
}
</style>
