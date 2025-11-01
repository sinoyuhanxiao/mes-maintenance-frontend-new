<template>
  <div>
    <!-- Header: Search + Edit/Done + Filter -->
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px">
      <el-input v-model="filterText" placeholder="Search Location" clearable style="flex: 1" />

      <!-- Compact group for Edit + (hidden) Filter -->
      <div class="actions-compact">
        <el-button size="default" :type="editMode ? 'success' : 'primary'" @click="toggleEdit" class="edit-toggle-btn">
          {{ editMode ? 'Done' : 'Edit' }}
        </el-button>

        <!-- Filter popover (kept, but hidden for now with showTierFilter) -->
        <el-popover
          v-if="showTierFilter"
          placement="bottom-end"
          trigger="manual"
          v-model:visible="filterOpen"
          width="270"
          :hide-after="0"
          :persistent="true"
          @show="ensureEquipmentTree"
        >
          <template #reference>
            <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center">
              <el-icon
                v-if="!editMode"
                class="filter-icon"
                :class="{ active: tierHasAnySelection }"
                @click.stop="filterOpen = !filterOpen"
                :title="tierHasAnySelection ? tierSelectionTitle : 'Filter by related equipment (T1/T2/T3)'"
              >
                <Filter />
              </el-icon>
            </div>
          </template>

          <div class="tier-filter-panel">
            <!-- T1 -->
            <div class="tier-row">
              <span>T1</span>
              <el-select
                v-model="selectedT1"
                placeholder="Select"
                clearable
                filterable
                style="width: 200px"
                :loading="equipTreeLoading"
                :teleported="false"
                @change="onTierChanged"
              >
                <el-option
                  v-for="opt in t1Opts"
                  :key="opt.id"
                  :label="opt.name || opt.label || '#' + opt.id"
                  :value="opt.id"
                />
              </el-select>
            </div>

            <!-- T2 (cascades from T1 if chosen) -->
            <div class="tier-row">
              <span>T2</span>
              <el-select
                v-model="selectedT2"
                placeholder="Select"
                clearable
                filterable
                style="width: 200px"
                :disabled="!t2Opts.length"
                :loading="equipTreeLoading"
                :teleported="false"
                @change="onTierChanged"
              >
                <el-option
                  v-for="opt in t2Opts"
                  :key="opt.id"
                  :label="opt.name || opt.label || '#' + opt.id"
                  :value="opt.id"
                />
              </el-select>
            </div>

            <!-- T3 (cascades from T2 if chosen) -->
            <div class="tier-row">
              <span>T3</span>
              <el-select
                v-model="selectedT3"
                placeholder="Select"
                clearable
                filterable
                style="width: 200px"
                :disabled="!t3Opts.length"
                :loading="equipTreeLoading"
                :teleported="false"
                @change="onTierChanged"
              >
                <el-option
                  v-for="opt in t3Opts"
                  :key="opt.id"
                  :label="opt.name || opt.label || '#' + opt.id"
                  :value="opt.id"
                />
              </el-select>
            </div>

            <div class="tier-actions">
              <!-- Reset -->
              <el-button size="small" @click="onResetClick" :disabled="!hasTierFilter"> Reset </el-button>
              <el-button size="small" type="primary" @click="onApplyClick"> Apply </el-button>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <el-scrollbar ref="scrollRef">
      <el-tree
        ref="treeRef"
        :data="visibleTree"
        :props="defaultProps"
        node-key="id"
        :default-expanded-keys="expandedKeys"
        :filter-node-method="filterNode"
        @node-click="onNodeClick"
        @node-expand="onExpand"
        @node-collapse="onCollapse"
        accordion
        :expand-on-click-node="false"
      >
        <!-- Custom node content -->
        <template #default="{ data }">
          <div class="node-row">
            <span class="node-label" :title="data.name">{{ data.name }}</span>

            <!-- Hide sub-loc text while editing -->
            <span v-if="!editMode && (data.children?.length ?? 0) > 0" class="node-subcount">
              {{ subCountText(data) }}
            </span>

            <span v-if="editMode" class="node-actions">
              <el-button link type="primary" size="default" @click.stop="onAddChildClick(data)">Add</el-button>
              <el-button
                link
                type="danger"
                size="default"
                :disabled="deleting.has(data.id)"
                @click.stop="deleteNode(data)"
              >
                Delete
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>

      <div v-if="!visibleTree.length && hasTierFilter && !equipLoading" class="empty-tip">
        <el-empty description="No locations with equipment matching the selected tiers" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'
