<template>
  <div class="card-item">
    <div class="card-flex">
      <div class="image-section">
        <el-image
          :src="item.imageUrl || defaultImageUrl"
          :alt="item.title"
          fit="cover"
          class="part-image"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture/></el-icon>
              <span>No Image</span>
            </div>
          </template>
        </el-image>
        <div class="image-text">
          <el-descriptions
            :column="1"
            direction="vertical"
            >
            <el-descriptions-item label="Last Installment Time" align="center">
                <el-text>June 1, 2025</el-text>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <div class="info-section">
        <div class="info-section-header">
          <el-text tag="b" size="large">ROLLER CHAIN 35S-SS304</el-text>
          <el-text>(B583010)</el-text>
          <div class="spacer"></div>
          <el-tooltip content="Device Tag Logs" placement="top">
            <el-button type="text" :icon="Document" />
          </el-tooltip>
          <el-tooltip content="Part Details" placement="top">
            <el-button type="text" :icon="View" />
          </el-tooltip>
          <el-tooltip content="Edit" placement="top">
            <el-button type="text" :icon="Edit" />
          </el-tooltip>
          <el-tooltip content="Delete" placement="top">
            <el-button type="text" :icon="Delete" />
          </el-tooltip>
        </div>
        <el-divider />
        <el-descriptions
        :column="3"
        direction="vertical"
        >
        <el-descriptions-item label="Device Tag">B583010</el-descriptions-item>
        <el-descriptions-item label="Device Tag Position Code">4</el-descriptions-item>
        <el-descriptions-item label="Device Quantity">1</el-descriptions-item>
        <el-descriptions-item label="Suggested Service Days">1 Day</el-descriptions-item>
        <el-descriptions-item label="Estimated Service Days">1 Day</el-descriptions-item>
        <el-descriptions-item label="Auto Trigger Cycle">No</el-descriptions-item>
      </el-descriptions>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Picture, Document, View, Edit, Delete } from '@element-plus/icons-vue'

defineProps( {
  item : {
    type : Object,
    required : true
  }
} )

const defaultImageUrl = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
</script>

<style scoped>
.card-item {
  width: 100%;
  flex: 1;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.card-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-flex {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.image-section {
  flex: 0 0 150px;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
}

.image-text {
  padding-top: 20px;
  text-align: center;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 10px;
}

.info-section-header {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.spacer {
  flex: 1 0 0px;
}

.el-text {
  padding-right: 10px;
}
</style>
