<template>
  <MesLayout :title="t('router.userManagement')" :view-mode="'table'">
    <template #viewMode> </template>

    <template #head>
      <!-- User local filters -->
      <div class="toolbar">
        <div class="filters-container">
          <div class="filter-item">
            <el-select
              v-model="localFilters.assignedTeam"
              :placeholder="$t('user.assignedTeam')"
              clearable
              size="default"
              style="width: 180px"
              @change="handleFilterChange"
            >
              <el-option v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <el-select
              v-model="localFilters.department_id"
              :placeholder="$t('user.department')"
              clearable
              size="default"
              style="width: 180px"
              @change="handleFilterChange"
            >
              <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <el-select
              v-model="localFilters.role_id"
              :placeholder="$t('user.table.role')"
              clearable
              size="default"
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <el-select
              v-model="localFilters.status"
              :placeholder="$t('user.table.status')"
              clearable
              size="default"
              style="width: 140px"
              @change="handleFilterChange"
            >
              <el-option :label="'Active'" :value="1" />
              <el-option :label="'Inactive'" :value="0" />
            </el-select>
          </div>
        </div>

        <div class="actions-row">
          <div class="actions-item">
            <el-input
              v-model="searchInput"
              :placeholder="t('common.searchByKeyword')"
              clearable
              @input="searchUsers"
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
          :data="paginatedUsers"
          style="width: 100%"
          @sort-change="val => (sortSettings = val)"
          :empty-text="t('common.noData')"
          :height="tableHeight"
          border
          fit
          highlight-current-row
        >
          <el-table-column :label="t('user.table.id')" width="100" prop="id" sortable align="center" fixed="left">
            <template #default="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.name')" prop="name" width="150" sortable align="center" fixed="left">
            <template #default="scope">
              <el-link @click="handleView(scope.row)">{{ scope.row.name }}</el-link>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.teams')" prop="teams" width="200" align="center" sortable>
            <template #default="scope">
              <div style="margin-right: 5px">
                <el-popover v-for="team in scope.row.teams" :key="team.id" trigger="hover" placement="top" width="250">
                  <template #default>
                    <div class="popover-text-wrapper">
                      <el-text>ID: {{ team.id }}</el-text>
                      <el-text>{{ t('user.table.teams') }}: {{ team.name }}</el-text>
                      <el-text>{{ t('user.table.leader') }}: {{ team.leader_name }}</el-text>
                      <el-text>{{ 'Number of members' }}: {{ team.members?.length || 0 }}</el-text>
                      <el-text>{{ 'Associated Equipment' }}: {{ 15 }}</el-text>
                      <el-text>{{ 'Associated Location' }}: {{ 'Site A' }}</el-text>
                    </div>
                  </template>

                  <template #reference>
                    <el-tag size="small" round :effect="scope.row.teams.isLeader ? 'dark' : 'light'">
                      {{ team.name }}
                    </el-tag>
                  </template>
                </el-popover>
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.department')" prop="department" width="150" sortable align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.department?.name || '-' }}
              </el-text>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.role')" prop="role.name" width="180" sortable align="center">
            <template #default="scope">
              <div v-for="role in scope.row.roles" :key="role.id">
                <RoleTag :role="role" />
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.status')" prop="activation_status" width="140" sortable align="center">
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
                v-model="scope.row.activation_status"
                :active-value="1"
                :inactive-value="0"
                @change="handleActivationStatusChange(scope.row.id, scope.row.activation_status)"
              />
            </template>
          </el-table-column>

          <el-table-column :label="t('user.lastVisited')" prop="last_visited" width="220" sortable align="center">
            <template #default="scope">
              <span>
                {{ formatDateTime(scope.row.last_visited) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.certificate')" prop="certificate" width="150" sortable align="center">
            <template #default="scope">
              <certificate-hover-detail :certificates="scope.row.certificates || []" />
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.username')" prop="username" width="180" sortable align="center">
            <template #default="scope">
              <span>{{ scope.row.username ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.email')" prop="email" width="220" sortable align="center">
            <template #default="scope">
              <span>{{ scope.row.email ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.phoneNumber')" prop="phone_number" width="180" sortable align="center">
            <template #default="scope">
              <span>{{ scope.row.phone_number ?? '-' }}</span>
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

      <!-- User create/edit popup -->
      <el-dialog
        :title="userEntry.id == null ? t('user.form.newUser') : t('user.form.editUser')"
        v-model="isUserFormDialogVisible"
        width="50%"
      >
        <el-form
          ref="userEntryFormRef"
          :model="userEntry"
          :rules="userFormValidationRules"
          label-width="140"
          class="two-col-form"
        >
          <div class="form-row">
            <el-form-item :label="t('user.form.name')" prop="name">
              <el-input v-model="userEntry.name" />
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item :label="t('user.department')" prop="department_id">
              <el-select v-model="userEntry.department_id" :placeholder="t('user.form.selectDepartmentPlaceHolder')">
                <el-option
                  v-for="department in departmentOptions"
                  :key="department.id"
                  :label="department.name"
                  :value="department.id"
                >
                  <el-tag :type="department.el_tag_type">{{ department.name }}</el-tag>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item :label="t('user.form.role')" prop="role_list">
              <el-select
                v-model="userEntry.role_list"
                multiple
                :placeholder="t('user.form.selectRolePlaceHolder')"
                :disabled="!userEntry.department_id"
              >
                <el-option v-for="role in filteredRoleOptions" :key="role.id" :label="role.name" :value="role.id">
                  <el-tag :type="role.el_tag_type">{{ role.name }}</el-tag>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item :label="t('user.form.email')" prop="email">
              <el-input v-model="userEntry.email" />
            </el-form-item>

            <el-form-item :label="t('user.form.phoneNumber')" prop="phone_number">
              <el-input v-model="userEntry.phone_number" />
            </el-form-item>
          </div>

          <el-divider>
            {{ t('team.team') }}
          </el-divider>

          <el-form-item :label="t('user.assignedTeam')" prop="teams">
            <associated-team-select v-model="userEntry.teams" />
          </el-form-item>

          <el-divider>
            {{ t('user.certificate') }}
          </el-divider>

          <el-form-item :label="t('user.certificate')" prop="certificates">
            <certificate-list
              :certificates="userEntry.certificates"
              @edit="handleEditCert"
              @delete="handleDeleteCert"
              @add="handleAddCert"
            />
          </el-form-item>

          <el-divider>
            {{ t('user.loginCredential') }}
          </el-divider>

          <div class="form-row">
            <el-form-item :label="t('user.form.username')" prop="username">
              <el-input v-model="userEntry.username" />
            </el-form-item>

            <el-form-item :label="t('user.form.status')" prop="activation_status">
              <el-select v-model="userEntry.activation_status" :placeholder="t('user.form.status')">
                <el-option :label="t('user.status.active')" :value="1" />
                <el-option :label="t('user.status.inactive')" :value="0" />
              </el-select>
            </el-form-item>
          </div>

          <!-- Show only for new user -->
          <template v-if="userEntry.id == null">
            <div class="form-row">
              <el-form-item :label="t('user.form.newPassword')" prop="newPassword">
                <el-input v-model="newPassword" type="password" show-password />
              </el-form-item>

              <el-form-item :label="t('user.form.confirmPassword')" prop="confirmPassword">
                <el-input v-model="confirmPassword" type="password" show-password />
              </el-form-item>
            </div>
          </template>

          <!-- Show only for editing existing user -->
          <template v-else>
            <div class="form-row">
              <el-form-item>
                <el-checkbox v-model="changePassword">
                  {{ t('user.form.changePassword') }}
                </el-checkbox>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item v-if="changePassword" :label="t('user.form.newPassword')" prop="newPassword">
                <el-input v-model="newPassword" type="password" show-password />
              </el-form-item>

              <el-form-item v-if="changePassword" :label="t('user.form.confirmPassword')" prop="confirmPassword">
                <el-input v-model="confirmPassword" type="password" show-password />
              </el-form-item>
            </div>
          </template>
        </el-form>

        <template #footer>
          <div>
            <el-button @click="isUserFormDialogVisible = false">{{ t('user.form.cancelButton') }}</el-button>
            <el-button type="primary" @click="handleConfirmSubmit">{{ t('user.form.confirmButton') }}</el-button>
          </div>
        </template>

        <!-- Certificate Form Dialog -->
        <certificate-form-dialog
          :visible="showCertForm"
          :certificate="editingCert"
          @save="handleCertFormSave"
          @close="showCertForm = false"
        />
      </el-dialog>
    </template>

    <!-- User table pagination -->
    <template #foot>
      <el-pagination
        v-if="shouldShowPagination"
        @current-change="handleCurrentPageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="filteredUsers?.length || 0"
      >
        <!-- total -->
        <template #total>
          {{ t('pagination.total', { total: filteredUsers.value?.length || 0 }) }}
        </template>

        <!-- page -->
        <template #sizes>
          <span>{{ t('pagination.perPage') }}</span>
          <el-select v-model="pageSize" placeholder="Select">
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import MesLayout from 'src/components/MesLayout'
import { EditPen, Edit, View, Delete, QuestionFilled, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as userService from '@/views/user/components/userService.js'
import { convertToLocalTime } from '@/utils/datetime'
import RoleTag from '@/views/user/components/RoleTag.vue'
import AssociatedTeamSelect from '@/views/user/components/AssociatedTeamSelect.vue'
import CertificateHoverDetail from '@/views/user/components/CertificateHoverDetail.vue'
import CertificateFormDialog from '@/views/user/components/CertificateFormDialog.vue'
import CertificateList from '@/views/user/components/CertificateList.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const isUserFormDialogVisible = ref( false )
const searchInput = ref( '' )
const users = userService.useUserList()
const filteredUsers = ref( [] )
const roleOptions = ref( [] )
const departmentOptions = ref( [] )
const sortSettings = ref( { prop : '', order : '' } )
const loading = ref( false )
const changePassword = ref( false )
const newPassword = ref( '' )
const confirmPassword = ref( '' )
const tableHeight = ref( window.innerHeight - 250 )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const paginatedUsers = computed( () => {
  const sortedData = [...filteredUsers.value].sort( ( a, b ) => {
    if ( !sortSettings.value.prop || !sortSettings.value.order ) return 0
    const getValue = ( obj, path ) => path.split( '.' ).reduce( ( acc, key ) => acc?.[key], obj )
    const valueA = getValue( a, sortSettings.value.prop )
    const valueB = getValue( b, sortSettings.value.prop )
    if ( sortSettings.value.order === 'ascending' ) return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
    if ( sortSettings.value.order === 'descending' ) return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
    return 0
  } )
  const start = ( currentPage.value - 1 ) * pageSize.value
  const end = start + pageSize.value
  return sortedData.slice( start, end )
} )

const teamOptions = ref( [] )
const shouldShowPagination = computed( () => filteredUsers.value.length > 10 && Array.isArray( filteredUsers.value ) )
const filteredRoleOptions = computed( () => {
  const depId = userEntry.department_id
  if ( !depId ) return []

  return roleOptions.value.filter( r => {
    return r.department_id === depId
  } )
} )

const userEntryFormRef = ref()
const userEntry = reactive( {
  id : null,
  name : null,
  department_id : null,
  role_list : [],
  username : '',
  email : '',
  phone_number : '',
  activation_status : 1,
  password : '',
  teams : [],
  certificates : []
} )

const userFormValidationRules = ref( {
  name : [{ required : true, message : t( 'user.validation.nameRequired' ), trigger : 'blur' }],
  department_id : [{ required : true, message : t( 'user.validation.departmentRequired' ), trigger : 'change' }],
  role_list : [{ required : true, message : t( 'user.validation.roleRequired' ), trigger : 'change' }],
  activation_status : [{ required : true, message : t( 'user.validation.statusRequired' ), trigger : 'change' }],
  username : [
    { required : true, message : t( 'user.validation.usernameRequired' ), trigger : 'blur' },
    { min : 4, message : t( 'user.validation.usernameMinLength' ), trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        if ( !value ) return callback()
        const existingNames = users.value
          .filter( user => user.id !== userEntry.id )
          .map( user => user.username.toLowerCase() )
        if ( existingNames.includes( value.toLowerCase() ) ) return callback( new Error( t( 'user.validation.usernameExists' ) ) )
        callback()
      },
      trigger : 'blur'
    }
  ],
  password : [
    { required : true, message : t( 'user.validation.passwordRequired' ), trigger : 'blur' },
    { min : 4, message : t( 'user.validation.passwordMinLength' ), trigger : 'blur' }
  ],
  phone_number : [
    { required : true, message : t( 'user.validation.phoneNumberRequired' ), trigger : 'blur' },
    { pattern : /^\+?[1-9]\d{1,14}$/, message : t( 'user.validation.phoneNumberFormat' ), trigger : 'blur' }
  ]
} )

const formatDateTime = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
}

// TODO: Delegate to backend user api later
function searchUsers() {
  const searchText = searchInput.value.toLowerCase()
  filteredUsers.value = users.value.filter( item => {
    return (
      String( item.id ).includes( searchText ) ||
      item.name?.toLowerCase().includes( searchText ) ||
      item.username?.toLowerCase().includes( searchText ) ||
      item.email?.toLowerCase().includes( searchText ) ||
      String( item.phone_number ).toLowerCase().includes( searchText ) ||
      roleOptions.value
        .find( role => role.id === item.role_id )
        ?.name.toLowerCase()
        .includes( searchText ) ||
      ( item.activation_status !== undefined &&
        ( item.activation_status === 1 ? '已激活' : '未激活' ).includes( searchText ) ) ||
      item.teams?.some( team => team.team_name?.toLowerCase().includes( searchText ) )
    )
  } )
  currentPage.value = 1
}

function resetUserEntry() {
  Object.assign( userEntry, {
    id : null,
    department_id : null,
    role_list : [],
    name : '',
    username : '',
    email : '',
    phone_number : '',
    activation_status : 1,
    password : '',
    associated_teams : [],
    certificates : []
  } )
  newPassword.value = ''
  confirmPassword.value = ''
  changePassword.value = false
}

function openCreateForm() {
  if ( userEntryFormRef.value ) {
    userEntryFormRef.value.resetFields()
  }

  resetUserEntry()
  isUserFormDialogVisible.value = true
}

const router = useRouter()

function handleView( user ) {
  router.push( { name : 'UserDetail', params : { id : user.id }} )
}

function handleEdit( user ) {
  resetUserEntry()

  if ( userEntryFormRef.value ) {
    userEntryFormRef.value.resetFields()
  }

  Object.assign( userEntry, {
    role_list : user.roles.map( r => r.id ),
    department_id : user.department.id,
    ...user
  } )
  isUserFormDialogVisible.value = true
}

async function handleConfirmSubmit() {
  const form = userEntryFormRef.value
  if ( !form ) return
  try {
    const valid = await form.validate()
    if ( !valid ) return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
    if (
      changePassword.value &&
      ( !newPassword.value || newPassword.value !== confirmPassword.value || newPassword.value.length < 4 )
    ) {
      ElMessage.error( t( 'user.message.passwordNotMatchOrFewerCharacters' ) )
      return
    }
    const newUser = {
      id : userEntry.id ?? Date.now(),
      ...userEntry
    }
    if ( userEntry.id != null ) {
      await userService.updateUser( userEntry.id, newUser )
      ElMessage.success( t( 'user.message.userUpdatedSuccess' ) )
    } else {
      await userService.createUser( newUser )
      ElMessage.success( t( 'user.message.userCreatedSuccess' ) )
    }
    filteredUsers.value = await userService.getUsers()
    resetUserEntry()
    isUserFormDialogVisible.value = false
  } catch ( err ) {
    console.error( 'Error submitting user form:', err )
    ElMessage.error( t( 'user.message.userUpdatedFailed' ) )
  }
}

async function confirmDelete( row ) {
  try {
    await ElMessageBox.confirm(
      t( 'common.deleteConfirmMessage', { name : row.name } ), // message
      t( 'common.warning' ), // title
      {
        type : 'warning',
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        distinguishCancelAndClose : true
      }
    )

    await handleDelete( row.id )
    ElMessage.success( t( 'common.confirmDeleteSuccess' ) )
  } catch {
    // user canceled/closed — do nothing
  }
}

async function handleDelete( id ) {
  await userService.deleteUser( id )
  filteredUsers.value = await userService.getUsers()
  ElMessage.success( t( 'user.message.userDeletedSuccess' ) )
}

function handleCurrentPageChange( val ) {
  currentPage.value = val
}

function handleSizeChange( val ) {
  pageSize.value = val
}

const currentUserId = 1

async function handleActivationStatusChange( userId, newStatus ) {
  try {
    if ( userId === currentUserId && newStatus === 0 ) {
      await ElMessageBox.confirm( t( 'user.message.selfDeactivationWarning' ), t( 'common.warning' ), {
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        type : 'warning'
      } )
      await userService.updateUserActivation( userId, newStatus )
      ElMessage.success( t( 'user.message.selfDeactivationSuccess' ) )
    } else {
      await userService.updateUserActivation( userId, newStatus )
      ElMessage.success( t( 'user.message.statusUpdatedSuccess' ) )
    }
    filteredUsers.value = await userService.getUsers()
  } catch ( err ) {
    console.error( 'Status update error:', err )
    ElMessage.error( t( 'user.message.statusUpdatedFailed' ) )
  }
}

const localFilters = reactive( {
  assignedTeam : [],
  department_id : null,
  role_id : null,
  status : null
} )

// Certificates

const showCertForm = ref( false )
const editingCert = ref( null )

const handleEditCert = cert => {
  editingCert.value = { ...cert }
  showCertForm.value = true
}

const handleAddCert = () => {
  editingCert.value = null
  showCertForm.value = true
}

const handleDeleteCert = cert => {
  userEntry.certificates = userEntry.certificates.filter( c => c.id !== cert.id )
}

const handleCertFormSave = certData => {
  if ( certData.id ) {
    // Replace target certificate with new data
    const index = userEntry.certificates.findIndex( c => c.id === certData.id )

    if ( index !== -1 ) {
      userEntry.certificates[index] = certData
    }
  } else {
    // TODO: remove later when connected to backend
    certData.id = Date.now() // mock id
    userEntry.certificates.push( certData )
  }
  showCertForm.value = false
}

onMounted( async() => {
  filteredUsers.value = await userService.getUsers()
  // TODO: Change mock roles data with actual api
  roleOptions.value = [
    { id : 1, name : 'Maintenance Manager', el_tag_type : 'danger', department_id : 1 },
    { id : 2, name : 'Maintenance Supervisor', el_tag_type : 'primary', department_id : 1 },
    { id : 3, name : 'Maintenance Team Lead', el_tag_type : 'warning', department_id : 1 },
    { id : 4, name : 'Maintenance Worker', el_tag_type : 'success', department_id : 1 },
    { id : 5, name : 'QC Manager', el_tag_type : 'danger', department_id : 2 },
    { id : 6, name : 'QC Supervisor', el_tag_type : 'primary', department_id : 2 },
    { id : 7, name : 'QC Team Lead', el_tag_type : 'warning', department_id : 2 },
    { id : 8, name : 'QC Worker', el_tag_type : 'success', department_id : 2 },
    { id : 9, name : 'Production Manager', el_tag_type : 'danger', department_id : 3 },
    { id : 10, name : 'Production Supervisor', el_tag_type : 'primary', department_id : 3 },
    { id : 11, name : 'Production Team Lead', el_tag_type : 'warning', department_id : 3 },
    { id : 12, name : 'Production Worker', el_tag_type : 'success', department_id : 3 }
  ]

  // TODO: Change mock department data with actual api
  departmentOptions.value = [
    { id : 1, name : 'Maintenance', el_tag_type : 'success' },
    { id : 2, name : 'Quality Control', el_tag_type : 'primary' },
    { id : 3, name : 'Production', el_tag_type : 'danger' }
  ]

  teamOptions.value = [
    {
      id : 1,
      name : 'QC Team A',
      parent_team_id : null,
      level : 1,
      description : '',
      members : [
        { user_id : 101, isLeader : true },
        { user_id : 102, isLeader : false },
        { user_id : 103, isLeader : false }
      ],
      status : 1,
      created_at : '2025-08-15T18:53:38.624593Z',
      created_by : 1,
      updated_at : 2
    },
    {
      id : 2,
      name : 'Maintenance Team B',
      parent_team_id : null,
      level : 1,
      description : '',
      members : [{ user_id : 107, isLeader : true }],
      status : 1,
      created_at : '2025-08-15T18:53:38.624593Z',
      created_by : 1,
      updated_at : 2
    },
    {
      id : 3,
      name : 'Maintenance Team C',
      parent_team_id : null,
      level : 1,
      description : '',
      members : [{ user_id : 106, isLeader : true }],
      status : 1,
      created_at : '2025-08-15T18:53:38.624593Z',
      created_by : 1,
      updated_at : 2
    },
    {
      id : 4,
      name : 'Maintenance Team D',
      parent_team_id : null,
      level : 1,
      description : '',
      members : [{ user_id : 105, isLeader : true }],
      status : 1,
      created_at : '2025-08-15T18:53:38.624593Z',
      created_by : 1,
      updated_at : 2
    }
  ]
} )

function handleFilterChange() {
  // TODO: trigger search user api with localFilters
}

const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 320
}

onMounted( () => {
  window.addEventListener( 'resize', updateTableHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateTableHeight )
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

.popover-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

::v-deep(.popover-text-wrapper .el-text) {
}

.two-col-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
