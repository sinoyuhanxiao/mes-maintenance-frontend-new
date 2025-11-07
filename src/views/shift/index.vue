<template>
  <MesLayout :title="t('shift.shiftManagement')" :view-mode="'table'">
    <template #viewMode> </template>

    <template #head>
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="filters-container">
          <!-- Keyword Filter -->
          <div class="filter-item"></div>
        </div>

        <div class="actions-row">
          <div class="actions-item">
            <el-input
              v-model="localFilters.keyword"
              :placeholder="t('user.searchByName')"
              clearable
              @input="handleFilterChange"
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="actions-item">
            <el-button :icon="EditPen" type="primary" @click="openCreateForm">
              {{ t('workOrder.actions.create') }}
            </el-button>
          </div>

          <!--          <div class="actions-item">-->
          <!--            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">-->
          <!--              {{ 'Clear Filters' }}-->
          <!--            </el-button>-->
          <!--          </div>-->

          <div class="actions-item">
            <el-button :icon="RefreshIcon" @click="refreshTable">
              {{ 'Refresh' }}
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <el-table
        v-loading="loading"
        :data="shiftsTableData"
        fit
        highlight-current-row
        style="width: 100%"
        :height="tableHeight"
        :empty-text="t('common.noData')"
        @sort-change="handleSortChange"
        border
      >
        <el-table-column
          prop="name"
          :label="t('common.name')"
          width="200"
          sortable="custom"
          align="center"
          fixed="left"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-text>{{ scope.row.name }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="'ID'" width="100" sortable="custom" align="center" fixed="left" />

        <el-table-column prop="start_time" :label="t('shift.startTime')" width="200" sortable="custom" align="center" />
        <el-table-column prop="end_time" :label="t('shift.endTime')" width="200" sortable="custom" align="center" />
        <el-table-column
          prop="description"
          :label="t('common.description')"
          show-overflow-tooltip
          width="400"
          sortable="custom"
          align="center"
        >
          <template #default="scope">
            <el-text>{{ scope.row.description || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column
          sortable="custom"
          prop="created_at"
          label="Created At"
          min-width="180"
          show-overflow-tooltip
          align="center"
        >
          <template #default="scope">
            <el-text>
              {{ formatAsLocalDateTimeString(scope.row.created_at) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column
          sortable="custom"
          prop="updated_at"
          label="Updated At"
          min-width="180"
          show-overflow-tooltip
          align="center"
        >
          <template #default="scope">
            <el-text>
              {{ formatAsLocalDateTimeString(scope.row.updated_at) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" fixed="right" align="center" width="200">
          <template #default="scope">
            <el-button :icon="Edit" size="small" type="primary" @click="handleEdit(scope.row)">{{
              t('common.edit')
            }}</el-button>
            <el-button :icon="Delete" size="small" type="danger" @click="handleDeactivate(scope.row.id)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Dialog -->
      <el-dialog
        :title="currentEditingShift ? t('shift.editShift') : t('shift.createShift')"
        v-model="isDialogVisible"
        top="10vh"
        width="50%"
        @close="handleFormClosed"
      >
        <div v-loading="isFormProcessing">
          <ShiftForm
            ref="shiftFormRef"
            :shift="currentEditingShift"
            @confirm="handleShiftSubmitted"
            @cancel="handleFormClosed"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>
    </template>

    <template #foot>
      <el-pagination
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="totalElements"
      />
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MesLayout from '@/components/MesLayout'
import { Delete, Edit, EditPen, Refresh as RefreshIcon, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchShifts, deactivateShift } from '@/api/shift'
import { getAllUsers } from '@/api/user'
// import UserTag from '@/views/user/components/UserTag.vue'
import ShiftForm from '@/views/shift/components/shiftForm.vue'
import { formatAsLocalDateTimeString } from '@/utils/datetime'
// import { convertToLocalTime } from '@/utils/datetime'

const { t } = useI18n()

const loading = ref( false )
const isFormProcessing = ref( false )
const isDialogVisible = ref( false )
const shiftsTableData = ref( [] )
const sortSettings = ref( { prop : 'id', order : 'descending' } )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const totalElements = ref( 0 )
const tableHeight = ref( window.innerHeight - 250 )
const currentEditingShift = ref( null )
const userOptions = ref( [] )
const initialFilters = { keyword : '' }
const localFilters = reactive( { ...initialFilters } )
const shiftFormRef = ref()

// const userMap = computed( () =>
//   Object.fromEntries( userOptions.value.map( user => [user.id, user] ) )
// )

function openCreateForm() {
  currentEditingShift.value = null
  isDialogVisible.value = true
}

function handleEdit( shift ) {
  currentEditingShift.value = shift
  isDialogVisible.value = true
}

function handleShiftSubmitted() {
  isDialogVisible.value = false
  loadShifts()
}

function handleFilterChange() {
  currentPage.value = 1
  loadShifts()
}

function handleFormClosed() {
  isDialogVisible.value = false
  shiftFormRef.value?.handleResetForm( true )
}

// function clearLocalFilters() {
//   Object.assign( localFilters, initialFilters )
//   handleFilterChange()
// }

function handlePageChange( val ) {
  currentPage.value = val
  loadShifts()
}

function handleSizeChange( val ) {
  pageSize.value = val
  currentPage.value = 1
  loadShifts()
}

function handleSortChange( { prop, order } ) {
  sortSettings.value = { prop, order }
  loadShifts()
}

// const formatDateTime = dateString => {
//   return dateString ? convertToLocalTime( dateString ) : '-'
// }

async function loadShifts() {
  function snakeToCamel( str ) {
    return str.replace( /_([a-z])/g, ( _, char ) => char.toUpperCase() )
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel( sortSettings.value.prop )

    const response = await searchShifts(
      localFilters,
      currentPage.value,
      pageSize.value,
      sortKey,
      sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC'
    )
    const data = response.data
    shiftsTableData.value = data.content || []
    totalElements.value = data.totalElements
  } catch ( err ) {
    console.error( 'Failed to load shifts:', err )
    ElMessage.error( t( 'shift.message.fetchFailed' ) )
  } finally {
    loading.value = false
  }
}

async function handleDeactivate( id ) {
  try {
    await ElMessageBox.confirm( t( 'common.confirmMessage' ), t( 'common.warning' ), {
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      type : 'warning',
      distinguishCancelAndClose : true
    } )
    await deactivateShift( id )
    await loadShifts()
    ElMessage.success( t( 'shift.message.deactivateSuccess' ) )
  } catch ( err ) {
    if ( err === 'cancel' || err === 'close' ) return
    console.error( err )
    ElMessage.error( t( 'shift.message.deactivateFailed' ) )
  }
}

async function loadUsers() {
  try {
    const response = await getAllUsers( 1, 1000 )
    userOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
  }
}

async function refreshTable() {
  try {
    loading.value = true

    await loadUsers()
    await loadShifts()
  } catch ( e ) {
  } finally {
    loading.value = false
  }
}

onMounted( async() => {
  await loadUsers()
  await loadShifts()
} )
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  .filters-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-item {
    display: flex;
    align-items: center;
  }

  .actions-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 14px !important;
}

:deep(.el-scrollbar__thumb.is-horizontal) {
  height: 14px !important;
}
</style>