import { deactivateLocation } from '@/api/location'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { getEquipmentTree, getEquipmentNodes } from '@/api/equipment'

/* ---------------- Props & Emits ---------------- */
const props = defineProps({
  treeData: { type: Array, required: true },
  defaultProps: { type: Object, required: true },

  // Optional: parent can still pass options; else we build from equipment tree
  t1Options: { type: Array, default: () => [] },
  t2Options: { type: Array, default: () => [] },
  t3Options: { type: Array, default: () => [] },

  getNodeTierIds: {
    type: Function,
    default: node => ({
      t1: node?.t1_id ?? node?.t1Id ?? null,
      t2: node?.t2_id ?? node?.t2Id ?? null,
      t3: node?.t3_id ?? node?.t3Id ?? null,
    }),
  },
})
const emit = defineEmits(['node-click', 'save-tree', 'deleted', 'add-child', 'filter-change'])

/* ---------------- Refs ---------------- */
const treeRef = ref()
const scrollRef = ref()
const filterText = ref('')

/* ---------------- Feature toggle: keep filter code, hide UI for now ---------------- */
const showTierFilter = ref(false) // set to true later to show the icon/popover

/* ---------------- Edit Mode & Trees ---------------- */
const editMode = ref(false)
const liveTree = ref([])
const draftTree = ref([])

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj ?? []))
}

watch(
  () => props.treeData,
  val => {
    liveTree.value = deepClone(val)
    if (editMode.value) {
      draftTree.value = deepClone(val)
    }
  },
  { immediate: true, deep: true }
)

const displayedTree = computed(() => (editMode.value ? draftTree.value : liveTree.value))

/* ---------------- Manual popover control ---------------- */
const filterOpen = ref(false)
function onKeydownEsc(e) {
  if (e.key === 'Escape') filterOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydownEsc))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydownEsc))

/* ---------------- Equipment TREE (for T1/T2/T3 options) ---------------- */
const equipTree = ref([])
const equipTreeLoading = ref(false)
let equipTreeLoaded = false

async function ensureEquipmentTree() {
  if (equipTreeLoaded || props.t1Options?.length) return
  equipTreeLoading.value = true
  try {
    const res = await getEquipmentTree()
    const payload = res?.data ?? res
    const data = payload?.data ?? payload
    equipTree.value = Array.isArray(data) ? data : []
    equipTreeLoaded = true
  } catch (e) {
    console.error('getEquipmentTree failed:', e)
    equipTree.value = []
  } finally {
    equipTreeLoading.value = false
  }
}

function buildIndex(tree) {
  const byId = new Map()
  const parent = new Map()
  const level = new Map()
  const roots = Array.isArray(tree) ? tree : []
  const stack = roots.map(n => ({ node: n, parentId: null, lvl: 1 }))
  while (stack.length) {
    const { node, parentId, lvl } = stack.pop()
    if (!node) continue
    const id = String(node.id) // store string ids
    byId.set(id, node)
    parent.set(id, parentId)
    level.set(id, lvl)
    const kids = Array.isArray(node.children) ? node.children : []
    for (let i = kids.length - 1; i >= 0; i--) {
      stack.push({ node: kids[i], parentId: id, lvl: lvl + 1 })
    }
  }
  return { byId, parent, level }
}

