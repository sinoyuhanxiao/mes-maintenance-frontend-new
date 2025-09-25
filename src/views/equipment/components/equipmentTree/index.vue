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
            <el-icon class="node-icon">
              <component :is="getIconForLevel(data.level)" />
            </el-icon>
            <span class="node-label" :title="data.label">{{ data.label }}</span>
          </div>

          <!-- actions -->
          <div class="node-actions" v-if="isEditMode && canShowActions(data)">
            <el-button
              v-if="(data.level ?? 0) <= 3"
              class="action-btn"
              type="primary"
              link
              @click.stop="addNode(data, node)"
            >
              Add
            </el-button>

            <el-button
              v-if="(data.level ?? 0) >= 2"
              class="action-btn"
              type="danger"
              link
              @click.stop="requestDelete(node, data)"
            >
              Delete
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, h } from 'vue'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, Setting, Tools, Folder } from '@element-plus/icons-vue'
import { getEquipmentTree } from '@/api/equipment.js'

import productionLineUrl from '@/icons/svg/production-line.svg?url'
import equipmentGroupUrl from '@/icons/svg/equipment-group.svg?url'

const ProductionLineIcon = () => h( 'img', { src : productionLineUrl, alt : '', class : 'node-icon-img' } )
const EquipmentGroupIcon = () => h( 'img', { src : equipmentGroupUrl, alt : '', class : 'node-icon-img' } )

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
  switch ( level ) {
    case 0:
      return OfficeBuilding
    case 1:
      return ProductionLineIcon
    case 2:
      return EquipmentGroupIcon
    case 3:
      return Setting
    case 4:
      return Tools
    default:
      return Folder
  }
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
  return ( item.level ?? 0 ) >= 1
}

/* ---------- delete/add: emit to parent ---------- */
function collectBreadcrumbFromNodeCtx( nodeCtx ) {
  const bc = []
  let cur = nodeCtx
  while ( cur ) {
    bc.unshift( cur.data )
    cur = cur.parent
  }
  return bc
}

function addNode( target, nodeCtx ) {
  const nextLevel = ( target.level ?? 0 ) + 1
  if ( nextLevel > 4 ) return ElMessage.warning( 'Reached deepest level.' )
  emit( 'request-add', {
    nextLevel, // 2 | 3 | 4
    parentId : target.id, // new child’s parent
    node : target, // clicked node’s data
    breadcrumb : collectBreadcrumbFromNodeCtx( nodeCtx )
  } )
}

function requestDelete( nodeCtx, dataItem ) {
  const level = dataItem.level ?? 0
  if ( level === 1 ) return ElMessage.warning( 'Tier 1 cannot be deleted.' )
  emit( 'request-delete', {
    level, // 2, 3, or 4
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

defineExpose( { refreshTree, getChildrenOf, focusNode } )
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
</style>
