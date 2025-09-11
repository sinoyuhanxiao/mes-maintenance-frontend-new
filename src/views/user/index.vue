<template>
  <MesLayout :title="t('router.userManagement')" :view-mode="'table'">
    <template #viewMode> </template>

    <template #head>
      <!-- User local filters -->
      <div class="toolbar">
        <div class="filters-container">
          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--              v-model="localFilters.assignedTeam"-->
          <!--              :placeholder="$t('user.assignedTeam')"-->
          <!--              clearable-->
          <!--              multiple-->
          <!--              size="default"-->
          <!--              style="width: 180px"-->
          <!--              @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />-->
          <!--            </el-select>-->
          <!--          </div>-->

          <div class="filter-item">
            <el-select
              v-model="localFilters.department_ids"
              :placeholder="$t('user.department')"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="default"
              style="width: 240px"
              @change="handleFilterChange"
            >
              <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <el-select
              v-model="localFilters.role_ids"
              :placeholder="$t('user.table.role')"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="default"
              style="width: 240px"
              @change="handleFilterChange"
            >
              <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">
              {{ t('workOrder.filters.clearAll') }}
            </el-button>
          </div>

          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--                v-model="localFilters.status_ids"-->
          <!--                :placeholder="$t('user.table.status')"-->
          <!--                clearable-->
          <!--                multiple-->
          <!--                collapse-tags-->
          <!--                collapse-tags-tooltip-->
          <!--                size="default"-->
          <!--                style="width: 240px"-->
          <!--                @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option :label="'Active'" :value="1" />-->
          <!--              <el-option :label="'Inactive'" :value="0" />-->
          <!--            </el-select>-->
          <!--          </div>-->
        </div>

        <div class="actions-row">
          <div class="actions-item">
            <el-input
              v-model="localFilters.keyword"
              :placeholder="t('user.searchByName')"
              clearable
              @input="handleFilterChange"
              style="width: 280px"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
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
      <!-- User table -->
      <div style="overflow-x: auto; max-width: 100%">
        <el-table
          v-loading="loading"
          :data="usersTableData"
          style="width: 100%"
          @sort-change="handleSortChange"
          :empty-text="t('common.noData')"
          :height="tableHeight"
          border
          fit
          highlight-current-row
        >
          <el-table-column
            :label="t('user.table.id')"
            width="80"
            prop="id"
            sortable="custom"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.profileImage')" width="130" prop="image" align="center" fixed="left">
            <template #default="scope">
              <!--              <WorkOrderImage :image-path="scope.row.image ? [scope.row.image] : null" />-->
              <el-image
                :src="scope.row.image"
                fit="cover"
                :preview-src-list="[scope.row.image]"
                class="circular-image"
                :z-index="2000"
                preview-teleported
              >
                <template #error>
                  <div class="image-slot-circle">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.firstName')"
            prop="first_name"
            width="150"
            sortable="custom"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <el-link @click="handleView(scope.row)">{{ scope.row.first_name }}</el-link>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.lastName')" prop="last_name" width="150" sortable="custom" align="center">
            <template #default="scope">
              <el-link @click="handleView(scope.row)">{{ scope.row.last_name }}</el-link>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.table.username')"
            prop="username"
            width="180"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.username ?? '-' }}</span>
            </template>
          </el-table-column>

          <!--          <el-table-column :label="t('user.table.teams')" prop="teams" width="200" align="center" sortable="custom">-->
          <!--            <template #default="scope">-->
          <!--              <div style="margin-right: 5px" v-if="scope.row.teams?.length > 0">-->
          <!--                <el-popover v-for="team in scope.row.teams" :key="team.id" trigger="hover" placement="top" width="250">-->
          <!--                  <template #default>-->
          <!--                    <div class="popover-text-wrapper">-->
          <!--                      <el-text>ID: {{ team.id }}</el-text>-->
          <!--                      <el-text>{{ t('user.table.teams') }}: {{ team.name }}</el-text>-->
          <!--                      <el-text>{{ t('user.table.leader') }}: {{ team.leader_name }}</el-text>-->
          <!--                      <el-text>{{ 'Number of members' }}: {{ team.members?.length || 0 }}</el-text>-->
          <!--                      <el-text>{{ 'Associated Equipment' }}: {{ 15 }}</el-text>-->
          <!--                      <el-text>{{ 'Associated Location' }}: {{ 'Site A' }}</el-text>-->
          <!--                    </div>-->
          <!--                  </template>-->

          <!--                  <template #reference>-->
          <!--                    <el-tag size="small" round :effect="scope.row.teams.isLeader ? 'dark' : 'light'">-->
          <!--                      {{ team.name }}-->
          <!--                    </el-tag>-->
          <!--                  </template>-->
          <!--                </el-popover>-->
          <!--              </div>-->

          <!--              <div v-else>-->
          <!--                <el-text>-</el-text>-->
          <!--              </div>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <el-table-column
            :label="t('user.department')"
            prop="department_id"
            width="150"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <el-text>
                {{ findDepartmentById(scope.row.department_id)?.name || '-' }}
              </el-text>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.role')" prop="roles" width="200" align="center" sortable="custom">
            <template #default="scope">
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px">
                <template v-for="role in scope.row.roles.slice(0, 3)" :key="role.id">
                  <RoleTag :role="role" />
                </template>

                <template v-if="scope.row.roles.length > 3">
                  <el-popover placement="top" trigger="hover" width="200">
                    <template #default>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px">
                        <RoleTag v-for="role in scope.row.roles.slice(3)" :key="role.id" :role="role" />
                      </div>
                    </template>

                    <template #reference>
                      <el-tag size="small" type="info"> +{{ scope.row.roles.length - 3 }} </el-tag>
                    </template>
                  </el-popover>
                </template>
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.status')" prop="enabled" width="130" sortable="custom" align="center">
            <template #header>
              <span>
                {{ t('user.table.status') }}
                <el-tooltip :content="t('user.table.statusTooltip')" placement="top">
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <template #default="scope">
              <el-switch
                v-model="scope.row.enabled"
                :active-value="true"
                :inactive-value="false"
                @change="handleActivationStatusChange(scope.row.id, scope.row.enabled)"
              />
            </template>
          </el-table-column>

          <!--          <el-table-column :label="t('user.lastVisited')" prop="last_visited" width="220" sortable="custom" align="center">-->
          <!--            <template #default="scope">-->
          <!--              <span>-->
          <!--                {{ formatDateTime(scope.row.last_visited) }}-->
          <!--              </span>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <el-table-column :label="t('user.table.certificate')" prop="certificate" width="120" align="center">
            <template #default="scope">
              <certificate-hover-detail :certificates="scope.row.certificates || []" />
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.email')" prop="email" width="220" sortable="custom" align="center">
            <template #default="scope">
              <span>{{ scope.row.email ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.table.phoneNumber')"
            prop="phone_number"
            width="180"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.phone_number ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.employeeNumber')"
            width="180"
            prop="employee_number"
            sortable="custom"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.employee_number }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.table.actions')"
            align="center"
            header-align="center"
            width="270"
            fixed="right"
          >
            <template #default="scope">
              <el-button :icon="View" size="small" @click="handleView(scope.row)">
                {{ t('common.view') }}
              </el-button>
              <el-button :icon="Edit" size="small" @click="handleEdit(scope.row)">
                {{ t('common.edit') }}
              </el-button>

              <el-button :icon="Delete" size="small" type="danger" @click="confirmDelete(scope.row)">
                {{ t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog
        :title="currentEditingUser ? t('user.form.editUser') : t('user.form.newUser')"
        v-model="isUserFormDialogVisible"
        top="10vh"
        width="50%"
      >
        <div v-loading="isFormProcessing">
          <UserForm
            :user="currentEditingUser"
            :role-options="roleOptions"
            :department-options="departmentOptions"
            @confirm="handleUserSubmit"
            @cancel="() => (isUserFormDialogVisible = false)"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>

      <el-dialog
        v-model="showSuccessDialog"
        width="480px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        align-center
      >
        <el-result
          icon="success"
          title="New User Created"
          sub-title="Below is the auto-generated username for the account"
        >
          <template #extra>
            <div style="display: flex; flex-direction: column; align-items: center">
              <el-text tag="b" size="large">{{ createdUsername }}</el-text>
              <el-button type="primary" style="margin-top: 12px" @click="closeSuccessDialog">
                Back to User List
              </el-button>
            </div>
          </template>
        </el-result>
      </el-dialog>
    </template>

    <!-- User table pagination -->
    <template #foot>
      <el-pagination
        @current-change="handleCurrentPageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-size="selectedPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="totalElements"
      >
        <!-- total -->
        <template #total>
          {{ t('pagination.total', { total: totalElements }) }}
        </template>

        <!-- page -->
        <template #sizes>
          <span>{{ t('pagination.perPage') }}</span>
          <el-select v-model="selectedPageSize" placeholder="Select">
            <el-option
              v-for="size in [10, 20, 50]"
              :key="size"
              :label="`${size} ${t('pagination.perPage')}`"
              :value="size"
            />
          </el-select>
        </template>
      </el-pagination>
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import MesLayout from 'src/components/MesLayout'
import { EditPen, Edit, View, Delete, QuestionFilled, Search, Picture, Remove } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { convertToLocalTime } from '@/utils/datetime'
import RoleTag from '@/views/user/components/RoleTag.vue'
// import AssociatedTeamSelect from '@/views/user/components/AssociatedTeamSelect.vue'
import CertificateHoverDetail from '@/views/user/components/CertificateHoverDetail.vue'
import { useRouter } from 'vue-router'
import { searchUsers, updateUserByAdmin, getAllDepartments, getAllRoles } from '@/api/user.js'

import UserForm from '@/views/user/components/UserForm.vue'

defineOptions( {
  name : 'UserManagement'
} )

const { t } = useI18n()
const router = useRouter()

// Table related
const usersTableData = ref( [] )
const sortSettings = ref( { prop : '', order : '' } )
const loading = ref( false )
const currentPage = ref( 1 )
const selectedPageSize = ref( 20 )
const totalPages = ref( 0 )
const totalElements = ref( 0 )
const tableHeight = ref( window.innerHeight - 250 )

// Form related
const isFormProcessing = ref( false )
const isUserFormDialogVisible = ref( false )
const currentEditingUser = ref( null ) // null = create mode
const showSuccessDialog = ref( false )
const createdUsername = ref( '' )

const initialFilters = {
  keyword : null,
  department_ids : [],
  role_ids : []
}

const localFilters = reactive( { ...initialFilters } )

const roleOptions = ref( [] )
const departmentOptions = ref( [] )

function openCreateForm() {
  currentEditingUser.value = null
  isUserFormDialogVisible.value = true
}

function handleUserSubmit( username ) {
  isUserFormDialogVisible.value = false

  if ( username ) {
    createdUsername.value = username
    showSuccessDialog.value = true
  } else {
    loadUsers()
  }
}

function closeSuccessDialog() {
  showSuccessDialog.value = false
  loadUsers()
}

function handleView( user ) {
  router.push( { name : 'UserDetail', params : { id : user.id }} )
}

function handleEdit( user ) {
  currentEditingUser.value = user
  isUserFormDialogVisible.value = true
}

async function confirmDelete( row ) {
  try {
    // TODO: Delete user api in backend not ready
    await ElMessageBox.confirm(
      t( 'common.deleteConfirmMessage', { name : row.first_name + ' ' + row.last_name } ),
      t( 'common.warning' ), // title
      {
        type : 'warning',
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        distinguishCancelAndClose : true
      }
    )
    ElMessage.warning( 'Delete user is not implemented yet' )
    // await handleDelete( row.id )
    // ElMessage.success( t( 'common.confirmDeleteSuccess' ) )
  } catch {
    // user canceled/closed — do nothing
  }
}

function handleCurrentPageChange( val ) {
  currentPage.value = val
  loadUsers()
}

function handleSizeChange( val ) {
  selectedPageSize.value = val
  currentPage.value = 1
  loadUsers()
}

async function handleActivationStatusChange( userId, newStatus ) {
  try {
    const payload = {
      enabled : newStatus
    }
    await updateUserByAdmin( userId, payload )
    ElMessage.success( t( 'user.message.statusUpdatedSuccess' ) )
    await loadUsers()
  } catch ( err ) {
    console.error( 'Status update error:', err )
    ElMessage.error( t( 'user.message.statusUpdatedFailed' ) )
  }
}

async function loadUsers() {
  function snakeToCamel( str ) {
    return str.replace( /_([a-z])/g, ( _, char ) => char.toUpperCase() )
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel( sortSettings.value.prop )

    const response = await searchUsers(
      localFilters,
      currentPage.value,
      selectedPageSize.value,
      sortKey,
      sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC'
    )
    const dataObj = response.data
    usersTableData.value = dataObj.content || []
    totalPages.value = dataObj.totalPages
    totalElements.value = dataObj.totalElements
  } catch ( err ) {
    console.error( 'Failed to fetch users:', err )
    ElMessage.error( t( 'user.message.userFetchFailed' ) )
  } finally {
    loading.value = false
  }
}

function findDepartmentById( id ) {
  return departmentOptions.value.find( dep => dep.id === id ) || null
}

async function handleFilterChange() {
  try {
    // TODO assigned teams is not support in api for now
    delete localFilters.assignedTeam
    currentPage.value = 1

    await loadUsers()
  } catch ( err ) {
    ElMessage.error( t( 'user.message.userFetchFailed' ) )
  }
}

function clearLocalFilters() {
  Object.assign( localFilters, initialFilters )
  handleFilterChange()
}

// Sorting
function handleSortChange( { prop, order } ) {
  sortSettings.value = { prop, order }
  loadUsers()
}

const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 320
}

onMounted( async() => {
  const roles = await getAllRoles()
  const departments = await getAllDepartments()
  roleOptions.value = roles
  departmentOptions.value = departments

  await loadUsers()
} )

onMounted( () => {
  window.addEventListener( 'resize', updateTableHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateTableHeight )
} )
</script>

<style scoped lang="scss">
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

.popover-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

::v-deep(.popover-text-wrapper .el-text) {
}

.circular-image {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
  cursor: pointer;
}
</style>
