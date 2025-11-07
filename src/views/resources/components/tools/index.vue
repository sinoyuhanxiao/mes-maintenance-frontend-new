<template>
  <div class="outer-container">
    <div class="header">
      <div class="left-header">
        <div style="flex: 1">
          <el-select
            v-model="filterStateTool.categories"
            placeholder="Filter by tool categories"
            multiple
            clearable
            style="min-width: 250px"
          >
            <el-option v-for="opt in toolCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>

      <div class="right-header">
        <el-input v-model="keyword" :placeholder="'Search Tool'" style="width: 240px" :prefix-icon="Search" clearable />

        <el-button :icon="EditPen" @click="() => (newTool = true)" type="primary">
          {{ 'Create Tool' }}
        </el-button>

        <div class="actions-item">
          <el-button :icon="Remove" type="warning" plain @click="clearFilters">
            {{ 'Clear Filters' }}
          </el-button>
        </div>

        <div class="actions-item">
          <el-button :icon="RefreshIcon" @click="handleRefresh">
            {{ 'Refresh' }}
          </el-button>
        </div>
      </div>
    </div>

    <ToolsView
      ref="toolsRef"
      v-model:keyword="keyword"
      :newTool="newTool"
      :category-ids="filterStateTool.categories"
      @close="() => (newTool = false)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Search, Remove, Refresh as RefreshIcon, EditPen } from '@element-plus/icons-vue'
import { getAllToolClasses } from '@/api/resources'
import ToolsView from '@/views/resources/components/tools/components/ToolsView.vue'

const newTool = ref( false )
const keyword = ref( null )
const filterVisible = ref( false )
const toolsRef = ref( null )
const filterStateTool = reactive( { categories : [] } )
const toolCategoryOptions = ref( [] )

async function clearFilters() {
  filterStateTool.categories = []
  filterVisible.value = false
}

async function handleRefresh() {
  await toolsRef.value?.getToolsData()
}

// ===== Lifecycle =====
const maxHeight = ref( '770px' )

function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}

onMounted( async() => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
  const toolRes = await getAllToolClasses()

  toolCategoryOptions.value = ( toolRes.data || [] ).map( c => ( {
    value : c.id,
    label : c.name || `Category #${c.id}`
  } ) )
} )

onBeforeUnmount( () => window.removeEventListener( 'resize', updateHeight ) )
</script>

<style scoped>
.outer-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-header,
.right-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
