<!-- src/views/equipment/components/subEquipment/SubItems.vue (Tier 4) -->
<template>
  <div class="t4-subitems">
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-state" v-loading="loading" />

    <!-- TOP / BOTTOM layout (always vertical) -->
    <template v-else>
      <div class="t4-split">
        <!-- TOP: Image / Exploded View -->
        <section class="t4-top">
          <el-descriptions :column="1" direction="vertical" class="top-desc">
            <el-descriptions-item label="Tier 4 Exploded View">
              <template v-if="showImage">
                <div class="image-container">
                  <el-image
                    :key="(imageSrc || '') + '-' + previewImages.length"
                    :src="imageSrc"
                    :alt="props.imageAlt"
                    fit="contain"
                    :preview-src-list="previewImages"
                    :hide-on-click-modal="true"
                    preview-teleported
                    :z-index="4000"
                    class="equipment-image"
                    title="T4 Image"
                  >
                    <template #error>
                      <div class="image-slot t4-slot image-viewer-slot">
                        <el-icon><IconPicture /></el-icon>
                      </div>
                    </template>
                    <template #viewer-error="{ activeIndex, src }">
                      <div class="image-slot viewer-error">
                        <el-icon><IconPicture /></el-icon>
                        <span> image not available (index: {{ activeIndex }}) • {{ src }} </span>
                      </div>
                    </template>
                  </el-image>
                </div>
              </template>
              <template v-else>
                <span>No exploded view available</span>
              </template>
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <!-- BOTTOM: Tier 5 Spare Parts -->
        <section class="t4-bottom">
          <div class="spare-parts-table">
            <el-descriptions :column="1" direction="vertical" class="top-desc">
              <el-descriptions-item v-if="sparePartsData.length > 0" label="Tier 5 Spare Parts" />
              <el-descriptions-item v-else label="Tier 5 Spare Parts">
                No tier 5 spare parts available.
              </el-descriptions-item>
            </el-descriptions>

            <template v-if="sparePartsData.length > 0">
              <!-- Cards list (fill the column width) -->
              <div class="card-list" v-if="pagedRows.length > 0">
                <SparePartCard v-for="it in pagedRows" :key="it.id" :item="it" @edit="onEdit" @delete="onDelete" />
              </div>

              <div class="pagination-wrapper">
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :current-page="listQuery.page"
                  :page-size="listQuery.limit"
                  :total="filteredRows.length"
                  :pager-count="5"
                  @current-change="handleCurrentChange"
                />
              </div>
            </template>
          </div>
        </section>
      </div>

      <!-- Dialog lives outside split so it overlays nicely -->
      <el-dialog v-model="editDialog.visible" title="Edit Tier 5 Spare Part" width="720px" destroy-on-close draggable>
        <AddTier5Form
          v-if="editDialog.visible"
          :key="'t5-edit-' + (editDialog.initial?.id ?? 0)"
          :tier4-id="resolveTier4Id()"
          :parent-id="resolveTier4Id()"
          mode="edit"
          :initial="editDialog.initial"
          @success="onEditSuccess"
          @close="editDialog.visible = false"
        />
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, useAttrs, computed, nextTick } from 'vue'
import defaultImageUrl from '@/assets/imgs/default-image.png'
import { getEquipmentById, getEquipmentSubtree, deactivateEquipmentNode } from '@/api/equipment'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddTier5Form from './components/AddTier5Form.vue'
import { getSparePartById } from '@/api/resources'
import { Picture as IconPicture } from '@element-plus/icons-vue'
import SparePartCard from './components/CardTable/SparePartCard.vue'

const props = defineProps({
  imageUrl: { type: String, default: defaultImageUrl },
  imageAlt: { type: String, default: 'Equipment image' },
})

const emit = defineEmits(['edit-tier5', 'delete-tier5', 'tier5-deleted'])

const loading = ref(false)

const imageSrc = ref('')
const previewImages = ref([])
const showImage = ref(false)

const sparePartsData = ref([])

const searchText = ref('')
const listQuery = reactive({ page: 1, limit: 5 })
const editDialog = ref({ visible: false, initial: null })

