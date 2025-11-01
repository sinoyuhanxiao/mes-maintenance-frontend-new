<template>
  <div class="certificate-container">
    <template v-if="certificates.length">
      <div v-for="(certificate, index) in certificates" :key="certificate.id" class="certificate-card">
        <!-- Left: image preview -->
        <div class="certificate-image-preview-section">
          <div v-if="certificate.file_list.length > 1">
            <el-carousel indicator-position="outside" height="100px">
              <el-carousel-item v-for="(img, index) in certificate.file_list" :key="img">
                <el-image
                  :src="img"
                  :preview-src-list="certificate.file_list"
                  :initial-index="index"
                  fit="cover"
                  preview-teleported
                />
              </el-carousel-item>
            </el-carousel>
          </div>

          <div v-else>
            <el-image
              :src="certificate.file_list?.[0] || ''"
              :preview-src-list="certificate.file_list"
              :initial-index="0"
              fit="cover"
              style="height: 100px; width: 100px"
            >
              <template #error>
                <el-tooltip content="No Image">
                  <el-empty style="padding: 0 0" :image-size="80" />
                </el-tooltip>
              </template>
            </el-image>
          </div>
        </div>

        <!-- Middle: details -->
        <div class="certificate-detail-section">
          <div class="certificate-detail-row">
            <el-text tag="b">{{ certificate.name }}</el-text>
          </div>
          <div class="certificate-detail-row">
            {{ t('user.certificateNumber') }}: {{ certificate.certificate_number }}
          </div>
          <div class="certificate-detail-row">
            <div>{{ t('user.issueDate') }}: {{ fmt(certificate.issue_date) }}</div>
            <div :class="{ expired: isExpired(certificate.expiration_date) }">
              {{ t('user.expiryDate') }}: {{ fmt(certificate.expiration_date) }}
            </div>
          </div>
        </div>

        <!-- Right: actions -->
        <div class="certificate-actions-section">
          <div>
            <el-button
              class="certificate-actions-item"
              :icon="Edit"
              size="small"
              @click="$emit('edit', certificate, index)"
            >
              {{ t('common.edit') }}
            </el-button>
          </div>

          <div>
            <el-button
              class="certificate-actions-item"
              :icon="Delete"
              type="danger"
              size="small"
              @click="$emit('delete', certificate, index)"
            >
              {{ t('common.delete') }}
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-cert-placeholder">
      <div>
        {{ t('user.noCertificates') }}
      </div>

      <div>
        <el-button plain type="primary" @click="$emit('add')">
          {{ t('user.addCertificate') }}
        </el-button>
      </div>
    </div>

    <div style="display: flex; flex-direction: row; justify-content: flex-end">
      <!-- Add Button -->
      <el-button v-if="certificates.length" plain type="primary" @click="$emit('add')">
        {{ t('user.addCertificate') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { Edit, Delete } from '@element-plus/icons-vue'
defineProps({
  certificates: {
    type: Array,
    required: true,
  },
})
defineEmits(['edit', 'delete', 'add'])

function fmt(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isExpired(iso) {
  return iso && new Date(iso).getTime() < Date.now()
}

const { t } = useI18n()
</script>

<style scoped>
.certificate-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.certificate-card {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  gap: 16px;
  align-items: center;
}

.certificate-image-preview-section {
  width: 30%;
  text-align: center;
}

.certificate-thumb {
  object-fit: cover;
}

.certificate-detail-section {
  width: 60%;
  display: flex;
  flex-direction: column;
}

.certificate-actions-section {
  width: 10%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.certificate-actions-item {
  width: 100%;
}

.certificate-detail-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.empty-cert-placeholder {
  align-self: center;
}

.expired {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
