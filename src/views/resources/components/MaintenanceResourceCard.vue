<template>
  <div
    class="resource-card"
    :class="{
      selected: isSelected,
      'low-stock': isLowStock && !isOutOfStock,
      'out-of-stock': isOutOfStock,
      'has-badges': isLowStock || isOutOfStock,
      'no-badges': !isLowStock && !isOutOfStock,
    }"
    @click="onCardClick"
  >
    <div class="card-content">
      <div class="content-main">
        <h4 class="card-title" :title="displayName">
          {{ displayName }}
        </h4>

        <div class="card-meta">
          <div class="meta-row">
            <span class="meta-label">Part #:</span>
            <span class="meta-value">{{ displayCode }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Inventory #:</span>
            <span class="meta-value">{{ displayUniversalCode }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Current Stock:</span>
            <span
              class="meta-value"
              :class="{
                'danger-text': isOutOfStock,
                'warning-text': isLowStock && !isOutOfStock,
              }"
            >
              {{ displayStock }}
            </span>
          </div>
        </div>

        <div class="card-badges" v-if="isLowStock || isOutOfStock">
          <el-tag v-if="isOutOfStock" type="danger" size="small" effect="dark"> Out of Stock </el-tag>
          <el-tag v-else-if="isLowStock" type="warning" size="small" effect="dark"> Low Stock </el-tag>
        </div>
      </div>

      <div class="card-thumbnail-circle" v-if="validImage">
        <el-image
          :src="validImage"
          fit="cover"
          class="circular-image"
          :z-index="2000"
          preview-teleported
          @error="onImgError"
        >
          <template #error></template>
        </el-image>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['selection'])
const onCardClick = () => emit('selection', props.data)

/* Display helpers */
const displayName = computed(() => props.data?.name || '--')
const displayCode = computed(() => props.data?.code || '--')
const displayUniversalCode = computed(() => props.data?.universal_code || '--')
const displayStock = computed(() => {
  const stock = props.data?.current_stock
  if (stock === null || stock === undefined || stock === '') return '--'
  return `${stock}`
})

/* Flags */
const isOutOfStock = computed(() => {
  const s = props.data?.current_stock
  return typeof s === 'number' && s <= 0
})

const isLowStock = computed(() => {
  const s = props.data?.current_stock
  const min = props.data?.minimum_stock_level
  return typeof s === 'number' && typeof min === 'number' && s < min && s > 0
})

/* Image check */
const validImage = ref('')
let probeToken = 0

function normalizeFirstImage(src) {
  const first = Array.isArray(src) ? src[0] : src
  if (!first || (typeof first === 'string' && first.trim() === '')) return ''
  return first
}

async function probeImage200(url) {
  try {
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    if (head.ok) return true
    if (head.status === 405) throw new Error('HEAD not allowed')
  } catch {}
  try {
    const get = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      cache: 'no-store',
    })
    if (!get.ok) return false
    const ct = (get.headers.get('content-type') || '').toLowerCase()
    return ct.startsWith('image/')
  } catch {
    return false
  }
}

function onImgError() {
  validImage.value = ''
}

watchEffect(async () => {
  const src = normalizeFirstImage(props.data?.image_list)
  const myToken = ++probeToken
  if (!src) {
    validImage.value = ''
    return
  }
  const ok = await probeImage200(src)
  if (myToken !== probeToken) return
  validImage.value = ok ? src : ''
})
</script>

<style scoped lang="scss">
.resource-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.low-stock {
    border-left: 2px solid var(--el-color-warning);
  }

  &.out-of-stock {
    border-left: 2px solid var(--el-color-danger);
  }
}

.resource-card.has-badges .card-content {
  align-items: flex-start;
}
.resource-card.no-badges .card-content {
  align-items: center;
  margin-bottom: 15px;
}

.card-content {
  display: flex;
  gap: 14px;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
  line-height: 1.35;
}
.resource-card.no-badges .card-title {
  margin-top: 15px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}
.meta-row {
  display: flex;
  align-items: center;
  margin: 0 0 6px 0;
}
.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 90px;
  white-space: nowrap;
}
.meta-value {
  color: var(--el-text-color-primary);
}

/* ⚠️ Low stock orange, ❌ Out of stock red */
.meta-value.warning-text {
  color: var(--el-color-warning);
  font-weight: 500;
}
.meta-value.danger-text {
  color: var(--el-color-danger);
  font-weight: 500;
}

.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0 0;
}

/* Thumbnail circle — no hover */
.card-thumbnail-circle {
  flex-shrink: 0;
  width: 76px;
  height: 76px;

  .circular-image {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--el-border-color-lighter);

    :deep(.el-image__inner) {
      border-radius: 50%;
      object-fit: cover;
    }
  }
}

/* Responsive */
@media (max-width: 768px) {
  .resource-card {
    padding: 10px 12px;
    margin-bottom: 6px;
  }
  .card-content {
    gap: 10px;
  }
  .card-title {
    font-size: 14px;
    margin-bottom: 6px;
  }
  .card-thumbnail-circle {
    width: 60px;
    height: 60px;
    .circular-image {
      width: 60px;
      height: 60px;
    }
  }
}
</style>
