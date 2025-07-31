<template>
  <div class="simple-tree-container">
    <el-input v-model="filterText" placeholder="Search nodes" style="width: 240px; margin-bottom: 10px" clearable />
    <el-tree
      :data="treeData"
      node-key="id"
      :default-expanded-keys="getDefaultExpandedKeys()"
      :props="defaultProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      ref="treeRef"
      @node-click="(data, node) => handleNodeClick(data, node)"
      style="max-width: 600px"
    >
      <template #default="{ data }">
        <div class="node-content">
          <el-icon style="margin-right: 8px; font-size: 16px">
            <component :is="getIconForLevel(data.level)" />
          </el-icon>
          <span>{{ data.label }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElTree, ElInput, ElIcon } from 'element-plus'
import { OfficeBuilding, Setting, Tools, Folder } from '@element-plus/icons-vue'
import { getEquipmentTree } from '@/api/equipment.js'

const filterText = ref( '' )
const treeRef = ref( null )
const loading = ref( false )
const error = ref( null )
const treeData = ref( [] )

const getDefaultExpandedKeys = () => {
  return treeData.value.filter( node => node.level === 0 ).map( node => node.id )
}

const getIconForLevel = level => {
  switch ( level ) {
    case 0:
      return OfficeBuilding
    case 1:
      return Folder
    case 2:
      return Folder
    case 3:
      return Setting
    case 4:
      return Tools
    default:
      return Folder
  }
}

const transformNode = ( node, level = 0 ) => {
  if ( level >= 4 ) {
    return {
      id : node.id,
      label : level === 0 ? node.name : `T${level}: ${node.name}`,
      level,
      children : undefined // No children beyond T4
    }
  }
  return {
    id : node.id,
    label : level === 0 ? node.name : `T${level}: ${node.name}`,
    level, // Store level for icon selection
    children :
      node.children && node.children.length > 0
        ? node.children.map( child => transformNode( child, level + 1 ) )
        : undefined
  }
}

const fetchEquipmentTree = async() => {
  loading.value = true
  error.value = null

  try {
    const response = await getEquipmentTree()

    let dataArray
    if ( response.data?.data ) {
      dataArray = response.data.data
    } else if ( Array.isArray( response.data ) ) {
      dataArray = response.data
    } else if ( response.data ) {
      dataArray = [response.data]
    } else {
      dataArray = []
    }

    treeData.value = dataArray.map( node => transformNode( node, 0 ) )
  } catch ( err ) {
    error.value = err.message || 'Failed to load equipment tree'
  } finally {
    loading.value = false
  }
}

onMounted( () => {
  fetchEquipmentTree()
} )

const defaultProps = {
  children : 'children',
  label : 'label'
}

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.label.toLowerCase().includes( value.toLowerCase() )
}

const emit = defineEmits( ['node-click'] )

function handleNodeClick( data, node ) {
  const path = []
  let current = node
  while ( current ) {
    path.unshift( current.data )
    current = current.parent
  }
  emit( 'node-click', data, path )
}
</script>

<style scoped>
.simple-tree-container {
  max-width: 620px;
  background-color: #fafafa;
}

.el-tree {
  background-color: #fafafa;
}

.node-content {
  display: flex;
  align-items: center;
}
</style>
