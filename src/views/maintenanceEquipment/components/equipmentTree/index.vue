<template>
  <div class="simple-tree-container">
    <el-input v-model="filterText" placeholder="Search nodes" style="width: 240px; margin-bottom: 10px" clearable />
    <el-tree
      :data="treeData"
      node-key="id"
      default-expand-all
      :props="defaultProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      ref="treeRef"
      @node-click="(data, node) => handleNodeClick(data, node)"
      style="max-width: 600px"
    >
      <template #default="{ data }">
        <div class="node-content">
          <el-icon style="margin-right: 5px">
            <Folder v-if="data.type === 'folder'" />
            <Memo v-else />
          </el-icon>
          <span>{{ data.label }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElTree, ElInput } from 'element-plus'
import { Folder, Memo } from '@element-plus/icons-vue'

const filterText = ref( '' )
const treeRef = ref( null )

// Hardcoded tree data
const treeData = [
  {
    id : 1,
    label : 'T1: All Lines',
    type : 'folder'
  },
  {
    id : 4,
    label : 'T1: Rheon Line 1',
    type : 'folder',
    children : [
      {
        id : 5,
        label : 'T2: Rheon',
        type : 'folder'
      },
      {
        id : 6,
        label : 'T2: Freezing',
        type : 'folder',
        children : [
          {
            id : 7,
            label : 'T3: Double Drum Ambient Spiral',
            type : 'folder',
            children : [
              {
                id : 1,
                label : 'T4: Spiral Conveyor',
                type : 'document'
              },
              {
                id : 2,
                label : 'T4: Refrigeration Coils',
                type : 'document'
              },
              {
                id : 3,
                label : 'T4: Infeed Section',
                type : 'document'
              }
            ]
          },
          {
            id : 8,
            label : 'T3: Upstream Curved Conveyor',
            type : 'document'
          },
          {
            id : 9,
            label : 'T3: Incline Conveyor',
            type : 'document'
          },
          {
            id : 10,
            label : 'T3: Straight Conveyor',
            type : 'document'
          },
          {
            id : 11,
            label : 'T3: Transfer Curved Conveyor',
            type : 'document'
          }
        ]
      }
    ]
  },
  {
    id : 7,
    label : 'T1: Other',
    type : 'folder'
  }
]

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
