<template>
  <MesLayout :title="t('user.userManagement')" :view-mode="'table'">
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

          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--              v-model="localFilters.department_ids"-->
          <!--              :placeholder="$t('common.filterByDepartmentPlaceholder')"-->
          <!--              clearable-->
          <!--              multiple-->
          <!--              collapse-tags-->
          <!--              collapse-tags-tooltip-->
          <!--              size="default"-->
          <!--              style="width: 240px"-->
          <!--              @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />-->
          <!--            </el-select>-->
          <!--          </div>-->

          <div class="filter-item">
            <el-select
              v-model="localFilters.role_ids"
              :placeholder="$t('common.filterByRolePlaceholder')"
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
              :placeholder="'Search by name or username'"
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

          <div class="actions-item">
            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">
              {{ 'Clear Filters' }}
            </el-button>
          </div>

          <div class="actions-item">
            <el-button :icon="RefreshIcon" @click="refreshTable">
              {{ 'Refresh' }}
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
          fit
          highlight-current-row
          border
        >
          <el-table-column
            :label="'Full Name'"
            prop="full_name"
            width="200"
            sortable="custom"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <el-link @click="handleView(scope.row)">
                {{ scope.row.first_name + ' ' + scope.row.last_name }}
              </el-link>
            </template>
          </el-table-column>

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

          <el-table-column prop="image" label="Profile Picture" min-width="150px" align="center">
            <template #default="scope">
              <div class="profile-picture-cell">
                <!-- image URL missing -->
                <template v-if="!scope.row.image">
                  <el-text>
                    {{ '-' }}
                  </el-text>
                </template>

                <el-image
                  v-else
                  :src="scope.row.image"
                  fit="cover"
                  class="image-slot-circle"
                  :preview-src-list="[scope.row.image]"
                  preview-teleported
                >
                  <template #error>
                    <el-text>
                      {{ '-' }}
                    </el-text>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.table.username')"
            prop="username"
            width="220"
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

          <!--          <el-table-column :label="t('user.department')" prop="department_list" width="150" align="center">-->
          <!--            <template #default="scope">-->
          <!--              <template v-if="scope.row.department_ids && scope.row.department_ids.length">-->
          <!--                <TagPopover-->
          <!--                  :items="scope.row.department_ids"-->
          <!--                  singular-label="department"-->
          <!--                  plural-label="departments"-->
          <!--                  :search-key="id => departmentMap[id]?.name || id"-->
          <!--                  :item-key="id => id"-->
          <!--                >-->
          <!--                  <template #default="{ item }">-->
          <!--                    <DepartmentTag :departmentId="item" />-->
          <!--                  </template>-->
          <!--                </TagPopover>-->
          <!--              </template>-->
          <!--              <template v-else>-->
          <!--                <span>-</span>-->
          <!--              </template>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <el-table-column :label="t('user.table.role')" prop="role_list" width="200" align="center">
            <template #default="scope">
              <template v-if="scope.row.role_list && scope.row.role_list.length > 0">
                <RoleTag :role="scope.row.role_list[0]" />
              </template>
              <template v-else>
                <span>-</span>
              </template>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.certificate')" prop="certificate" width="150" align="center">
            <template #default="scope">
              <certificate-hover-detail :certificates="scope.row.certificate_list || []" />
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.status')" prop="enabled" width="150" sortable="custom" align="center">
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
              <span>{{ scope.row.employee_number ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column sortable prop="created_at" label="Created At" min-width="180" align="center">
            <template #default="scope">
              <el-text>
                {{ formatAsLocalDateTimeString(scope.row.created_at) }}
              </el-text>
            </template>
          </el-table-column>

          <el-table-column sortable prop="updated_at" label="Updated At" min-width="180" align="center">
            <template #default="scope">
              <el-text>
                {{ formatAsLocalDateTimeString(scope.row.updated_at) }}
              </el-text>
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
              <el-button :icon="View" type="success" size="small" @click="handleView(scope.row)">
                {{ t('common.view') }}
              </el-button>
              <el-button :icon="Edit" type="info" size="small" @click="handleEdit(scope.row)">
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
        @close="handleFormClosed"
      >
        <div v-loading="isFormProcessing">
          <UserForm
            ref="userFormRef"
            :user="currentEditingUser"
            :role-options="roleOptions"
            @confirm="handleUserSubmit"
            @cancel="handleFormClosed"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>

      <el-dialog
        v-model="showSuccessDialog"
        width="480px"
        :show-close="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        align-center
        @close="closeSuccessDialog"
      >
        <el-result icon="success" title="New User Created" sub-title="Below is the username for the account">
          <template #extra>
            <div style="display: flex; flex-direction: column; align-items: center">
              <el-text tag="b" size="large">{{ createdUsername }}</el-text>
              <el-button type="primary" style="margin-top: 12px" @click="closeSuccessDialog"> Confirm </el-button>
            </div>
          </template>
        </el-result>
      </el-dialog>
    </template>

    <!-- User table pagination -->
    <template #foot>
      <div style="display: flex; flex-direction: row; justify-content: center">
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
      </div>
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import MesLayout from 'src/components/MesLayout'
import {
  EditPen,
  Edit,
  View,
  Delete,
  QuestionFilled,
  Search,
  Refresh as RefreshIcon,
  Remove,
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { convertToLocalTime } from '@/utils/datetime'
import RoleTag from '@/views/user/components/RoleTag.vue'
// import AssociatedTeamSelect from '@/views/user/components/AssociatedTeamSelect.vue'
import CertificateHoverDetail from '@/views/user/components/CertificateHoverDetail.vue'
import { useRouter } from 'vue-router'
import { deleteUserById, getUserById, searchUsers } from '@/api/user.js'
import UserForm from '@/views/user/components/UserForm.vue'
import { disableUsers, enableUsers, searchRoles } from '@/api/rbac'
// import { searchDepartments } from '@/api/department'
// import DepartmentTag from '@/views/department/components/DepartmentTag.vue'
// import TagPopover from '@/views/team/components/TagPopover.vue'
import { useUserStore } from '@/store'
import { emitter } from '@/utils/mitt'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

defineOptions({
  name: 'UserManagement',
})

const { t } = useI18n()
const router = useRouter()

// Table related
const usersTableData = ref([])
const sortSettings = ref({ prop: 'created_at', order: 'descending' })
const loading = ref(false)
const currentPage = ref(1)
const selectedPageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const tableHeight = ref(window.innerHeight - 250)

// Form related
const isFormProcessing = ref(false)
const userFormRef = ref()
const isUserFormDialogVisible = ref(false)
const currentEditingUser = ref(null) // null = create mode
const showSuccessDialog = ref(false)
const createdUsername = ref('')

const initialFilters = {
  keyword: null,
  // department_ids : [],
  role_ids: [],
}

const localFilters = reactive({ ...initialFilters })

const roleOptions = ref([])
// const departmentOptions = ref( [] )

// const departmentMap = computed( () => Object.fromEntries( departmentOptions.value.map( d => [d.id, d] ) ) )

async function openCreateForm() {
  currentEditingUser.value = null
  isUserFormDialogVisible.value = true
}

async function handleUserSubmit(username) {
  isUserFormDialogVisible.value = false

  if (username) {
    createdUsername.value = username
    showSuccessDialog.value = true
  } else {
    await loadUsers()
  }
}

function closeSuccessDialog() {
  showSuccessDialog.value = false
  loadUsers()
}

function handleView(user) {
  router.push({ name: 'UserDetail', params: { id: user.id } })
}

function handleEdit(user) {
  currentEditingUser.value = { ...user }
  isUserFormDialogVisible.value = true
}

async function confirmDelete(row) {
  try {
    // TODO: Delete user api in backend not ready
    await ElMessageBox.confirm(
      t('common.deleteConfirmMessage', { name: row.first_name + ' ' + row.last_name }),
      t('common.warning'), // title
      {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        distinguishCancelAndClose: true,
      }
    )
    await deleteUserById(row.id)
    ElMessage.success(t('user.message.userDeletedSuccess'))
    await loadUsers()
  } catch {
    // user canceled/closed — do nothing
  }
}

function handleCurrentPageChange(val) {
  currentPage.value = val
  loadUsers()
}

function handleFormClosed() {
  isUserFormDialogVisible.value = false
  userFormRef.value?.handleResetForm(true)
}

function handleSizeChange(val) {
  selectedPageSize.value = val
  currentPage.value = 1
  loadUsers()
}

async function handleActivationStatusChange(userId, newStatus) {
  const userStore = useUserStore()

  try {
    // Case: current user trying to deactivate self
    if (userId === userStore.uid && newStatus === false) {
      try {
        await ElMessageBox.confirm(t('user.message.selfDeactivateConfirm'), t('common.warning'), {
          type: 'warning',
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          distinguishCancelAndClose: true,
        })
      } catch {
        // User cancelled → revert switch state
        const target = usersTableData.value.find(u => u.id === userId)
        if (target) target.enabled = true
        return
      }
    }

    if (newStatus) {
      await enableUsers([userId])
    } else {
      await disableUsers([userId])
    }

    ElMessage.success(t('user.message.statusUpdatedSuccess'))
    await loadUsers()
  } catch (err) {
    console.error('Status update error:', err)
    ElMessage.error(t('user.message.statusUpdatedFailed'))
  }
}

async function loadUsers() {
  function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel(sortSettings.value.prop)

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
  } catch (err) {
    console.error('Failed to fetch users:', err)
    ElMessage.error(t('user.message.userFetchFailed'))
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const response = await searchRoles({}, 1, 1000)
    roleOptions.value = response.data.content
  } catch (e) {
    ElMessage.error(e)
  }
}

// async function loadDepartments() {
//   try {
//     const response = await searchDepartments( {}, 1, 1000 )
//     departmentOptions.value = response.data.content
//   } catch ( e ) {
//     ElMessage.error( e )
//   }
// }

async function handleFilterChange() {
  try {
    // TODO assigned teams is not support in api for now
    // delete localFilters.assignedTeam
    currentPage.value = 1

    await loadUsers()
  } catch (err) {
    ElMessage.error(t('user.message.userFetchFailed'))
  }
}

function clearLocalFilters() {
  Object.assign(localFilters, initialFilters)
  handleFilterChange()
}

// Sorting
function handleSortChange({ prop, order }) {
  sortSettings.value = { prop, order }
  loadUsers()
}

const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 320
}

async function refreshTable() {
  try {
    loading.value = true
    await loadRoles()
    // await loadDepartments()
    await loadUsers()
  } catch (e) {
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  emitter.off('user:updated')
})

onMounted(async () => {
  await loadRoles()
  // await loadDepartments()
  await loadUsers()

  emitter.on('user:updated', async updatedUserId => {
    // Attempt to update that user's data if exist in table
    const idx = usersTableData.value.findIndex(u => u.id === updatedUserId)
    if (idx !== -1) {
      // Refresh only that user row
      try {
        const res = await getUserById(updatedUserId)
        usersTableData.value[idx] = res.data
      } catch (err) {
        console.error('Failed to refresh user row:', err)
      }
    }
  })
})

onMounted(() => {
  window.addEventListener('resize', updateTableHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateTableHeight)
})
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

.profile-picture-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

//.image-slot-circle {
//  width: 50px;
//  height: 50px;
//  border-radius: 50%;
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  background-color: var(--el-fill-color-light);
//  color: var(--el-text-color-secondary);
//}

.image-slot-circle {
  display: flex;
  justify-content: center;
  border-radius: 50%;
  align-items: center;
  width: 50px;
  height: 50px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 14px !important;
}

:deep(.el-scrollbar__thumb.is-horizontal) {
  height: 14px !important;
}
</style>