// Reset all tier selections and refresh filtering state
function clearAllTiers() {
  // 1) clear selections
  selectedT1.value = null
  selectedT2.value = null
  selectedT3.value = null

  // 2) clear match set (so tree shows all)
  equipMatchSet.value = new Set()

  // 3) keep scroll/selection stable
  const prevKey = treeRef.value?.getCurrentKey?.()
  const prevTop = getScrollTop()

  // 4) re-render & restore state
  nextTick(() => {
    restoreTreeState(prevKey, prevTop)
  })

  // 5) notify parent (if it listens to filter-change)
  emit('filter-change', { t1: null, t2: null, t3: null })
}

function onResetClick() {
  clearAllTiers()
  emit('filter-change', { t1: null, t2: null, t3: null })
  // keep the popover open on Reset (per your UX)
  // filterOpen.value = false   // <- leave commented to keep it open
}

function onApplyClick() {
  emit('filter-change', { t1: selectedT1.value, t2: selectedT2.value, t3: selectedT3.value })
  filterOpen.value = false // close only on Apply
}

const equipIdx = computed(() => buildIndex(equipTree.value))
function childrenOf(id) {
  const n = equipIdx.value.byId.get(String(id))
  return Array.isArray(n?.children) ? n.children : []
}

const t1Opts = computed(() => {
  if (props.t1Options?.length) return props.t1Options
  const out = []
  equipIdx.value.byId.forEach((node, id) => {
    if (equipIdx.value.level.get(id) === 1) out.push({ id, name: node.name })
  })
  return out
})
const t2Opts = computed(() => {
  if (props.t2Options?.length) return props.t2Options
  if (selectedT1.value != null) {
    return childrenOf(selectedT1.value).map(n => ({ id: String(n.id), name: n.name }))
  }
  const out = []
  equipIdx.value.byId.forEach((node, id) => {
    if (equipIdx.value.level.get(id) === 2) out.push({ id, name: node.name })
  })
  return out
})
const t3Opts = computed(() => {
  if (props.t3Options?.length) return props.t3Options
  if (selectedT2.value != null) {
    return childrenOf(selectedT2.value).map(n => ({ id: String(n.id), name: n.name }))
  }
  const out = []
  equipIdx.value.byId.forEach((node, id) => {
    if (equipIdx.value.level.get(id) === 3) out.push({ id, name: node.name })
  })
  return out
})

/* ---------------- Tier selections (UI state) ---------------- */
const selectedT1 = ref(null)
const selectedT2 = ref(null)
const selectedT3 = ref(null)
const hasTierFilter = computed(() => selectedT1.value != null || selectedT2.value != null || selectedT3.value != null)
const tierHasAnySelection = hasTierFilter
const tierSelectionTitle = computed(() => {
  const parts = []
  if (selectedT1.value != null) parts.push(`T1:${selectedT1.value}`)
  if (selectedT2.value != null) parts.push(`T2:${selectedT2.value}`)
  if (selectedT3.value != null) parts.push(`T3:${selectedT3.value}`)
  return parts.length ? `Filtering by ${parts.join(' · ')}` : 'Filter by related equipment (T1/T2/T3)'
})

/* ---------------- Equipment-based filtering (locations) ---------------- */
const equipLoading = ref(false)
const equipMatchSet = ref(new Set()) // stores STRING location ids

// stringify all location ids in the tree
function collectAllLocationIds(nodes) {
  const out = []
  const stack = Array.isArray(nodes) ? [...nodes] : []
  while (stack.length) {
    const n = stack.pop()
    if (!n) continue
    out.push(String(n.id))
    if (Array.isArray(n.children) && n.children.length) stack.push(...n.children)
  }
  return Array.from(new Set(out))
}

// try to read location ids directly from equipment records
function extractLocationIdsFromEquip(rec) {
  const ids = []
  const single = rec?.location_id ?? rec?.locationId ?? rec?.location_node_id ?? rec?.location?.id
  if (single != null) ids.push(String(single))

  const many = rec?.location_ids ?? rec?.locationIds ?? rec?.locations
  if (Array.isArray(many)) {
    many.forEach(x => {
      const v = x?.id ?? x
      if (v != null) ids.push(String(v))
    })
  }
  return ids
}

