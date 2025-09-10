<template>
  <el-table
    v-loading="loading"
    :data="sortedAndPaginatedList"
    @sort-change="handleSortChange"
    :height="tableHeight"
    style="width: 100%"
    :empty-text="t('common.noData')"
    border
    fit
  >
    <el-table-column prop="id" :label="'ID'" width="100" sortable fixed="left" align="center" />
    <el-table-column
      prop="name"
      :label="t('common.name')"
      width="180"
      sortable
      show-overflow-tooltip
      fixed="left"
      align="center"
    />
    <el-table-column
      prop="description"
      :label="t('common.description')"
      width="180"
      sortable
      show-overflow-tooltip
      align="center"
    />

    <el-table-column :label="t('shift.startTime')" prop="start_time" width="180" sortable align="center">
      <template #default="{ row }">
        <span>{{ formatTime(row.start_time) }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="t('shift.endTime')" prop="end_time" width="180" sortable align="center">
      <template #default="{ row }">
        <span>{{ formatTime(row.end_time) }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="grace_minute" :label="t('shift.graceTimeMinute')" width="230" sortable align="center" />
    <el-table-column prop="created_at" :label="t('common.createdAt')" width="180" sortable align="center">
      <template #default="{ row }">
        <TimeSlot :value="row.created_at" />
      </template>
    </el-table-column>

    <el-table-column prop="created_by" :label="t('common.createdBy')" width="180" sortable align="center">
      <template #default="{ row }">
        <UserTag :user="userMap[row.created_by]" />
      </template>
    </el-table-column>

    <el-table-column :label="t('common.actions')" align="center" header-align="center" fixed="right">
      <template #default="{ row }">
        <el-button size="small" @click="emit('edit-shift', row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button type="danger" size="small" @click="emit('delete-shift', row.id)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    v-if="filteredList.length > 15"
    background
    style="margin-top: 10px"
    layout="total, sizes, prev, pager, next"
    :total="filteredList.length"
    :page-size="pageSize"
    :page-sizes="[15, 30, 45, 60]"
    :current-page="currentPage"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
    :hide-on-single-page="true"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

import TimeSlot from '@/views/shift/components/TimeSlot.vue'
import UserTag from '@/views/user/components/UserTag.vue'

const props = defineProps({
  shifts: Array,
  searchInput: String,
  userMap: Object,
  loading: Boolean,
})

const emit = defineEmits(['edit-shift', 'delete-shift'])

const { t } = useI18n()

const originalList = ref([])
const filteredList = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const sortSettings = ref({ prop: '', order: '' })

const tableHeight = ref(600)
const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 50 - 100 - 20 - 20 - 10
}
onMounted(() => {
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateTableHeight)
})

// Display as local time
const formatTime = time => {
  if (!time) return '-'
  try {
    const utc = new Date(`1970-01-01T${time}`) // e.g. "03:00:00Z"
    return utc.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch (e) {
    return '-'
  }
}

watch(
  () => props.shifts,
  newVal => {
    originalList.value = [...newVal]
    filterTable(props.searchInput)
    currentPage.value = 1
  },
  { immediate: true, deep: true }
)

watch(
  () => props.searchInput,
  val => {
    filterTable(val)
  },
  { immediate: true }
)

// TODO: Filter and search handle in frontend now, can delegate to backend later
function filterTable(input) {
  const searchText = (input || '').toLowerCase()
  filteredList.value = originalList.value.filter(item => {
    return ['id', 'name', 'description', 'created_at', 'created_by', 'start_time', 'end_time', 'grace_minute'].some(
      key => item[key]?.toString().toLowerCase().includes(searchText)
    )
  })
}

// Sorting
function handleSortChange({ prop, order }) {
  sortSettings.value = { prop, order }
}

// Pagination
function handleSizeChange(newSize) {
  pageSize.value = newSize
  currentPage.value = 1
}
function handlePageChange(newPage) {
  currentPage.value = newPage
}

const sortedAndPaginatedList = computed(() => {
  const sorted = [...filteredList.value].sort((a, b) => {
    const { prop, order } = sortSettings.value
    let valueA, valueB

    if (!prop || !order) {
      valueA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at)
      valueB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at)
    } else {
      valueA = prop.includes('_at') ? new Date(a[prop] || 0) : a[prop] ?? 0
      valueB = prop.includes('_at') ? new Date(b[prop] || 0) : b[prop] ?? 0
    }

    if (order === 'ascending') return valueA > valueB ? 1 : -1
    if (order === 'descending') return valueA < valueB ? 1 : -1

    // fallback: compare by created_at
    return new Date(a.created_at) - new Date(b.created_at)
  })

  const start = (currentPage.value - 1) * pageSize.value
  return sorted.slice(start, start + pageSize.value)
})
</script>

<style scoped></style>
