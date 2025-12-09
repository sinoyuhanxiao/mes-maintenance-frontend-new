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
          <!-- Tier 4 -->
          <SubEquipment
            v-else-if="isTier4"
            ref="t4Ref"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            @refresh-tree="handleRefreshTree"
            @after-delete="onT4AfterDelete"
            @request-select-node="selectNodeFromAnywhere"
          />
          <!-- Empty-state when a node is selected but not Tier 2/3/4 -->
          <div v-else class="no-selection-content">
            <el-icon class="no-selection-icon"><Document /></el-icon>
            <h3>Select a Tier 2 or lower tier to view details</h3>
            <el-button type="primary" @click="createNewTemplate" style="margin-top: 8px">
              <el-icon><Plus /></el-icon>
              Tier 0 Site
            </el-button>
          </div>
        </template>

        <!-- Empty-state when NO node is selected -->
        <div v-else class="no-selection-content">
          <el-icon class="no-selection-icon"><Document /></el-icon>
          <h3>Select a Tier 2 or lower tier to view details</h3>
          <el-button type="primary" @click="createNewTemplate" style="margin-top: 8px">
            <el-icon><Plus /></el-icon>
            New Site (Tier 0)
          </el-button>
        </div>
      </div>

      <!-- ================= Add Dialogs ================= -->

      <!-- 🔹 Add Tier 0 Site -->
      <el-dialog v-model="showAddT0" title="Add New Tier 0" width="600px" destroy-on-close draggable>
        <AddSite v-if="showAddT0" :parentId="addParentId" @close="showAddT0 = false" @success="handleAddSuccess" />
      </el-dialog>

      <!-- 🔹 Add Tier 1 -->
      <el-dialog v-model="showAddT1" title="Add New Tier 1" width="600px" destroy-on-close draggable>
        <AddProductionLine
          v-if="showAddT1"
          :parentId="addParentId"
          :productionLineId="prefilledProductionLineId"
          :productionLineName="prefilledProductionLineName"
          :lockProductionLine="false"
          @close="showAddT1 = false"
          @success="handleAddSuccess"
        />
      </el-dialog>

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

      <!-- Deactivate Tier 0 -->
      <el-dialog v-model="showDeactivateT0" title="Delete Tier 0" width="600px" destroy-on-close draggable>
        <DeactivateNode
          v-if="showDeactivateT0 && selectedNode"
          :equipmentId="selectedNode.id"
          @close="showDeactivateT0 = false"
          @success="handleT0DeleteSuccess"
          @refresh-tree="handleRefreshTree"
        />
      </el-dialog>

      <!-- Deactivate Tier 1 -->
      <el-dialog v-model="showDeactivateT1" title="Delete Tier 1" width="600px" destroy-on-close draggable>
        <DeactivateNode
          v-if="showDeactivateT1 && selectedNode"
          :equipmentId="selectedNode.id"
          @close="showDeactivateT1 = false"
          @success="handleT1DeleteSuccess"
          @refresh-tree="handleRefreshTree"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Plus } from '@element-plus/icons-vue'

import EquipmentTree from './components/equipmentTree/index.vue'
import EquipmentGroup from './components/equipmentGroup/index.vue' // Tier 2 view
import Equipment from './components/equipment/index.vue' // Tier 3 view
import SubEquipment from './components/subEquipment/index.vue' // Tier 4 view

// Add forms
import AddEquipmentGroup from './components/equipmentGroup/components/AddEquipmentGroup.vue' // Add T2
import AddEquipment from './components/equipment/components/AddEquipment.vue' // Add T3
import AddSubEquipment from './components/subEquipment/components/AddSubEquipment.vue' // Add T4
import DeactivateNode from './components/common/DeactivateNode.vue'
import AddProductionLine from './components/productionLine/AddProductionLine.vue'
import AddSite from './components/site/AddSite.vue' // 🔹 NEW: Add Tier 0 Site