function chunk(arr, size) {
  const res = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

/**
 * Primary: bulk query with all location_ids + t1/t2/t3
 *  - If records expose location id(s), map directly (fast path).
 * Fallback: if none expose location id(s), probe by location batches to mark matches.
 */
async function fetchEquipMatches() {
  equipLoading.value = true
  equipMatchSet.value = new Set()
  try {
    const allLocStrIds = collectAllLocationIds(displayedTree.value) // ["12","13",...]
    if (!allLocStrIds.length) return

    const body = { location_ids: allLocStrIds }
    if (selectedT1.value != null) body.t1_ids = [selectedT1.value]
    if (selectedT2.value != null) body.t2_ids = [selectedT2.value]
    if (selectedT3.value != null) body.t3_ids = [selectedT3.value]

    const pageSize = 500
    let page = 1
    let done = false
    let sawAny = false
    let mappedAny = false

    while (!done) {
      const res = await getEquipmentNodes(page, pageSize, 'createdAt', 'DESC', body)
      const payload = res?.data ?? res
      const pg = payload?.data ?? payload
      const list = Array.isArray(pg?.content) ? pg.content : Array.isArray(pg) ? pg : []

      if (list.length) sawAny = true

      // map location ids if present in records
      for (const rec of list) {
        const locIds = extractLocationIdsFromEquip(rec)
        if (locIds.length) {
          mappedAny = true
          for (const sid of locIds) equipMatchSet.value.add(sid)
        }
      }

      const total = Number(pg?.totalElements ?? pg?.total ?? 0)
      const fetched = page * pageSize
      if (!list.length || (total && fetched >= total)) done = true
      else page += 1
    }

    // fallback: API filtered but records don't expose location ids
    if (sawAny && !mappedAny) {
      const BATCH = 25
      for (const group of chunk(allLocStrIds, BATCH)) {
        const probeBody = {
          location_ids: group,
          t1_ids: selectedT1.value != null ? [selectedT1.value] : undefined,
          t2_ids: selectedT2.value != null ? [selectedT2.value] : undefined,
          t3_ids: selectedT3.value != null ? [selectedT3.value] : undefined,
        }
        const res = await getEquipmentNodes(1, 1, 'createdAt', 'DESC', probeBody)
        const payload = res?.data ?? res
        const pg = payload?.data ?? payload
        const list = Array.isArray(pg?.content) ? pg.content : Array.isArray(pg) ? pg : []

        if (list.length > 0) {
          // be precise: probe each location in the batch
          for (const loc of group) {
            const singleBody = { ...probeBody, location_ids: [loc] }
            const r = await getEquipmentNodes(1, 1, 'createdAt', 'DESC', singleBody)
            const p = r?.data ?? r
            const g = p?.data ?? p
            const l = Array.isArray(g?.content) ? g.content : Array.isArray(g) ? g : []
            if (l.length > 0) equipMatchSet.value.add(String(loc))
          }
        }
      }
    }
  } catch (e) {
    console.error('fetchEquipMatches failed:', e)
  } finally {
    equipLoading.value = false
  }
}

async function onTierChanged() {
  // cascading resets
  if (selectedT1.value == null) {
    selectedT2.value = null
    selectedT3.value = null
  } else if (selectedT2.value == null) {
    selectedT3.value = null
  }

  const prevKey = treeRef.value?.getCurrentKey?.()
  const prevTop = getScrollTop()
  if (hasTierFilter.value) {
    await fetchEquipMatches()
  } else {
    equipMatchSet.value = new Set()
  }
  await nextTick()
  restoreTreeState(prevKey, prevTop)

  // live updates to parent, popover remains open
  emit('filter-change', { t1: selectedT1.value, t2: selectedT2.value, t3: selectedT3.value })
}

/**
 * Keep node if:
 *  - No tier selected  => show all
 *  - Tier selected     => node.id in equipMatchSet OR has descendant in set
 */
function applyTierFilters(list) {
  if (!hasTierFilter.value) return list
  const allowed = equipMatchSet.value // Set of string ids like "12"

  function dfs(nodes) {
    if (!Array.isArray(nodes)) return []
    const out = []
    for (const n of nodes) {
      const kids = dfs(n.children)
      const keepSelf = allowed.has(String(n.id)) // string compare
      if (keepSelf || kids.length > 0) {
        out.push({ ...n, children: kids })
      }
    }
    return out
  }
  return dfs(list)
}

const visibleTree = computed(() => applyTierFilters(displayedTree.value))

/* ---------------- Expanded state ---------------- */
const expandedSet = ref(new Set())
const expandedKeys = computed(() => Array.from(expandedSet.value))
function onExpand(data) {
  expandedSet.value.add(data.id)
}
function onCollapse(data) {
  expandedSet.value.delete(data.id)
}

function reapplyExpanded() {
  const tree = treeRef.value
  if (!tree) return
  for (const id of expandedSet.value) {
    const node = tree.getNode?.(id)
    if (node) tree.expandNode?.(node, true)
  }
}

/* ---------------- Scroll helpers ---------------- */
function getScrollTop() {
  const wrap = scrollRef.value?.wrapRef
  return wrap ? wrap.scrollTop : 0
}
function setScrollTop(top) {
  const wrap = scrollRef.value?.wrapRef
  if (wrap) wrap.scrollTop = top || 0
}
async function restoreTreeState(prevKey, prevTop) {
  await nextTick()
  reapplyExpanded()
  if (prevKey != null && treeRef.value?.getCurrentKey?.() !== prevKey) {
    treeRef.value?.setCurrentKey(prevKey)
  }
  if (prevTop != null) setScrollTop(prevTop)
}

/* ---------------- Toggle Edit ---------------- */
async function toggleEdit() {
  const prevKey = treeRef.value?.getCurrentKey?.()
  const prevTop = getScrollTop()
  if (!editMode.value) {
    draftTree.value = deepClone(liveTree.value)
    editMode.value = true
  } else {
    liveTree.value = deepClone(draftTree.value)
    editMode.value = false
    emit('save-tree', deepClone(liveTree.value))
  }
  restoreTreeState(prevKey, prevTop)
}

/* ---------------- Search / Filter ---------------- */
const filterNode = (value, data) => {
  if (!value) return true
  return String(data.name || '')
    .toLowerCase()
    .includes(String(value).toLowerCase())
}
watch(filterText, async val => {
  treeRef.value?.filter(val)
  await nextTick()
  const list = visibleTree.value
  const firstMatched = findFirstMatched(list, val)
  if (firstMatched) {
    emit('node-click', { id: firstMatched.id })
    nextTick(() => {
      treeRef.value?.setCurrentKey(firstMatched.id)
    })
  }
})
function findFirstMatched(nodes, val) {
  if (!Array.isArray(nodes)) return null
  for (const node of nodes) {
    if (filterNode(val, node)) return node
    const match = findFirstMatched(node.children, val)
    if (match) return match
  }
  return null
}

/* ---------------- Selection ---------------- */
const onNodeClick = data => {
  emit('node-click', data)
  treeRef.value?.setCurrentKey?.(data.id)
}

/* ---------------- Add / Delete ---------------- */
let tempId = 0
function genTempId() {
  tempId -= 1
  return tempId
}
function addChild(target) {
  const newNode = { id: genTempId(), name: 'New Location', children: [] }
  if (!Array.isArray(target.children)) target.children = []
  target.children.push(newNode)
  nextTick(() => {
    const tnode = treeRef.value?.getNode(target)
    treeRef.value?.expandNode?.(tnode)
    treeRef.value?.setCurrentKey(newNode.id)
    emit('node-click', newNode)
  })
}
function onAddChildClick(parent) {
  const id = Number(parent?.id)
  if (!Number.isFinite(id)) return
  emit('add-child', { id })
}
function findContainer(arr, id, parent = null) {
  if (!Array.isArray(arr)) return null
  for (let i = 0; i < arr.length; i++) {
    const n = arr[i]
    if (n.id === id) return { container: arr, index: i, parent }
    if (Array.isArray(n.children)) {
      const res = findContainer(n.children, id, n)
      if (res) return res
    }
  }
  return null
}
function removeById(list, id) {
  if (!Array.isArray(list)) return false
  for (let i = 0; i < list.length; i++) {
    const n = list[i]
    if (n.id === id) {
      list.splice(i, 1)
      return true
    }
    if (removeById(n.children, id)) return true
  }
  return false
}
function findAnyNode(list) {
  if (!Array.isArray(list)) return null
  const stack = [...list]
  while (stack.length) {
    const n = stack.shift()
    if (n) return n
    if (n?.children?.length) stack.push(...n.children)
  }
  return null
}

const deleting = ref(new Set())
const { confirmAction, showSuccess } = useErrorHandler()
async function deleteNode(target) {
  const id = Number(target?.id)
  if (!Number.isFinite(id)) return
  const prevTop = getScrollTop()
  const confirmed = await confirmAction({
    title: 'Confirm',
    message: `Are you sure you want to delete "${target?.name || 'this location'}"?`,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
  if (!confirmed) return

  const source = editMode.value ? draftTree.value : liveTree.value
  const info = findContainer(source, id)
  let nextSelection = null
  if (info) {
    if (info.parent) {
      nextSelection = info.parent
    } else {
      const { container, index } = info
      const nextIdx = index + 1 < container.length ? index + 1 : -1
      const prevIdx = index - 1 >= 0 ? index - 1 : -1
      if (nextIdx !== -1) nextSelection = container[nextIdx]
      else if (prevIdx !== -1) nextSelection = container[prevIdx]
    }
  }

  deleting.value.add(id)
  try {
    await deactivateLocation(id)
    removeById(draftTree.value, id)
    removeById(liveTree.value, id)
    expandedSet.value.delete(id)
    showSuccess('Location deleted successfully')
    emit('deleted', id)

    if (!nextSelection) nextSelection = findAnyNode(visibleTree.value)
    await nextTick()
    reapplyExpanded()
    if (nextSelection) {
      treeRef.value?.setCurrentKey(nextSelection.id)
      emit('node-click', nextSelection)
    } else {
      treeRef.value?.setCurrentKey?.(null)
      emit('node-click', null)
    }
    setScrollTop(prevTop)
  } catch (err) {
    ElMessage.error('Failed to delete location')
    console.error('delete location failed:', err)
  } finally {
    deleting.value.delete(id)
  }
}

/* ---------------- Sub Location Counter ---------------- */
function subCountText(node) {
  const n = Array.isArray(node?.children) ? node.children.length : 0
  return `${n} sub-loc${n === 1 ? '' : 's'}`
}

/* ---------------- Reactive exports ---------------- */
defineExpose({ treeRef, toggleEdit, addChild, deleteNode })
</script>

<style scoped>
.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.node-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-subcount {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 6px;
  padding-right: 10px;
}
.node-actions {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 0;
  white-space: nowrap;
  padding-right: 4px;
}
.edit-toggle-btn {
  width: 60px;
  justify-content: center;
  margin-right: 0;
}

/* tighter spacing just between Edit and Filter */
.actions-compact {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Filter panel styling */
.tier-filter-panel {
  display: grid;
  gap: 10px;
}
.tier-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tier-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}
.filter-icon {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
  margin-left: 4px;
  margin-right: 8px;
}
.filter-icon:hover {
  color: var(--el-color-primary);
}
.filter-icon.active {
  color: var(--el-color-primary);
}
.empty-tip {
  padding: 16px 0;
}
</style>
