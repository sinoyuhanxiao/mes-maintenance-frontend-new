<template>
  <div class="custom-field">
    <el-text
      class="value"
      :style="{
        color: color,
      }"
    >
      {{ value }}
    </el-text>
    <el-text
      class="name"
      :style="{
        color: color,
        border: '1px solid ' + color,
        padding: '6px 12px',
        borderRadius: '10px',
        display: 'block',
        width: '100%',
        textAlign: 'center',
      }"
    >
      {{ name }}
    </el-text>
  </div>
</template>

<script setup>
import { ElText } from 'element-plus'

defineProps({
  name: {
    type: String,
    default: 'Name',
  },
  value: {
    type: Number,
    default: 1,
  },
  color: {
    type: String,
    default: '#409EFF',
  },
})
</script>

<style scoped>
.custom-field {
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 80px;
}
</style>
