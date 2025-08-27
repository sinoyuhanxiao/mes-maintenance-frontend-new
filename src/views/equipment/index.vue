<template>
  <div class="maintenance-equipment-container">
    <div class="maintenance-equipment-header"></div>
    <div class="maintenance-equipment-content">
      <div class="maintenance-equipment-tree">
        <EquipmentTree @node-click="onNodeClick" ref="equipmentTree" />
      </div>
      <div class="maintenance-equipment-details">
        <template v-if="selectedNode">
          <EquipmentGroup
            v-if="isTier2"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            :activeTab="activeTab"
            @refresh-tree="handleRefreshTree"
          />
          <Equipment
            v-else-if="isTier3"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            :activeTab="activeTab"
            @refresh-tree="handleRefreshTree"
          />
          <SubEquipment
            v-else-if="isTier4"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            :activeTab="activeTab"
            @refresh-tree="handleRefreshTree"
          />
          <div v-else>Select a node to see details</div>
        </template>
        <div v-else>Select a node to see details</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import EquipmentGroup from './components/equipmentGroup/index.vue'
import EquipmentTree from './components/equipmentTree/index.vue'
import Equipment from './components/equipment/index.vue'
import SubEquipment from './components/subEquipment/index.vue'
import { getEquipmentById } from '@/api/equipment'

const route = useRoute()
// eslint-disable-next-line no-unused-vars
const router = useRouter()
const breadcrumbPath = ref( [] )
const selectedNode = ref( null )
const equipmentTree = ref( null )
const activeTab = ref( 'details' )

const isTier2 = computed( () => breadcrumbPath.value.length === 4 )
const isTier3 = computed( () => breadcrumbPath.value.length === 5 )
const isTier4 = computed( () => breadcrumbPath.value.length === 6 )

function onNodeClick( node, nodePath ) {
  console.log( '🎯 [Main] Tree node clicked:', {
    node,
    nodePath,
    nodeId : node.id,
    nodeLabel : node.label,
    pathLength : nodePath.length
  } )

  selectedNode.value = node
  breadcrumbPath.value = nodePath

  console.log( '✅ [Main] Tree navigation completed:', {
    selectedNode : selectedNode.value,
    breadcrumbPath : breadcrumbPath.value
  } )
}

function handleRefreshTree() {
  equipmentTree.value?.refreshTree()
}

// Handle navigation from sub-items
const handleSubItemNavigation = async() => {
  console.log( '🔍 [Main] Checking for navigation query parameters...' )
  const selectedNodeId = route.query.selectedNodeId
  const breadcrumbParam = route.query.breadcrumb

  // Alternative: Check sessionStorage for breadcrumb (if using cleaner URL approach)
  const sessionBreadcrumb = sessionStorage.getItem( 'equipmentBreadcrumb' )
  const finalBreadcrumbParam = breadcrumbParam || sessionBreadcrumb

  console.log( '📋 Query parameters found:', {
    selectedNodeId,
    hasBreadcrumbParam : !!finalBreadcrumbParam,
    breadcrumbParamLength : finalBreadcrumbParam?.length || 0,
    source : breadcrumbParam ? 'URL' : sessionBreadcrumb ? 'sessionStorage' : 'none'
  } )

  if ( selectedNodeId && finalBreadcrumbParam ) {
    console.log( '✅ [Main] Navigation parameters detected, starting navigation process' )
    try {
      console.log( '📡 [Main] Fetching equipment details for node ID:', selectedNodeId )

      // Fetch the selected node details
      const response = await getEquipmentById( selectedNodeId )
      const nodeData = response.data || response

      console.log( '📦 [Main] Equipment details received:', nodeData )

      // Parse breadcrumb from query parameter or sessionStorage
      const parsedBreadcrumb = JSON.parse( finalBreadcrumbParam )
      console.log( '📋 [Main] Parsed breadcrumb:', parsedBreadcrumb )

      // Set the selected node and breadcrumb
      const newNode = {
        id : nodeData.id,
        label : nodeData.name || nodeData.label,
        level : parsedBreadcrumb.length - 1 // Determine level from breadcrumb length
      }

      console.log( '🎯 [Main] Setting new selected node:', newNode )
      console.log( '📋 [Main] Setting new breadcrumb path:', parsedBreadcrumb )

      selectedNode.value = newNode
      breadcrumbPath.value = parsedBreadcrumb

      // Set active tab to "subItems" when navigating from sub-item click
      activeTab.value = 'subItems'
      console.log( '📋 [Main] Active tab set to "subItems" for sub-item navigation' )

      console.log( '✅ [Main] Navigation completed successfully' )
      console.log( '🎯 [Main] Final selected node:', selectedNode.value )
      console.log( '📋 [Main] Final breadcrumb:', breadcrumbPath.value )
      console.log( '📋 [Main] Query parameters remain in URL for browser navigation support' )
    } catch ( error ) {
      console.error( '❌ [Main] Error during navigation:', error )
      console.error( '❌ [Main] Error details:', {
        message : error.message,
        response : error.response,
        status : error.response?.status,
        data : error.response?.data
      } )
      // Show user-friendly error message
      ElMessage.error( 'Failed to load sub-item details. Please try again.' )
    }
  } else {
    console.log( 'ℹ️ [Main] No navigation parameters found, skipping navigation' )
  }
}

// Watch for route changes
watch(
  () => route.query,
  ( newQuery, oldQuery ) => {
    console.log( '🔄 [Main] Route query changed:', {
      old : oldQuery,
      new : newQuery,
      hasSelectedNodeId : !!newQuery.selectedNodeId,
      hasBreadcrumb : !!newQuery.breadcrumb
    } )
    handleSubItemNavigation()
  },
  { immediate : true }
)

// Handle initial navigation on mount
onMounted( () => {
  console.log( '🚀 [Main] Component mounted, checking for initial navigation' )
  handleSubItemNavigation()
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
</style>
