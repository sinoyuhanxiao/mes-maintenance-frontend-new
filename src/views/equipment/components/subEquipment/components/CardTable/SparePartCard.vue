<template>
  <div class="card-item">
    <div class="card-flex">
      <div class="image-section">
        <template v-if="item.imageUrl">
          <el-image
            :key="item.imageUrl + '-' + item.id"
            :src="item.imageUrl"
            :preview-src-list="[item.imageUrl]"
            fit="cover"
            class="part-image"
            preview-teleported
            :z-index="4000"
          >
            <!-- use the same fallback while loading -->
            <template #placeholder>
              <div class="image-slot image-viewer-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>

            <!-- error: same fallback -->
            <template #error>
              <div class="image-slot image-viewer-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>

            <!-- viewer modal error -->
            <template #viewer-error="{ activeIndex, src }">
              <div class="image-slot viewer-error">
                <el-icon><Picture /></el-icon>
                <span>Can’t preview ({{ activeIndex }}): {{ src }}</span>
              </div>
            </template>
          </el-image>
        </template>

        <!-- no URL: same fallback -->
        <template v-else>
          <div class="image-slot image-viewer-slot part-image">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </div>

      <div class="info-section">
        <div class="info-section-header">
          <el-text tag="b" size="large">{{ item.title || '—' }}</el-text>
          <el-text>({{ item.partNumber || '—' }})</el-text>
          <div class="spacer"></div>

          <el-tooltip content="Edit" placement="top">
            <el-button type="text" :icon="Edit" @click="$emit('edit', item)" />
          </el-tooltip>
          <el-tooltip content="Delete" placement="top">
            <el-button type="text" :icon="Delete" @click="$emit('delete', item)" />
          </el-tooltip>
        </div>

        <el-divider />

        <el-descriptions :column="3" direction="vertical">
          <el-descriptions-item label="Position Code">{{ item.deviceTagPositionCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Quantity">{{ item.deviceQuantity || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Vendor Suggested Service Days">{{
            formatDays(item.suggestedServiceDays)
          }}</el-descriptions-item>
          <el-descriptions-item label="Estimated Service Days">{{
            formatDays(item.estimatedServiceDays)
          }}</el-descriptions-item>
          <el-descriptions-item label="Installation Date">
            <el-text>{{ formatDate(item.lastInstallmentTime) }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="Is Auto Trigger">
            <el-tag size="small" :type="item.autoTriggerCycle === 'Yes' ? 'success' : 'info'">
              {{ item.autoTriggerCycle === 'Yes' ? 'Yes' : 'No' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, Edit, Delete } from '@element-plus/icons-vue'
defineProps( { item : { type : Object, required : true }} )

function formatDays( n ) {
  if ( n == null || Number.isNaN( Number( n ) ) ) return '—'
  const v = Number( n )
  return v === 1 ? '1 Day' : `${v} Days`
}
function formatDate( iso ) {
  if ( !iso ) return '—'
  const d = new Date( iso )
  return Number.isNaN( d.getTime() ) ? '—' : d.toISOString().slice( 0, 10 )
}
</script>

<style scoped>
.card-item {
  width: 100%;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background: #fff;
}
.card-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card-flex {
  display: flex;
  gap: 12px;
  align-items: center;
}
.image-section {
  width: 150px;
  display: flex;
  flex-direction: column;
}
.part-image {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

/* unified fallback */
.image-slot {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--el-text-color-secondary);
  border-radius: 8px;
  gap: 6px;
}
.image-slot .el-icon {
  font-size: 24px;
}
.image-viewer-slot {
  background: var(--el-fill-color-light);
}

.viewer-error {
  color: var(--el-text-color-primary);
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.info-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.spacer {
  flex: 1;
}
</style>
