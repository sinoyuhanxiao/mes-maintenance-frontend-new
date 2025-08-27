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
            @refresh-tree="handleRefreshTree"
          />
          <Equipment
            v-else-if="isTier3"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
            @refresh-tree="handleRefreshTree"
          />
          <SubEquipment
            v-else-if="isTier4"
            :node="selectedNode"
            :breadcrumb="breadcrumbPath"
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
import { ref, computed } from 'vue'
import EquipmentGroup from './components/equipmentGroup/index.vue'
import EquipmentTree from './components/equipmentTree/index.vue'
import Equipment from './components/equipment/index.vue'
import SubEquipment from './components/subEquipment/index.vue'

const breadcrumbPath = ref( [] )
const selectedNode = ref( null )
const equipmentTree = ref( null )

const isTier2 = computed( () => breadcrumbPath.value.length === 4 )
const isTier3 = computed( () => breadcrumbPath.value.length === 5 )
const isTier4 = computed( () => breadcrumbPath.value.length === 6 )

function onNodeClick( node, nodePath ) {
  selectedNode.value = node
  breadcrumbPath.value = nodePath
}

function handleRefreshTree() {
  equipmentTree.value?.refreshTree()
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