const route = useRoute()
const tree = ref( null )
const t2Ref = ref( null )
const t3Ref = ref( null )
const t4Ref = ref( null )
const pendingDeleteCtx = ref( null ) // { type: 't0'|'t1'|'t2'|'t3'|'t4', parentId, originalIndex }

const selectedNode = ref( null )
const breadcrumbPath = ref( [] )

const isTier2 = computed( () => selectedNode.value?.level === 2 )
const isTier3 = computed( () => selectedNode.value?.level === 3 )
const isTier4 = computed( () => selectedNode.value?.level === 4 )

// dialog visibility state for Tier 0 & Tier 1 deactivate
const showDeactivateT0 = ref( false )
const showDeactivateT1 = ref( false )

/* ================= Add flow (from left tree) ================= */
const showAddT0 = ref( false ) // 🔹 Tier 0 (Site)
const showAddT1 = ref( false ) // Tier 1
const showAddT2 = ref( false )
const showAddT3 = ref( false )
const showAddT4 = ref( false )
const addParentId = ref( null )

/* Prefill & lock Production Line (T1) in Add dialogs */
const prefilledProductionLineId = ref( null )
const prefilledProductionLineName = ref( '' )

/** Keep right pane in sync with left tree selection */
function onNodeClick( node, breadcrumb ) {
  selectedNode.value = node
  breadcrumbPath.value = breadcrumb ?? []
}

/** 🔑 Select a node in the left tree when a sub-item card requests it */
async function selectNodeFromAnywhere( id ) {
  const targetId = Number( id )
  if ( !targetId || !tree.value ) return

  if ( typeof tree.value.focusNode === 'function' ) {
    await tree.value.focusNode( targetId )
    return
  }

  const node = tree.value.getNode?.( targetId )
  if ( node ) {
    tree.value.setCurrentKey?.( targetId )
    onNodeClick( node.data ?? node, node.breadcrumb ?? breadcrumbPath.value )
  }
}

/** Delete requested from left tree: route to the correct right-pane dialog */
async function onRequestDelete( { level, node, breadcrumb } ) {
  selectedNode.value = node
  breadcrumbPath.value = breadcrumb ?? []
  await nextTick()

  // Tier 0
  if ( level === 0 ) {
    const parentId = null
    pendingDeleteCtx.value = {
      type : 't0',
      parentId,
      originalIndex : -1
    }

    showDeactivateT0.value = true
    return
  }

  // Tier 1
  if ( level === 1 ) {
    // breadcrumb is usually: [Site (0), T1 (1)]
    const siteId = breadcrumb?.[0]?.id ?? null
    const siblings = tree.value?.getChildrenOf?.( siteId ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )

    pendingDeleteCtx.value = {
      type : 't1',
      parentId : siteId,
      originalIndex : idx
    }

    showDeactivateT1.value = true
    return
  }

  // Tier 2
  if ( level === 2 ) {
    const t1Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t1Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't2', parentId : t1Id, originalIndex : idx }
    t2Ref.value?.openDeactivateDialog?.()
    return
  }

  // Tier 3
  if ( level === 3 ) {
    const t2Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t2Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't3', parentId : t2Id, originalIndex : idx }
    t3Ref.value?.openDeactivateDialog?.()
    return
  }

  // Tier 4
  if ( level === 4 ) {
    const t3Id = breadcrumb?.at( -2 )?.id
    const siblings = tree.value?.getChildrenOf?.( t3Id ) ?? []
    const idx = siblings.findIndex( s => s.id === node.id )
    pendingDeleteCtx.value = { type : 't4', parentId : t3Id, originalIndex : idx }
    t4Ref.value?.openDeactivateDialog?.()
    return
  }

  ElMessage.warning( 'Delete for this level is not wired up yet.' )
}

/** handle success from the Tier 0 DeactivateNode dialog */
async function handleT0DeleteSuccess() {
  const ctx = pendingDeleteCtx.value
  if ( !ctx || !selectedNode.value ) {
    showDeactivateT0.value = false
    return
  }

  const deletedId = selectedNode.value.id

  await onT0AfterDelete( { parentId : ctx.parentId, deletedId } )
  showDeactivateT0.value = false
}

