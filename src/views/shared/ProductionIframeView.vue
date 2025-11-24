<template>
  <div class="iframe-container">
    <iframe ref="iframeRef" :src="iframeUrl" class="iframe-content" frameborder="0" @load="handleIframeLoad" />
    <el-tooltip content="Return to main page" effect="dark" placement="left">
      <button class="floating-refresh-btn" @click="refreshIframe">
        <el-icon>
          <Back />
        </el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { emitter } from '@/utils/mitt'
import { Back } from '@element-plus/icons-vue'

const iframeRef = ref( null )
const iframeUrl = 'https://dev.fpsmonitoring.com:8043/data/perspective/client/MES_Production/proxy'

const handleIframeLoad = () => {
  // Iframe loaded successfully
}

const refreshIframe = () => {
  if ( iframeRef.value ) {
    iframeRef.value.src = iframeUrl
  }
}

onMounted( () => {
  emitter.on( 'refreshProduction', refreshIframe )
} )

onUnmounted( () => {
  emitter.off( 'refreshProduction', refreshIframe )
} )

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

.floating-refresh-btn {
  position: absolute;
  bottom: 55px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #0085a4;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 133, 164, 0.4);
  transition: all 0.3s ease;
  z-index: 100;

  .el-icon {
    font-size: 24px;
    color: #ffffff;
  }

  &:hover {
    background-color: #006d8a;
    box-shadow: 0 6px 16px rgba(0, 133, 164, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 133, 164, 0.4);
  }
}
</style>
