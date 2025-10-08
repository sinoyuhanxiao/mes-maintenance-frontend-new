<template>
  <div class="maintenance-equipment-container">
    <div class="maintenance-equipment-header"></div>

    <div class="maintenance-equipment-content">
      <!-- Left: Tree -->
      <div class="maintenance-equipment-tree">
        <EquipmentTree
          ref="tree"
          @node-click="onNodeClick"
          @request-delete="onRequestDelete"
          @request-add="onRequestAdd"
        />
      </div>

      <!-- Right: Details pane -->
      <div class="maintenance-equipment-details">
        <template v-if="selectedNode">
          <!-- Tier 2 -->
          <EquipmentGroup
            v-if="isTier2"
            ref="t2Ref"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            @refresh-tree="handleRefreshTree"
            @after-delete="onT2AfterDelete"
            @request-select-node="selectNodeFromAnywhere"
          />
          <!-- Tier 3 -->
          <Equipment
            v-else-if="isTier3"
            ref="t3Ref"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            @refresh-tree="handleRefreshTree"
            @after-delete="onT3AfterDelete"
            @request-select-node="selectNodeFromAnywhere"
          />
          <SubEquipment
            v-else-if="isTier4"
            ref="t4Ref"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            @refresh-tree="handleRefreshTree"
            @after-delete="onT4AfterDelete"
            @request-select-node="selectNodeFromAnywhere"
          />
          <div v-else>Select a node to see details</div>
        </template>

        <div v-else>Select a node to see details</div>
      </div>

      <!-- ================= Add Dialogs ================= -->

      <!-- Add Tier 2 -->
      <el-dialog v-model="showAddT2" title="Add New Tier 2" width="600px" destroy-on-close draggable>
        <AddEquipmentGroup
          v-if="showAddT2"
          :parentId="addParentId"
          :productionLineId="prefilledProductionLineId"
          :productionLineName="prefilledProductionLineName"
          :lockProductionLine="true"
          @close="showAddT2 = false"
          @success="handleAddSuccess"
        />
      </el-dialog>

      <!-- Add Tier 3 -->
      <el-dialog v-model="showAddT3" title="Add New Tier 3" width="600px" destroy-on-close draggable>
        <AddEquipment
          v-if="showAddT3"
          :parentId="addParentId"
          :productionLineId="prefilledProductionLineId"
          :productionLineName="prefilledProductionLineName"
          :lockProductionLine="true"
          @close="showAddT3 = false"
          @success="handleAddSuccess"
        />
      </el-dialog>

      <!-- Add Tier 4 -->
      <el-dialog v-model="showAddT4" title="Add New Tier 4" width="600px" destroy-on-close draggable>
        <AddSubEquipment
          v-if="showAddT4"
          :parentId="addParentId"
          @close="showAddT4 = false"
          @success="handleAddSuccess"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

import EquipmentTree from './components/equipmentTree/index.vue'
import EquipmentGroup from './components/equipmentGroup/index.vue' // Tier 2 view
import Equipment from './components/equipment/index.vue' // Tier 3 view
import SubEquipment from './components/subEquipment/index.vue' // Tier 4 view

// Add forms
import AddEquipmentGroup from './components/equipmentGroup/components/AddEquipmentGroup.vue' // Add T2
import AddEquipment from './components/equipment/components/AddEquipment.vue' // Add T3
import AddSubEquipment from './components/subEquipment/components/AddSubEquipment.vue' // Add T4

const tree = ref( null )
const t2Ref = ref( null )
const t3Ref = ref( null )
const t4Ref = ref( null )
const pendingDeleteCtx = ref( null ) // { type: 't2'|'t3'|'t4', parentId, originalIndex }

const selectedNode = ref( null )
const breadcrumbPath = ref( [] )

const isTier2 = computed( () => selectedNode.value?.level === 2 )
const isTier3 = computed( () => selectedNode.value?.level === 3 )
const isTier4 = computed( () => selectedNode.value?.level === 4 )

/** Keep right pane in sync with left tree selection */
function onNodeClick( node, breadcrumb ) {
  selectedNode.value = node
  breadcrumbPath.value = breadcrumb ?? []
}