/** handle success from the Tier 1 DeactivateNode dialog */
async function handleT1DeleteSuccess() {
  const ctx = pendingDeleteCtx.value
  if ( !ctx || !selectedNode.value ) {
    showDeactivateT1.value = false
    return
  }

  const deletedId = selectedNode.value.id

  await onT1AfterDelete( { parentId : ctx.parentId, deletedId } )
  showDeactivateT1.value = false
}

async function onT0AfterDelete( { parentId, deletedId } ) {
  tree.value?.removeNodeAndSelectNext( { deletedId, fallbackParentId : parentId } )
  pendingDeleteCtx.value = null
}

async function onT1AfterDelete( { parentId, deletedId } ) {
  tree.value?.removeNodeAndSelectNext( { deletedId, fallbackParentId : parentId } )
  pendingDeleteCtx.value = null
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

function getT1FromBreadcrumb( bc = [] ) {
  return bc.find( n => n?.level === 1 ) || null
}
function cleanLabel( label = '' ) {
  return label.replace( /^T1:\s*/i, '' )
}

function onRequestAdd( { nextLevel, parentId, breadcrumb } ) {
  addParentId.value = parentId

  // Add Tier 1 from Tier 0
  if ( nextLevel === 1 ) {
    prefilledProductionLineId.value = null
    prefilledProductionLineName.value = ''

    showAddT1.value = true
    showAddT2.value = false
    showAddT3.value = false
    showAddT4.value = false
    return
  }

  const t1 = getT1FromBreadcrumb( breadcrumb )
  prefilledProductionLineId.value = t1?.id ?? null
  prefilledProductionLineName.value = t1 ? cleanLabel( t1.label ) : ''

  showAddT1.value = false
  showAddT2.value = nextLevel === 2
  showAddT3.value = nextLevel === 3
  showAddT4.value = nextLevel === 4
}

/** Called when any Add dialog succeeds. */
async function handleAddSuccess( payload ) {
  showAddT0.value = false
  showAddT1.value = false
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

/** Empty-state CTA handler */
function createNewTemplate() {
  // Create a new Site (Tier 0). Top-level, so parentId is null.
  addParentId.value = null
  showAddT0.value = true
}

// Function to attempt equipment selection with retries
const selectEquipmentById = async( equipmentId, maxRetries = 10, delay = 300 ) => {
  if ( !equipmentId || !tree.value ) return false

  const id = Number( equipmentId )
  let attempts = 0

  const attemptSelection = async() => {
    attempts++
    const success = tree.value?.focusNode?.( id )

    if ( success ) {
      console.log( `Successfully selected equipment ${id} on attempt ${attempts}` )
      return true
    }

    if ( attempts < maxRetries ) {
      console.log( `Equipment ${id} not found, retrying in ${delay}ms... (attempt ${attempts}/${maxRetries})` )
      await new Promise( resolve => setTimeout( resolve, delay ) )
      return attemptSelection()
    }

    console.warn( `Failed to select equipment ${id} after ${maxRetries} attempts` )
    return false
  }

  return attemptSelection()
}

// Watch for equipmentId query parameter to auto-select equipment
watch(
  () => route.query.equipmentId,
  async equipmentId => {
    if ( equipmentId && tree.value ) {
      await nextTick()
      selectEquipmentById( equipmentId )
    }
  }
)

// Handle initial equipment selection on mount
onMounted( async() => {
  const equipmentId = route.query.equipmentId
  if ( equipmentId ) {
    setTimeout( () => {
      selectEquipmentById( equipmentId )
    }, 1000 )
  }
} )
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

/* Empty-state styling */
.no-selection-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--el-text-color-secondary);
}
.no-selection-icon {
  font-size: 36px;
  margin-bottom: 8px;
  color: var(--el-color-primary);
}
</style>
