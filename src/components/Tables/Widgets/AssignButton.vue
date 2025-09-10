<template>
  <div>
    <el-button @click="handleAssign" v-if="currentAssignment === 1" :icon="Check" type="success" round
      >Assigned</el-button
    >
    <el-button @click="handleAssign" v-if="currentAssignment === 0" type="danger" round plain>Not Assigned</el-button>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const props = defineProps({
  assigned: Number,
  woId: Number,
  personnelId: Number,
})

const emit = defineEmits(['update:assigned'])

const currentAssignment = ref(props.assigned)

watch(
  () => props.assigned,
  newVal => {
    currentAssignment.value = newVal
  }
)

function handleAssign() {
  if (currentAssignment.value == 1) {
    currentAssignment.value = 0
  } else {
    currentAssignment.value = 1
  }
  // console.log('woId: ', props.woId, ' personnelId: ', props.personnelId)
  emit('update:assigned', currentAssignment.value)
}
</script>

<style scoped></style>
