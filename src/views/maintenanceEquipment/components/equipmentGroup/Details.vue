<template>
  <el-descriptions
    title="Vertical list without border"
    :column="4"
    :size="size"
    direction="vertical"
    :style="blockMargin"
  >
    <el-descriptions-item label="Username">kooriookami</el-descriptions-item>
    <el-descriptions-item label="Telephone">18100000000</el-descriptions-item>
    <el-descriptions-item label="Place" :span="2">Suzhou</el-descriptions-item>
    <el-descriptions-item label="Remarks">
      <el-tag size="small">School</el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="Address">
      No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
// import { ArrowRight } from '@element-plus/icons-vue'
// defineProps( {
//   data : {
//     type : Array,
//     default : () => []
//   }
// } )

// const src = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
</script>

<style scoped>
.t2-main-container {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.general-info {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.location {
  flex: 0;
  display: flex;
  flex-direction: column;
  background-color: #0085a4;
}

.image {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 300px;
  max-height: 300px;
  background-color: #0085a4;
}
</style>
