<template>
  <el-card shadow="hover" class="card-item">
    <el-space direction="vertical" alignment="start">
      <el-text class="mx-1" size="large">{{ item.title }}</el-text>
      <el-text class="mx-1" size="default">{{ item.description }}</el-text>
    </el-space>
  </el-card>
</template>

<script setup>
defineProps( {
  item : {
    type : Object,
    required : true
  }
} )
</script>

<style scoped>
.card-item {
  width: flex;
  height: 100px;
}
</style>
