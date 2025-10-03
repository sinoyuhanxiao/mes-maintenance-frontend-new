<template>
  <el-dropdown-item :disabled="disabled" class="start-work-order-action" @click="handleClick">
    <el-icon class="action-icon"><VideoPlay /></el-icon>
    <span>{{ label }}</span>
  </el-dropdown-item>
</template>

<script setup>
import { VideoPlay } from '@element-plus/icons-vue'

const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  },
  disabled : {
    type : Boolean,
    default : false
  },
  label : {
    type : String,
    default : 'Start Work Order'
  }
} )

const emit = defineEmits( ['start'] )

const handleClick = () => {
  if ( props.disabled ) return
  emit( 'start', props.workOrder )
}
</script>

<style scoped>
.start-work-order-action {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-icon {
  font-size: 14px;
}
</style>
