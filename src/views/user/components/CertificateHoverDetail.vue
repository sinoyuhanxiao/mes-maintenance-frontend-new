<template>
  <template v-if="certificates && certificates.length">
    <el-popover placement="top" :width="400" popper-class="cert-popover">
      <template #default>
        <div class="cert-list">
          <el-card v-for="c in certificates" :key="c.id" class="cert-card" shadow="never">
            <!-- left: preview (30%) -->
            <div class="image-preview">
              <div v-if="c.file_list.length > 1">
                <el-carousel height="100px">
                  <el-carousel-item v-for="(img, index) in c.file_list" :key="img">
                    <el-image
                      :src="img"
                      :preview-src-list="c.file_list"
                      :initial-index="index"
                      fit="cover"
                      style="width: 100%; height: 100%; object-fit: cover"
                      preview-teleported
                    />
                  </el-carousel-item>
                </el-carousel>
              </div>

              <div v-else>
                <el-image
                  :src="c.file_list?.[0] || ''"
                  :preview-src-list="c.file_list"
                  :initial-index="0"
                  fit="contain"
                  style="width: 100px; height: 100px; object-fit: cover"
                >
                  <template #error>
                    <el-tooltip content="No Image">
                      <el-empty style="padding: 0 0" :image-size="80" />
                    </el-tooltip>
                  </template>
                </el-image>
              </div>
            </div>

            <!-- right: grid (70%), stacked vertically -->
            <div class="cert-grid">
              <div class="row">
                <el-text tag="b">{{ c.name || '-' }}</el-text>
              </div>

              <div class="row">
                <el-text size="small">{{ c.certificate_number || '-' }}</el-text>
              </div>

              <div class="row">
                <span class="label">{{ t('user.issueDate') }}</span>
                <span class="value">{{ fmt(c.issue_date) }}</span>
              </div>
              <div class="row">
                <span class="label">{{ t('user.expiryDate') }}</span>
                <span class="value" :class="{ expired: isExpired(c.expiration_date) }">
                  {{ fmt(c.expiration_date) }}
                </span>
              </div>
            </div>
          </el-card>
        </div>
      </template>

      <template #reference>
        <el-tag :type="'info'" plain :size="'small'">
          {{ certificates.length }}
          {{ certificates.length === 1 ? 'certificate' : 'certificates' }}
        </el-tag>
      </template>
    </el-popover>
  </template>

  <template v-else>
    <span>-</span>
  </template>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps( { certificates : { type : Array, default : () => [] }} )

function fmt( iso ) {
  if ( !iso ) return '-'
  const d = new Date( iso )
  return `${d.getFullYear()}-${String( d.getMonth() + 1 ).padStart( 2, '0' )}-${String( d.getDate() ).padStart( 2, '0' )}`
}
function isExpired( iso ) {
  return iso && new Date( iso ).getTime() < Date.now()
}
</script>

<style scoped>
.cert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* Use :deep to style Element Plus internals with scoped CSS */
:deep(.cert-card) {
  --el-card-padding: 5px; /* tighten padding */
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
}

/* The important part: make the *body* of each card a horizontal row */
:deep(.cert-card .el-card__body) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* left column (30%) */
.image-preview {
  flex: auto;
}
.thumb {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

/* right column (70%) — vertical stack of rows */
.cert-grid {
  flex: 0 0 70%;
  display: flex; /* vertical */
  flex-direction: column; /* ← stacked items */
  gap: 4px;
  font-size: 12px;
}

/* each row is one line: label on left, value on right */
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.value {
  color: var(--el-text-color-secondary);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.value.expired {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
