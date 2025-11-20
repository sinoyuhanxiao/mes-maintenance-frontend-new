<template>
  <div class="iframe-container">
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>{{ loadingMessage }}</span>
    </div>
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      class="iframe-content"
      frameborder="0"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="error-state">
      <el-icon>
        <WarningFilled />
      </el-icon>
      <p>No URL provided</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { updateCurrentView } from '@/api/production'
import useTagsViewStore from '@/store/modules/tagsView'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const loading = ref( true )
const loadingMessage = ref( 'Loading...' )
const iframeLoaded = ref( false )

const iframeUrl = computed( () => {
  return route.meta?.iframeUrl || ''
} )

const updateIgnitionView = async() => {
  const ignitionViewPath = route.meta?.ignitionViewPath
  if ( !ignitionViewPath ) {
    console.warn( 'No ignitionViewPath found in route meta' )
    return
  }

  try {
    loadingMessage.value = 'Switching view...'
    loading.value = true

    const response = await updateCurrentView( ignitionViewPath )

    if ( response.data?.success ) {
      // Update tags-view tab title to "Production - {subview}"
      const productionTitle = `Production - ${route.meta.title}`
      tagsViewStore.updateVisitedViewTitle( route.path, productionTitle )
    } else {
      throw new Error( 'API returned success: false' )
    }
  } catch ( error ) {
    console.error( 'Failed to update Ignition view:', error )
    ElMessage.error( {
      message : 'Failed to switch production view',
      duration : 3000
    } )
  } finally {
    // If iframe already loaded, hide loading immediately
    if ( iframeLoaded.value ) {
      loading.value = false
    }
  }
}

const handleLoad = () => {
  iframeLoaded.value = true
  loading.value = false
  loadingMessage.value = 'Loading...'
}

const handleError = () => {
  loading.value = false
  loadingMessage.value = 'Loading...'
  ElMessage.error( 'Failed to load iframe' )
}

// Watch for route changes within Production section
watch(
  () => route.path,
  async( newPath, oldPath ) => {
    // Only trigger if navigating within production routes
    if ( newPath.startsWith( '/production' ) && oldPath?.startsWith( '/production' ) && newPath !== oldPath ) {
      await updateIgnitionView()
    }
  }
)

onMounted( async() => {
  if ( !iframeUrl.value ) {
    loading.value = false
  } else {
    // Initial view update on mount
    await updateIgnitionView()
  }
} )
</script>

<style scoped lang="scss">
.iframe-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  z-index: 10;
  gap: 12px;

  .el-icon {
    font-size: 32px;
    color: #409eff;
  }

  span {
    font-size: 14px;
    color: #606266;
  }
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;

  .el-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}
</style>