// cache spare-parts so we don't refetch for every row
const spCache = new Map()
async function getSparePartCached(id) {
  if (!id) return null
  if (spCache.has(id)) return spCache.get(id)
  const resp = await getSparePartById(Number(id))
  const sp = resp?.data?.data ?? resp?.data ?? resp ?? {}
  spCache.set(id, sp)
  return sp
}

const filteredRows = computed(() => {
  const q = (searchText.value || '').toLowerCase().trim()
  if (!q) return sparePartsData.value
  return sparePartsData.value.filter(r => {
    const a = (r.title || '').toLowerCase()
    const b = (r.partNumber || '').toLowerCase()
    return a.includes(q) || b.includes(q)
  })
})
const pagedRows = computed(() => {
  const start = (listQuery.page - 1) * listQuery.limit
  return filteredRows.value.slice(start, start + listQuery.limit)
})
function handleCurrentChange(page) {
  listQuery.page = page
}

const isWide = ref(false)
function updateIsWide() {
  isWide.value = typeof window !== 'undefined' && window.innerWidth >= 1440
}
onMounted(() => {
  updateIsWide()
  window.addEventListener('resize', updateIsWide)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsWide)
})

const attrs = useAttrs()
function resolveTier4Id() {
  const a = attrs.tier4Id ?? attrs['tier4-id']
  if (a == null || a === '' || Number.isNaN(Number(a))) return null
  return Number(a)
}

function validateImage(url) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
async function filterReachableImages(urls) {
  const results = await Promise.all(urls.map(validateImage))
  return urls.filter((u, i) => results[i])
}

/** Load Tier 4 image */
async function loadNodeImage(id) {
  if (id == null) {
    showImage.value = false
    imageSrc.value = ''
    previewImages.value = []
    return
  }
  try {
    const resp = await getEquipmentById(id)
    const node = resp?.data?.data ?? resp?.data ?? resp

    const exploded = node?.exploded_view_drawing || null
    const candidates = exploded ? [exploded] : []

    const valid = await filterReachableImages(candidates)
    if (valid.length) {
      imageSrc.value = valid[0]
      previewImages.value = valid
      showImage.value = true
    } else {
      showImage.value = false
      imageSrc.value = ''
      previewImages.value = []
    }
  } catch (err) {
    console.error('loadNodeImage failed:', err)
    showImage.value = false
    imageSrc.value = ''
    previewImages.value = []
  }
}

/** STRICT detail mapper — always show name/code from spare-part
 *  and use node image, falling back to spare-part image. */
async function fetchTier5Detail(t5id, fallbackIndex = 0) {
  const res = await getEquipmentById(Number(t5id))
  const d = res?.data?.data ?? res?.data ?? res ?? {}

  // spare part id on node
  const spId = d.spare_part_id ?? d.spare_part_definition_id ?? d.sparePartId ?? d.sparePartDefinitionId ?? null

  // read spare-part (for name/code and image fallback)
  let sp = null
  if (spId) {
    try {
      sp = await getSparePartCached(spId)
    } catch (e) {
      console.warn('getSparePartById failed for', spId, e)
    }
  }

  // ALWAYS take name/code from spare-part (your rule)
  const spName = sp?.name ?? ''
  const spCode = sp?.code ?? ''

  // Prefer node image; if missing, fall back to spare-part image
  const nodeImgs = Array.isArray(d.image_list) ? d.image_list.filter(Boolean) : []
  const spImgs = Array.isArray(sp?.image_list) ? sp.image_list.filter(Boolean) : []
  const imageUrl = nodeImgs[0] || spImgs[0] || null || null

  const seqRaw = d.sequence_order ?? d.sequenceOrder
  const seq = seqRaw == null ? fallbackIndex + 1 : seqRaw

  const qty = d.spare_part_quantity ?? d.device_quantity ?? 1
  const autoTrig = d.is_auto_trigger === true ? 'Yes' : d.is_auto_trigger === false ? 'No' : ''
  const last = d.last_maintenance_date ?? d.installation_date ?? null

  return {
    id: d.id ?? Number(t5id),

    // table display (from spare-part)
    title: spName || '',
    partNumber: spCode || '',

    // other fields (from node)
    sparePartId: spId ?? null,
    deviceTagPositionCode: seq != null ? String(seq) : '',
    deviceQuantity: String(qty),
    suggestedServiceDays: d.suggested_maintenance_interval_days ?? null,
    estimatedServiceDays: d.estimated_maintenance_interval_days ?? null,
    autoTriggerCycle: autoTrig,
    lastInstallmentTime: last,
    imageUrl,
  }
}

