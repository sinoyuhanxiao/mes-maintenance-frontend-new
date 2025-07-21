<template>
  <div class="t2-details">
    <div class="general-information">
      <el-descriptions :column="2" direction="vertical">
        <el-descriptions-item label="Name">Conveyor</el-descriptions-item>
        <el-descriptions-item label="Code">18100000000</el-descriptions-item>
        <el-descriptions-item label="Description" class="highlighted-item"> Test Description </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="location">
      <el-descriptions :column="1" direction="vertical">
        <el-descriptions-item label="Location Path">
          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item>SGB Richmond</el-breadcrumb-item>
            <el-breadcrumb-item>Rheon Line 1</el-breadcrumb-item>
            <el-breadcrumb-item>Freezing</el-breadcrumb-item>
          </el-breadcrumb>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="image">
      <el-descriptions :column="1" direction="vertical">
        <el-descriptions-item label="Images">
          <el-image :src="src" />
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
defineProps( {
  data : {
    type : Array,
    default : () => []
  }
} )

const src = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
</script>

<style scoped>
.t2-details {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.general-information {
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
