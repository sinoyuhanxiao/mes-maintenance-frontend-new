<template>
  <div class="task-library-container">
    <div class="header">
      <div class="left-header">
        <el-tabs v-model="activeTab" class="nav-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="Tasks" name="tasks" />
          <el-tab-pane label="Standards" name="standards" />
        </el-tabs>
      </div>
      <div class="right-header">
        <el-button type="primary" @click="goCreate">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          Create Task
        </el-button>
      </div>
    </div>

    <div class="content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// Active tab reflects current child route under /maintenance-library
const activeTab = ref( 'tasks' )

// Initialize and keep tab in sync with route
const syncTabWithRoute = () => {
  // Derive current section from named routes or path
  const name = route.name
  if ( name === 'TaskLibrary' ) {
    activeTab.value = 'tasks'
  } else if ( name === 'StandardLibrary' ) {
    activeTab.value = 'standards'
  }
}

syncTabWithRoute()

watch(
  () => route.name,
  () => {
    syncTabWithRoute()
  }
)

function handleTabClick( tab ) {
  const name = tab.paneName
  if ( name === 'tasks' ) {
    router.push( { name : 'TaskLibrary' } )
  } else if ( name === 'standards' ) {
    router.push( { name : 'StandardLibrary' } )
  }
}

function goCreate() {
  router.push( { name : 'TaskDesigner' } )
}

defineOptions( {
  name : 'TaskLibraryIndex'
} )
</script>

<style scoped>
.task-library-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.header {
  padding-left: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.left-header {
  display: flex;
  align-items: center;
}

.right-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.content {
  margin-top: 8px;
}
</style>