/** Batch fetch — ensures only objects go into the table */
async function fetchTier5DetailsInChunks(ids, chunkSize = 8) {
  const out = []
  for (let i = 0; i < ids.length; i += chunkSize) {
    const slice = ids.slice(i, i + chunkSize)
    const rows = await Promise.allSettled(slice.map((id, idxInSlice) => fetchTier5Detail(id, i + idxInSlice)))
    for (const s of rows) {
      if (s.status === 'fulfilled' && s.value && typeof s.value === 'object') {
        out.push(s.value)
      } else {
        // fallback to a minimal object; never push a number
        const id = typeof s?.reason?.id === 'number' ? s.reason.id : null
        if (id != null) out.push({ id, title: `Part ${id}`, partNumber: `P-${id}` })
      }
    }
  }
  return out
}

/** Subtree -> IDs -> details -> table rows */
async function loadSubtree(id) {
  if (id == null) return
  try {
    const resp = await getEquipmentSubtree(id)
    const json = resp?.data ?? resp

    const children = Array.isArray(json?.data?.children)
      ? json.data.children
      : Array.isArray(json?.children)
      ? json.children
      : []

    const sorted = [...children].sort((a, b) => {
      const sa = a.sequenceOrder ?? a.sequence_order ?? Number.MAX_SAFE_INTEGER
      const sb = b.sequenceOrder ?? b.sequence_order ?? Number.MAX_SAFE_INTEGER
      if (sa !== sb) return sa - sb
      return (a.id || 0) - (b.id || 0)
    })

    const ids = sorted.map(c => c.id).filter(Boolean)

    let rows = []
    if (ids.length) rows = await fetchTier5DetailsInChunks(ids, 8)

    // final guard: coerce any stray primitive
    rows = rows.map(r => (r && typeof r === 'object' ? r : { id: r, title: `Part ${r}`, partNumber: `P-${r}` }))

    sparePartsData.value = rows
  } catch (err) {
    console.error('loadSubtree failed:', err)
    sparePartsData.value = []
  }
}

function mapRowToInitial(row) {
  return {
    id: row.id,
    sparePart: {
      id: row.spare_part_definition?.id ?? row.sparePartId ?? null,
      title: row.title ?? row.name ?? '',
      partNumber: row.partNumber ?? row.code ?? '',
      raw: row.spare_part_definition ?? null,
    },
    partNumber: row.partNumber ?? row.code ?? '',
    deviceTagPositionCode: row.deviceTagPositionCode ?? '',
    deviceQuantity: Number(row.spare_part_quantity ?? row.deviceQuantity ?? row.device_quantity ?? 1),
    suggestedServiceDays: Number(row.suggestedServiceDays ?? 0),
    estimatedServiceDays: Number(row.estimatedServiceDays ?? 0),
    autoTriggerCycle: row.autoTriggerCycle === true || row.autoTriggerCycle === 'Yes' ? 'Yes' : 'No',
    lastInstallmentTime: row.lastInstallmentTime ? new Date(row.lastInstallmentTime) : null,
  }
}

async function refreshRowById(id) {
  try {
    const fresh = await fetchTier5Detail(id)
    const i = sparePartsData.value.findIndex(r => Number(r.id) === Number(id))
    if (i !== -1) {
      sparePartsData.value.splice(i, 1, fresh)
    } else {
      sparePartsData.value.unshift(fresh)
    }
    resortByPos() // optional: keep table order if position changed
  } catch (e) {
    console.error('refreshRowById failed', e)
    await refreshAll()
  }
}

function resortByPos() {
  sparePartsData.value.sort((a, b) => {
    const sa = Number(a.deviceTagPositionCode ?? a.sequence_order ?? 1e9)
    const sb = Number(b.deviceTagPositionCode ?? b.sequence_order ?? 1e9)
    if (sa !== sb) return sa - sb
    return Number(a.id) - Number(b.id)
  })
}

async function onEditSuccess(payload) {
  editDialog.value.visible = false
  const id = payload?.id ?? payload?.data?.id ?? editDialog.value.initial?.id ?? null
  if (!id) return refreshAll()
  await refreshRowById(id)
}

