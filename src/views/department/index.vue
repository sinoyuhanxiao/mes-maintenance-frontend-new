<template>
  <MesLayout :title="t('department.departmentManagement')" :view-mode="'table'">
    <template #head>
      <div class="toolbar">
        <div class="filters-container">
          <div class="filter-item">
            <el-select
              v-model="localFilters.manager_ids"
              :placeholder="'Filter By Manager'"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              filterable
              size="default"
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.first_name + ' ' + user.last_name"
                :value="user.id"
              />
            </el-select>
          </div>

          <div class="filter-item">
            <LocationTreeSelect v-model="localFilters.location_ids" :multiple="true" />
          </div>

          <div class="filter-item">
            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">
              {{ t('workOrder.filters.clearAll') }}
            </el-button>
          </div>
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
        </div>
      </div>
    </template>

    <template #body>
      <el-table
        v-loading="loading"
        :data="departmentsTableData"
        border
        fit
        highlight-current-row
        :height="tableHeight"
        :empty-text="t('common.noData')"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" :label="'ID'" width="80" sortable="custom" align="center" fixed="left" />
        <el-table-column prop="name" :label="t('common.name')" width="250" sortable="custom" align="center">
          <template #default="scope">
            <el-text tag="b">{{ scope.row.name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="code" :label="t('common.code')" width="100" sortable="custom" align="center" />

        <!-- Show Member count, hover on all user tags -->
        <el-table-column prop="members" :label="'Assigned Members'" width="200" align="center">
          <template #default="scope">
            <template v-if="scope.row.members && scope.row.members.length">
              <TagPopover
                :items="scope.row.members.filter(m => m.status === 1)"
                singular-label="member"
                plural-label="members"
                :search-key="user => (userMap[user.id]?.first_name || '') + ' ' + (userMap[user.id]?.last_name || '')"
                :item-key="m => m.id"
              >
                <template #default="{ item }">
                  <UserTag :user="userMap[item.id]" />
                </template>
              </TagPopover>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="Associated Roles" prop="role_list" width="200" align="center">
          <template #default="scope">
            <template v-if="scope.row.role_list && scope.row.role_list.length">
              <TagPopover :items="scope.row.role_list" singular-label="role" plural-label="roles" search-key="name">
                <template #default="{ item }">
                  <RoleTag :role="item" />
                </template>
              </TagPopover>

              <!--              <el-popover trigger="click" placement="top" width="300">-->
              <!--                <template #reference>-->
              <!--                  <el-button :type="'info'" plain :size="'small'">-->
              <!--                    {{ scope.row.role_list.length }}-->
              <!--                    {{ scope.row.role_list.length === 1 ? 'role' : 'roles' }}-->
              <!--                  </el-button>-->
              <!--                </template>-->

              <!--                <div style="display: flex; flex-wrap: wrap; gap: 6px">-->
              <!--                  <RoleTag v-for="role in scope.row.role_list" :key="role.id" :role="role" />-->
              <!--                </div>-->
              <!--              </el-popover>-->
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="location_id" :label="t('team.assignedLocation')" align="center" width="200">
          <template #default="scope">
            <div class="tag-list">
              <LocationTag :location="locationMap[String(scope.row.location_id)] || null" />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="manager_id" label="Manager" align="center" width="200">
          <template #default="scope">
            <div class="tag-list">
              <UserTag :user="userMap[scope.row.manager_id]" />
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="description"
          :label="t('common.description')"
          width="300"
          sortable="custom"
          align="center"
        />

        <el-table-column :label="t('common.actions')" fixed="right" align="center" width="220">
          <template #default="scope">
            <el-button :icon="Edit" type="primary" size="small" @click="handleEdit(scope.row)">{{
              t('common.edit')
            }}</el-button>
            <el-button :icon="Delete" type="danger" size="small" @click="handleDeactivate(scope.row.id)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="currentEditingDepartment ? t('department.editDepartment') : t('department.newDepartment')"
        v-model="isDialogVisible"
        top="10vh"
        width="50%"
      >
        <div v-loading="isFormProcessing">
          <DepartmentForm
            :department="currentEditingDepartment"
            :user-options="userOptions"
            @confirm="handleDepartmentSubmitted"
            @cancel="() => (isDialogVisible = false)"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MesLayout from '@/components/MesLayout'
import { Delete, Edit, EditPen, Remove, Search } from '@element-plus/icons-vue'
import { searchDepartments, deactivateDepartment } from '@/api/department.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import DepartmentForm from './components/DepartmentForm.vue'
import { searchLocations } from '@/api/location'
import LocationTag from '@/views/team/components/LocationTag.vue'
import { searchUsers } from '@/api/user'
import UserTag from '@/views/user/components/UserTag.vue'
import RoleTag from '@/views/user/components/RoleTag.vue'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import TagPopover from '@/views/team/components/TagPopover.vue'

const { t } = useI18n()
const loading = ref( false )
const isFormProcessing = ref( false )
const isDialogVisible = ref( false )
const departmentsTableData = ref( [] )
const sortSettings = ref( { prop : 'id', order : 'descending' } )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const totalElements = ref( 0 )
const tableHeight = ref( window.innerHeight - 250 )
const currentEditingDepartment = ref( null )
const locationMap = ref( {} )
const userOptions = ref( [] )
const initialFilters = {
  keyword : '',
  manager_ids : [],
  location_ids : []
}
const localFilters = reactive( { ...initialFilters } )
const userMap = computed( () => {
  return Object.fromEntries( userOptions.value.map( user => [user.id, user] ) )
} )

function openCreateForm() {
  currentEditingDepartment.value = null
  isDialogVisible.value = true
}

function handleEdit( department ) {
  currentEditingDepartment.value = department
  isDialogVisible.value = true
}

function handleDepartmentSubmitted() {
  isDialogVisible.value = false
  loadDepartments()
}

function handleFilterChange() {
  currentPage.value = 1
  loadDepartments()
}

function clearLocalFilters() {
  Object.assign( localFilters, initialFilters )
  handleFilterChange()
}

function handlePageChange( val ) {
  currentPage.value = val
  loadDepartments()
}

function handleSizeChange( val ) {
  pageSize.value = val
  currentPage.value = 1
  loadDepartments()
}

function handleSortChange( { prop, order } ) {
  sortSettings.value = { prop, order }
  loadDepartments()
}

async function loadLocations() {
  // Fetch fixed number of locations assuming all location count are less than 1000.
  try {
    const response = await searchLocations( { status_ids : [1] }, 1, 1000 )
    const locations = response?.data?.content || []

    locationMap.value = Object.fromEntries( locations.map( location => [String( location.id ), location] ) )
  } catch ( err ) {
    ElMessage.error( 'Error loading location data' )
  }
}

async function loadDepartments() {
  loading.value = true
  try {
    const response = await searchDepartments(
      localFilters,
      currentPage.value,
      pageSize.value,
      sortSettings.value.prop || 'id',
      sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC'
    )
    const data = response.data
    departmentsTableData.value = data.content || []
    totalElements.value = data.totalElements
  } catch ( err ) {
    console.error( 'Failed to load departments:', err )
    ElMessage.error( t( 'department.message.fetchFailed' ) )
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
    await deactivateDepartment( id )
    await loadDepartments()
    ElMessage.success( t( 'department.message.deactivateSuccess' ) )
  } catch ( err ) {
    if ( err === 'cancel' || err === 'close' ) return
    console.error( err )
    ElMessage.error( t( 'department.message.deactivateFailed' ) )
  }
}

async function loadUsers() {
  try {
    const response = await searchUsers( {}, 1, 1000 ) // adjust page/size if needed
    userOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
  }
}

watch(
  () => [localFilters.location_ids],
  () => {
    handleFilterChange()
  },
  { deep : true }
)

onMounted( async() => {
  await loadLocations()
  await loadUsers()
  await loadDepartments()
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
</style>
