<template>
  <el-sub-menu :index="'/production'" popper-append-to-body>
    <template #title>
      <svg-icon class-name="menu-icons" icon-class="folder" />
      <span>Production</span>
    </template>

    <div class="nest-menu">
      <a
        v-for="item in menuItems"
        :key="item.key"
        :class="{ 'router-link-active': activeView === item.key }"
        @click.prevent="handleMenuClick(item.key)"
      >
        <li class="el-menu-item" :class="{ 'is-active': activeView === item.key }">
          <svg-icon class-name="menu-icons" :icon-class="item.icon" />
          <span>{{ item.title }}</span>
        </li>
      </a>
    </div>
  </el-sub-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { updateCurrentView } from '@/api/production'
import { PRODUCTION_VIEW_PATHS } from '@/config/productionViews'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const activeView = ref( 'overview' )

const menuItems = [
  { key : 'overview', title : 'Overview', icon : 'dashboard' },
  { key : 'library', title : 'Library', icon : 'folder' },
  { key : 'resources', title : 'Resources', icon : 'cpu' },
  { key : 'work-orders', title : 'Work Orders', icon : 'table' },
  { key : 'schedule', title : 'Schedule', icon : 'table' },
  { key : 'tasks', title : 'Tasks', icon : 'list' }
]

const handleMenuClick = async viewKey => {
  const ignitionPath = PRODUCTION_VIEW_PATHS[viewKey]
  if ( !ignitionPath ) {
    console.error( `No Ignition path found for view: ${viewKey}` )
    return
  }

  // Update active state immediately
  activeView.value = viewKey

  // Navigate to Production view if not already there
  if ( route.path !== '/production/view' ) {
    await router.push( '/production/view' )
  }

  // Call API to update Ignition view
  try {
    const response = await updateCurrentView( ignitionPath )
    if ( !response.data?.success ) {
      console.warn( 'API returned success: false' )
    }
  } catch ( error ) {
    console.error( 'Failed to update Ignition view:', error )
    ElMessage.error( {
      message : 'Failed to switch production view',
      duration : 3000
    } )
  }
}
</script>

<style scoped lang="scss">
.nest-menu {
  a {
    text-decoration: none;
    color: inherit;

    &.router-link-active .el-menu-item {
      background-color: var(--el-menu-active-color);
    }
  }

  .el-menu-item {
    display: flex;
    align-items: center;
    padding-left: 49px !important;
    cursor: pointer;

    &.is-active {
      background-color: var(--el-menu-active-color);
    }

    &:hover {
      background-color: var(--el-menu-hover-bg-color);
    }

    span {
      margin-left: 8px;
    }
  }
}
</style>
