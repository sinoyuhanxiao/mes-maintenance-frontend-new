<template>
  <div class="zoom-controls">
    <el-tooltip :content="panzoomEnabled ? 'Disable Pan/Zoom' : 'Enable Pan/Zoom'" placement="left">
      <button class="zoom-button toggle-button" :class="{ active: panzoomEnabled }" @click="$emit('toggle-panzoom')">
        <el-icon><Unlock v-if="panzoomEnabled" /><Lock v-else /></el-icon>
      </button>
    </el-tooltip>

    <div class="divider"></div>

    <el-tooltip content="Zoom In (+)" placement="left">
      <button class="zoom-button" :disabled="!panzoomEnabled" @click="$emit('zoom-in')">
        <el-icon><ZoomIn /></el-icon>
      </button>
    </el-tooltip>

    <el-tooltip content="Zoom Out (-)" placement="left">
      <button class="zoom-button" :disabled="!panzoomEnabled" @click="$emit('zoom-out')">
        <el-icon><ZoomOut /></el-icon>
      </button>
    </el-tooltip>

    <el-tooltip content="Reset View (0)" placement="left">
      <button class="zoom-button" :disabled="!panzoomEnabled" @click="$emit('reset')">
        <el-icon><RefreshLeft /></el-icon>
      </button>
    </el-tooltip>

    <div class="divider"></div>

    <el-tooltip content="Fullscreen" placement="left">
      <button class="zoom-button" :disabled="!panzoomEnabled" @click="$emit('fullscreen')">
        <el-icon><FullScreen /></el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ZoomIn, ZoomOut, RefreshLeft, FullScreen, Lock, Unlock } from '@element-plus/icons-vue'

defineProps( {
  panzoomEnabled : {
    type : Boolean,
    default : false
  }
} )

defineEmits( ['zoom-in', 'zoom-out', 'reset', 'fullscreen', 'toggle-panzoom'] )
</script>

<style lang="scss" scoped>
.zoom-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #4899b3;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 50;
}

.zoom-button {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  :deep(.el-icon) {
    font-weight: bold;

    svg {
      stroke-width: 3;
      stroke: currentColor;
      fill: currentColor;
    }
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.toggle-button.active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 3px 6px;
}

// Responsive adjustments
@media (max-width: 768px) {
  .zoom-controls {
    bottom: 10px;
    left: 10px;
    padding: 5px;
  }

  .zoom-button {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
}
</style>
