<template>
  <el-popover
    trigger="hover"
    placement="top"
    :width="320"
    popper-class="cert-popover"
    :disabled="certificates.length === 0"
  >
    <template #default>
      <div class="cert-list">
        <el-card v-for="c in certificates" :key="c.certificate_number" class="cert-card" shadow="never">
          <!-- left: preview (30%) -->
          <div class="image-preview">
            <el-image
              v-if="c.image_list && c.image_list.length > 0"
              :src="c.image_list[0].url"
              fit="cover"
              :preview-src-list="c.image_list.map(i => i.url)"
              class="thumb"
            />

            <el-image v-else src="" fit="cover" class="thumb">
              <template #error>
                <div class="image-placeholder">No Image</div>
              </template>
            </el-image>
          </div>

          <!-- right: grid (70%), stacked vertically -->
          <div class="cert-grid">
            <div class="row">
              <el-tag size="small" type="info">{{ c.certificate_name }}</el-tag>
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
      <el-tag size="small" :type="certificates?.length ? 'primary' : 'info'">
        {{ certificates?.length ?? 0 }}
      </el-tag>
    </template>
  </el-popover>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps( { certificates : { type : Array, default : () => [] }} )

function fmt( iso ) {
  if ( !iso ) return '—'
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
  flex: 0 0 30%;
  max-width: 30%;
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
  flex: 1 1 70%;
  display: flex; /* vertical */
  flex-direction: column; /* ← stacked items */
  gap: 8px;
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
