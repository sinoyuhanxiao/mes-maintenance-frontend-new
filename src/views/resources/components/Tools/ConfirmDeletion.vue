<template>
  <div class="popup">
    <el-text tag="b" size="large">Are you sure you want to delete tool: '{{ selectedTool.name }}''</el-text>
    <div class="buttons">
      <el-button :icon="Delete" type="danger" @click="emit('emitDeleteTool', selectedTool)">Yes</el-button>
      <el-button :icon="CircleClose" type="info" @click="emit('close')">No</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Delete, CircleClose } from '@element-plus/icons-vue'

const props = defineProps( {
  data : Object,
  type : Number
} )

const selectedTool = ref( props.data )
const emit = defineEmits( ['emitDeleteTool', 'close'] )

watch(
  () => props.data,
  newVal => {
    selectedTool.value = newVal
  },
  { deep : true }
)
</script>

<style scoped>
.popup {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}
.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
