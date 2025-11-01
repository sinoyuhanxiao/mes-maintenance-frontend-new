<template>
  <div class="card-item">
    <div class="card-flex">
      <div class="image-section">
        <template v-if="item.imageUrl">
          <el-image
            :key="item.imageUrl + '-' + item.id"
            :src="item.imageUrl"
            :preview-src-list="[item.imageUrl]"
            hide-on-click-modal="true"
            fit="contain"
            class="part-image"
            preview-teleported
            :z-index="4000"
          >
            <template #placeholder>
              <div class="image-slot image-viewer-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
            <template #error>
              <div class="image-slot image-viewer-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
            <template #viewer-error="{ activeIndex, src }">
              <div class="image-slot viewer-error">
                <el-icon><Picture /></el-icon>
                <span>Can’t preview ({{ activeIndex }}): {{ src }}</span>
              </div>
            </template>
          </el-image>
        </template>

        <template v-else>
          <div class="image-slot image-viewer-slot part-image">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </div>

      <div class="info-section">
        <div class="info-section-header">
          <el-text tag="b" size="default">{{ item.title || '—' }}</el-text>
          <el-text>({{ item.partNumber || '—' }})</el-text>

          <div class="spacer"></div>

          <!-- actions grouped tightly -->
          <div class="sp-actions">
            <!-- Option A: two buttons with margin reset -->
            <el-tooltip content="Edit" placement="top">
              <el-button class="sp-action-btn" size="small" type="text" :icon="Edit" @click="$emit('edit', item)" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button class="sp-action-btn" size="small" type="text" :icon="Delete" @click="$emit('delete', item)" />
            </el-tooltip>

            <!--
            // Option B (alternate): use a button group instead (comment out A)
            <el-button-group>
              <el-button class="sp-action-btn" size="small" type="text" :icon="Edit" @click="$emit('edit', item)" />
              <el-button class="sp-action-btn" size="small" type="text" :icon="Delete" @click="$emit('delete', item)" />
            </el-button-group>
            -->
          </div>
        </div>

        <el-divider />

        <el-descriptions :column="3">
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
  return v === 1 ? '1' : `${v}`
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
  min-width: 0; /* prevent overflow */
}
.card-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card-flex {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0; /* prevent overflow */
}

.image-section {
  display: flex;
  flex-direction: column;
}

/* Default (below 1440px): smaller image */
.part-image,
.image-slot {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

/* unified fallback */
.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
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
  min-width: 0; /* prevent long text causing horizontal scroll */
}
.info-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.spacer {
  flex: 1;
}

/* actions: tight grouping on the right */
.sp-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px; /* your intended spacing */
}

/* kill Element Plus default +12px left margin between adjacent buttons */
:deep(.sp-actions .el-button + .el-button) {
  margin-left: 0 !important;
}

/* make icon text buttons tighter */
.sp-action-btn {
  padding: 2px 6px !important;
  min-height: 0;
  line-height: 1;
}

/* Reduce spacing around divider */
:deep(.info-section > .el-divider) {
  margin: 12px 0;
}

/* Larger screens (1440px+): restore bigger image & icon size */
@media (min-width: 1440px) {
  .part-image,
  .image-slot {
    width: 120px;
    height: 120px;
  }

  .sp-action-btn :deep(.el-icon) {
    font-size: 16px !important;
  }
}
</style>
