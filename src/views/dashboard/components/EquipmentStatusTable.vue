<template>
  <el-table
    :data="equipmentData"
    v-loading="loading"
    style="width: 100%"
    row-key="id"
    :tree-props="{ children: 'children' }"
    :default-expand-all="false"
    row-class-name="table-row"
    fit
    highlight-current-row
    max-height="600"
    :cell-style="indentCellStyle"
  >
    <el-table-column prop="name" label="Equipment Name" min-width="300" show-overflow-tooltip fixed="left">
      <template #default="{ row }">
        <div style="display: flex; align-items: center">
          <el-icon v-if="row.level === 1" style="margin-right: 8px; color: #409eff">
            <OfficeBuilding />
          </el-icon>
          <el-icon v-else-if="row.level === 2" style="margin-right: 8px; color: #67c23a">
            <Box />
          </el-icon>
          <el-icon v-else-if="row.level === 3" style="margin-right: 8px; color: #e6a23c">
            <Grid />
          </el-icon>
          <el-icon v-else style="margin-right: 8px; color: #909399">
            <Setting />
          </el-icon>
          <span style="font-weight: 500">{{ row.name || `[Node ${row.id}]` }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="id" label="ID" width="100" fixed="left" />

    <el-table-column prop="code" label="Equipment Code" min-width="180" show-overflow-tooltip>
      <template #default="{ row }">
        <el-text v-if="row.code" style="font-family: monospace">
          {{ row.code }}
        </el-text>
        <span v-else style="color: #c0c4cc">-</span>
      </template>
    </el-table-column>

    <el-table-column prop="nodeTypeId" label="Type" width="180" align="center">
      <template #default="{ row }">
        <el-tag :type="getTypeTagType(row.nodeTypeId)" size="small" v-if="row.nodeTypeId">
          {{ getTypeName(row.nodeTypeId) }}
        </el-tag>
        <el-tag type="info" size="small" v-else>
          {{ getLevelName(row.level) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="childrenCount" label="Children" width="100" align="center">
      <template #default="{ row }">
        <el-tag v-if="row.hasChildren" type="primary" size="small" effect="plain">
          {{ row.childrenCount }}
        </el-tag>
        <span v-else style="color: #c0c4cc">0</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { getEquipmentTree } from '@/api/equipment'
import { OfficeBuilding, Box, Grid, Setting } from '@element-plus/icons-vue'

const loading = ref( false )
const equipmentData = ref( [] )

// Transform tree data to include level and hasChildren properties
const transformTreeNode = ( node, level = 1 ) => {
  // Filter out nodes with null names if they have no valid children
  if ( !node.name && ( !node.children || node.children.length === 0 ) ) {
    return null
  }

  const hasValidChildren = Array.isArray( node.children ) && node.children.length > 0

  const transformed = {
    id : node.id,
    name : node.name,
    code : node.code,
    nodeTypeId : node.nodeTypeId,
    sequenceOrder : node.sequenceOrder,
    inPath : node.inPath || false,
    level,
    hasChildren : hasValidChildren,
    childrenCount : 0
  }

  if ( hasValidChildren ) {
    // Transform children and filter out nulls
    const validChildren = node.children
      .map( child => transformTreeNode( child, level + 1 ) )
      .filter( child => child !== null )

    if ( validChildren.length > 0 ) {
      transformed.children = validChildren
      transformed.childrenCount = validChildren.length
    } else {
      transformed.hasChildren = false
    }
  }

  return transformed
}

const fetchData = async() => {
  loading.value = true
  try {
    // Fetch equipment tree (full hierarchy)
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

    // Transform the tree data and filter out null nodes
    equipmentData.value = dataArray.map( node => transformTreeNode( node, 1 ) ).filter( node => node !== null )
  } catch ( error ) {
    console.error( 'Failed to fetch equipment tree:', error )
    equipmentData.value = []
  } finally {
    loading.value = false
  }
}

const indentCellStyle = ( { column, row } ) => {
  // Don't apply indent to ID column
  if ( column.property === 'id' ) {
    return {}
  }
  const depth = ( row.level || 1 ) - 1
  return { paddingLeft : `${depth * 16}px` }
}

const getTypeName = typeId => {
  const types = {
    1 : 'Site',
    2 : 'Diagram',
    3 : 'Production Line',
    4 : 'Equipment Group',
    5 : 'Equipment',
    6 : 'Component',
    7 : 'Unit',
    8 : 'Section',
    9 : 'Device'
  }
  return types[typeId] || 'Unknown'
}

const getLevelName = level => {
  const levelNames = {
    1 : 'Site',
    2 : 'Diagram',
    3 : 'Line/Group',
    4 : 'Equipment',
    5 : 'Component',
    6 : 'Sub-Component'
  }
  return levelNames[level] || `Level ${level}`
}

const getTypeTagType = typeId => {
  const typeMap = {
    1 : 'danger', // Site
    2 : 'warning', // Diagram
    3 : 'danger', // Production Line
    4 : 'warning', // Equipment Group
    5 : 'primary', // Equipment
    6 : 'info', // Component
    7 : 'success', // Unit
    8 : '', // Section
    9 : 'info' // Device
  }
  return typeMap[typeId] || ''
}

onBeforeMount( () => {
  fetchData()
} )

defineOptions( {
  name : 'EquipmentStatusTable'
} )
</script>

<style scoped>
:deep(.cell.el-tooltip) {
  display: flex;
}

:deep(.el-table__expand-icon) {
  margin-top: 5px;
}
</style>