function onEdit(row) {
  editDialog.value.initial = mapRowToInitial(row)
  editDialog.value.visible = true
}

function adjustPagerAfterDelete() {
  // after sparePartsData changes, recompute pagination & keep user on a valid page
  nextTick(() => {
    const total = filteredRows.value.length
    const totalPages = Math.max(1, Math.ceil(total / listQuery.limit))
    if (listQuery.page > totalPages) listQuery.page = totalPages
  })
}

function removeRowById(id) {
  const n = Number(id)
  sparePartsData.value = sparePartsData.value.filter(r => Number(r.id) !== n)
  adjustPagerAfterDelete()
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(
      `Delete tier 5 spare part "${
        row.title || row.name || row.partNumber || row.code || row.id
      }"? This cannot be undone.`,
      'Delete Confirmation',
      { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }
    )

    const id = row.id

    removeRowById(id) // optimistic UI
    await deactivateEquipmentNode(id)

    emit('tier5-deleted', { parentId: resolveTier4Id(), deletedId: id })
    ElMessage.success('Deleted')
  } catch (e) {
    if (e === 'cancel' || e === 'close') return
    console.error(e)
    ElMessage.error(e?.message || 'Delete failed')
    await refreshAll() // fallback
  }
}

async function refreshAll() {
  const id = resolveTier4Id()
  loading.value = true
  try {
    await Promise.allSettled([loadNodeImage(id), loadSubtree(id)])
  } finally {
    loading.value = false
  }
}
onMounted(refreshAll)
watch(
  () => [attrs.tier4Id, attrs['tier4-id']],
  () => {
    listQuery.page = 1
    refreshAll()
  }
)
</script>

<style scoped>
/* Namespaced root to avoid collisions with other tiers */
.t4-subitems {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Loading area height so spinner doesn’t collapse */
.loading-state {
  width: 100%;
  height: 320px;
}

/* Force TOP/BOTTOM layout (immune to other tier styles) */
.t4-split {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px;
  width: 100%;
}

/* Ensure sections can shrink properly */
.t4-top,
.t4-bottom {
  min-width: 0;
}

/* TOP: image area with responsive height */
/* TOP: image area with responsive height */
.image-container {
  /* min 240px, scales with viewport height, max 55vh */
  height: clamp(240px, 45vh, 55vh);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  max-width: 100%;
}

.equipment-image {
  width: 100%;
  height: 100%;
}
.equipment-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* unified icon fallback */
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 16px;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  border-radius: 6px;
}
.image-slot .el-icon {
  font-size: 24px;
}
.viewer-error {
  color: var(--el-text-color-primary);
}
:deep(.el-image-viewer__wrapper) {
  z-index: 4000;
}

/* BOTTOM: cards/table section */
.spare-parts-table {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden; /* contain internal scrollers */
}

/* cards list always fits container, no horizontal scroll */
.card-list {
  display: grid;
  grid-template-columns: 1fr; /* single column */
  gap: 10px;
  overflow-y: auto; /* vertical scroll if too many */
  overflow-x: hidden; /* prevent sideways scroll */
  padding-right: 4px;
  min-width: 0; /* prevent card overflow */
}

/* make each card fill full width */
.card-list :deep(.el-card) {
  width: 100% !important;
  min-width: 0;
}

/* actions row inside SparePartCard (buttons closer together) */
:deep(.spare-part-card-actions) {
  display: flex;
  justify-content: flex-end; /* align to right */
  gap: 6px; /* small gap between edit/delete */
}

/* tighter buttons */
:deep(.spare-part-card-actions .el-button) {
  padding: 4px 8px;
  font-size: 13px;
}

/* pagination centered under list */
.pagination-wrapper {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

/* Descriptions tighten a little */
.top-desc :deep(.el-descriptions__label) {
  font-weight: 600;
}

/* Narrow screens — keep vertical stack, adjust heights */
@media (max-width: 900px) {
  .image-container {
    height: 48vh;
    min-height: 240px;
  }
}
@media (max-width: 560px) {
  .image-container {
    height: 42vh;
    min-height: 200px;
  }
  .spare-parts-table {
    overflow: visible;
  } /* let page scroll */
}
</style>