/** 🔑 Select a node in the left tree when a sub-item card requests it */
async function selectNodeFromAnywhere( id ) {
  const targetId = Number( id )
  if ( !targetId || !tree.value ) return

  // If your EquipmentTree exposes a convenience API:
  if ( typeof tree.value.focusNode === 'function' ) {
    await tree.value.focusNode( targetId ) // should expand/select + emit node-click
    return
  }

  // Fallback: manual get/set + call existing onNodeClick
  const node = tree.value.getNode?.( targetId )
  if ( node ) {
    tree.value.setCurrentKey?.( targetId )
    // Reuse your existing synchronization logic:
    onNodeClick( node.data ?? node, node.breadcrumb ?? breadcrumbPath.value )
  }
}

/** Delete requested from left tree: route to the correct right-pane dialog */
async function onRequestDelete( { level, node, breadcrumb } ) {
  selectedNode.value = node
  breadcrumbPath.value = breadcrumb ?? []
  await nextTick()

  if ( level === 2 ) {
    const t1Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t1Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't2', parentId : t1Id, originalIndex : idx }
    t2Ref.value?.openDeactivateDialog?.()
  }
  if ( level === 3 ) {
    const t2Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t2Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't3', parentId : t2Id, originalIndex : idx }
    t3Ref.value?.openDeactivateDialog?.()
  }
  if ( level === 4 ) {
    const t3Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t3Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't4', parentId : t3Id, originalIndex : idx }
    t4Ref.value?.openDeactivateDialog?.()
  }
}

async function onT2AfterDelete( { parentId /* T1 id */, deletedId } ) {
  tree.value?.removeNodeAndSelectNext( { deletedId, fallbackParentId : parentId } )
  pendingDeleteCtx.value = null
}
async function onT3AfterDelete( { parentId /* T2 id */, deletedId } ) {
  tree.value?.removeNodeAndSelectNext( { deletedId, fallbackParentId : parentId } )
  pendingDeleteCtx.value = null
}
async function onT4AfterDelete( { parentId /* T3 id */, deletedId } ) {
  tree.value?.removeNodeAndSelectNext( { deletedId, fallbackParentId : parentId } )
  pendingDeleteCtx.value = null
}

/** Refresh the left tree after right-side actions */
async function handleRefreshTree() {
  await tree.value?.refreshTree?.()
}

/* ================= Add flow (from left tree) ================= */
const showAddT2 = ref( false )
const showAddT3 = ref( false )
const showAddT4 = ref( false )
const addParentId = ref( null )

/* Prefill & lock Production Line (T1) in Add dialogs */
const prefilledProductionLineId = ref( null )
const prefilledProductionLineName = ref( '' )

function getT1FromBreadcrumb( bc = [] ) {
  return bc.find( n => n?.level === 1 ) || null
}
function cleanLabel( label = '' ) {
  return label.replace( /^T1:\s*/i, '' )
}

function onRequestAdd( { nextLevel, parentId, breadcrumb } ) {
  addParentId.value = parentId

  const t1 = getT1FromBreadcrumb( breadcrumb )
  prefilledProductionLineId.value = t1?.id ?? null
  prefilledProductionLineName.value = t1 ? cleanLabel( t1.label ) : ''

  showAddT2.value = nextLevel === 2
  showAddT3.value = nextLevel === 3
  showAddT4.value = nextLevel === 4
}

/** Called when any Add dialog succeeds. */
async function handleAddSuccess( payload ) {
  showAddT2.value = false
  showAddT3.value = false
  showAddT4.value = false

  await handleRefreshTree()
  await nextTick()

  const newId = payload?.id != null ? Number( payload.id ) : null
  if ( newId ) {
    if ( tree.value?.clearFilter ) {
      try {
        tree.value.clearFilter()
      } catch {}
    }
    await tree.value?.focusNode?.( newId )
  }
}
</script>

<style scoped>
.maintenance-equipment-container {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.maintenance-equipment-header {
  flex-shrink: 0;
}
.maintenance-equipment-content {
  flex: 1;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.maintenance-equipment-tree {
  width: 300px;
  border-right: 1px solid #ddd;
  padding: 10px;
  background-color: #fafafa;
  overflow-y: auto;
}
.maintenance-equipment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  width: calc(100vw - 685px);
}
</style>
