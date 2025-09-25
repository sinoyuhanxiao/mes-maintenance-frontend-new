<template>
  <div class="card-item">
    <div class="card-flex">
      <div class="image-section">
        <el-image
          :src="item.imageUrl || defaultImageUrl"
          :alt="item.title || 'Spare part'"
          fit="cover"
          class="part-image"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
              <span>No Image</span>
            </div>
          </template>
        </el-image>
        <!-- removed the image-text block that showed Last Installment Time -->
      </div>

      <div class="info-section">
        <div class="info-section-header">
          <el-text tag="b" size="large">{{ item.title || 'Spare part' }}</el-text>
          <el-text>({{ item.partNumber || '—' }})</el-text>

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

        <el-descriptions :column="columns" direction="vertical">
          <el-descriptions-item label="Device Tag">{{ item.deviceTag || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Device Tag Position Code">
            {{ item.deviceTagPositionCode || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="Device Quantity">{{ item.deviceQuantity || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Suggested Service Days">
            {{ item.suggestedServiceDays || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="Estimated Service Days">
            {{ item.estimatedServiceDays || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="Auto Trigger Cycle">{{ item.autoTriggerCycle || '—' }}</el-descriptions-item>

          <!-- 👇 moved here -->
          <el-descriptions-item label="Last Installment Time">
            {{ item.lastInstallmentTime || '—' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, Document, View, Edit, Delete } from '@element-plus/icons-vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import defaultImageUrl from '@/assets/imgs/default-image.png'

defineProps( {
  item : {
    type : Object,
    required : true
  }
} )

// 3/4 columns when wide, else 2 (your existing logic with 1440 breakpoint)
const columns = ref( 2 )
function updateColumns() {
  if ( typeof window !== 'undefined' ) {
    columns.value = window.innerWidth >= 1440 ? 4 : 3
  }
}
onMounted( () => {
  updateColumns()
  window.addEventListener( 'resize', updateColumns )
} )
onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateColumns )
} )
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

/* layout */
.card-flex {
  display: flex;
  align-items: stretch; /* equalize column heights */
}
.image-section {
  flex: 0 0 150px;
  padding-right: 10px;

  /* center image vertically & horizontally within the full column height */
  display: flex;
  align-items: center; /* vertical center */
  justify-content: center; /* horizontal center */
}
.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 10px;
}
.info-section-header {
  display: flex;
  align-items: center;
}
.spacer {
  flex: 1 0 0;
}
.el-text {
  padding-right: 10px;
}

/* image */
.part-image {
  width: 150px;
  height: 150px;
  border-radius: 6px;
  display: block;
  overflow: hidden; /* clip corners */
}

/* ensure the actual <img> inside el-image fits as intended */
:deep(.part-image .el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* use 'contain' if you prefer no cropping */
  display: block;
}

/* fallback slot styling when image fails */
.image-slot {
  width: 150px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 1px dashed #ddd;
  border-radius: 6px;
}
</style>
