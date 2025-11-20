<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" class="iframe-content" frameborder="0" @load="handleIframeLoad" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const iframeRef = ref( null )
const iframeUrl = 'https://dev.fpsmonitoring.com:8043/data/perspective/client/MES_Production/proxy'

const handleIframeLoad = () => {
  // Iframe loaded successfully
}

defineOptions( {
  name : 'ProductionView'
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