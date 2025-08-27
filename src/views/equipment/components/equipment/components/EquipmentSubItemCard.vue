<template>
  <el-card class="sub-item-card" shadow="hover" :class="{ selected: isSelected }" @click="$emit('click')">
    <div class="card-content">
      <div class="number-circle">
        <span class="number">{{ number }}</span>
      </div>
      <div class="text-content">
        <el-text>
          {{ text }}
        </el-text>
      </div>
      <div class="click-hint">
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps( {
  number : {
    type : [String, Number],
    default : 1
  },
  text : {
    type : String,
    default : 'Sub-Item Text'
  },
  circleColor : {
    type : String,
    default : '#409EFF'
  },
  isSelected : {
    type : Boolean,
    default : false
  }
} )

defineEmits( ['click'] )
</script>

<style scoped>
.sub-item-card {
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sub-item-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.number-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid v-bind(circleColor);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.number {
  color: v-bind(circleColor);
  font-size: 14px;
  font-weight: 600;
}

.text-content {
  flex: 1;
}

.click-hint {
  color: #909399;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.sub-item-card:hover .click-hint {
  opacity: 1;
  color: #409eff;
}
</style>
