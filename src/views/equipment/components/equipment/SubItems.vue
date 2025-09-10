<template>
  <div class="t2-sub-items">
    <div class="image">
      <el-image :src="imageUrl" :alt="imageAlt" fit="cover" :preview-src-list="[imageUrl]">
        <template #error>
          <div class="image-slot">
            <el-icon><Picture /></el-icon>
            <span>No Image</span>
          </div>
        </template>
      </el-image>
    </div>
    <div class="label-cards">
      <el-row :gutter="0">
        <el-col v-for="(item, index) in items" :key="item.id" :xs="24" :sm="24" :md="24" :lg="24">
          <EquipmentSubItemCard
            :number="index + 1"
            :text="item.text"
            :text-type="item.textType || 'default'"
            :text-size="item.textSize || 'default'"
            :circle-color="item.circleColor"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import EquipmentSubItemCard from './components/EquipmentSubItemCard.vue'

defineProps({
  imageUrl: {
    type: String,
    default: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
  },
  imageAlt: {
    type: String,
    default: 'Equipment image',
  },
  items: {
    type: Array,
    default: () => [
      { id: 1, text: 'Primary safety features included', textType: 'default' },
      { id: 2, text: 'Requires regular maintenance', textType: 'default' },
      { id: 3, text: 'High performance rating achieved', textType: 'default' },
      { id: 4, text: 'Temperature monitoring system', textType: 'default' },
      { id: 5, text: 'Emergency shutdown capability', textType: 'default' },
      { id: 6, text: 'Energy efficient operation mode', textType: 'default' },
      { id: 7, text: 'User-friendly interface design', textType: 'default' },
      { id: 8, text: 'Automated diagnostic functions', textType: 'default' },
      { id: 9, text: 'Backup power supply available', textType: 'default' },
      { id: 10, text: 'Compliance with safety standards', textType: 'default' },
      { id: 11, text: 'Advanced monitoring capabilities', textType: 'default' },
      { id: 12, text: 'Remote control functionality', textType: 'default' },
      { id: 13, text: 'Predictive maintenance alerts', textType: 'default' },
      { id: 14, text: 'Quality assurance protocols', textType: 'default' },
    ],
  },
})
</script>

<style scoped>
.t2-sub-items {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 10px;
  min-height: 400px;
}

.image {
  height: calc(100vh - 280px);
  align-content: center;
}

.image-slot {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.label-cards {
  flex: 0 0 300px;
  height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 5px;
}
</style>
