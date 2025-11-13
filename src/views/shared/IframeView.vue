<template>
  <div class="iframe-container">
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>Loading...</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading, WarningFilled } from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref( true )

const iframeUrl = computed( () => {
  return route.meta?.iframeUrl || ''
} )

const handleLoad = () => {
  loading.value = false
}

const handleError = () => {
  loading.value = false
}

onMounted( () => {
  if ( !iframeUrl.value ) {
    loading.value = false
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
