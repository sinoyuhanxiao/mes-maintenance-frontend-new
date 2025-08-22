<template>
  <MesLayout :title="'User Management'" :view-mode="'table'">
    <template #viewMode>
      <div class="toolbar">
        <div class="toolbar-item">
        </div>
        <div class="right-group">
          <div>
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

          <div class="actions-row">
            <el-button type="primary" @click="openCreateForm"> Add User </el-button>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="tableContainer" style="overflow-x: auto; max-width: 100%">
        <el-table
          v-loading="loading"
          :data="paginatedUsers"
          style="width: 100%"
          @sort-change="(val) => sortSettings = val"
          :empty-text="t('common.noData')"
          :height="tableHeight"
          border
          fit
          highlight-current-row
        >
          <el-table-column :label="t('user.table.id')" width="100" prop="id" sortable>
            <template #default="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.name')" prop="name" width="180" sortable>
            <template #default="scope">
              <el-popover trigger="hover" placement="top">
                <template #default>
                  <p>{{ t('user.table.name') }}: {{ scope.row.name }}</p>
                </template>
                <template #reference>
                  <el-tag size="default">{{ scope.row.name }}</el-tag>
                </template>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.username')" prop="username" width="180" sortable>
            <template #default="scope">
              <span>{{ scope.row.username ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.teams')" prop="teams" width="280">
            <template #default="scope">
              <div>
                <el-tag
                  v-for="(team, index) in scope.row.teams"
                  :key="index"
                  size="small"
                  style="margin-right: 5px"
                  round
                  :effect="scope.row.leadership_teams?.includes(team.id) ? 'dark' : 'light'"
                >
                  <el-popover trigger="hover" placement="top">
                    <template #default>
                      <p>ID: {{ team.id }}</p>
                      <p>{{ t('user.table.teams') }}: {{ team.team_name }}</p>
                      <p>{{ t('user.table.leader') }}: {{ team.leader_name }}</p>
                    </template>
                    <template #reference>
                      {{ team.team_name }}
                    </template>
                  </el-popover>
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.role')" prop="role.name" width="150" sortable>
            <template #default="scope">
              <el-tag :type="scope.row.role?.el_tag_type || 'info'" size="default" style="font-weight: bold">
                {{ scope.row.role?.name || '-' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.status')" prop="activation_status" width="140" sortable>
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

          <el-table-column :label="t('user.table.email')" prop="email" width="220px" sortable>
            <template #default="scope">
              <span>{{ scope.row.email ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="t('user.table.phoneNumber')" prop="phone_number" width="180px" sortable>
            <template #default="scope">
              <span>{{ scope.row.phone_number ?? '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :label="t('user.table.actions')"
            align="right"
            header-align="right"
            width="180"
            fixed="right"
          >
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">
                {{ t('common.edit') }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">
                {{ t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog
          :title="userEntry.id == null ? t('user.form.newUser') : t('user.form.editUser')"
          v-model="isUserFormDialogVisible"
          width="50%"
      >
        <div class="popup-container">
          <el-form ref="userEntryFormRef" :model="userEntry" :rules="userFormValidationRules" label-width="140px">
            <el-form-item :label="t('user.form.name')" prop="name">
              <el-input v-model="userEntry.name" />
            </el-form-item>

            <el-form-item :label="t('user.form.role')" prop="role">
              <el-select v-model="userEntry.role" :placeholder="t('user.form.selectRolePlaceHolder')">
                <el-option
                    v-for="role in rolesOptions"
                    :key="role.id"
                    :label="role.name"
                    :value="role.id"
                >
                  <el-tag :type="role.el_tag_type">{{ role.name }}</el-tag>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item :label="t('user.form.email')" prop="email">
              <el-input v-model="userEntry.email" />
            </el-form-item>

            <el-form-item :label="t('user.form.phoneNumber')" prop="phone_number">
              <el-input v-model="userEntry.phone_number" />
            </el-form-item>

            <el-form-item :label="t('user.membershipTeams')">
              <team-membership-select
                  v-model="userEntry.membershipTeams"
                  :tree="teamsOptions"
                  :parent-map="teamsParentMap"
                  :role="userEntry.role"
              />
            </el-form-item>

            <el-form-item :label="t('user.leadershipTeams')">
              <team-leadership-select
                  v-model="userEntry.leadershipTeams"
                  :tree="teamsOptions"
                  :parent-map="teamsParentMap"
                  :role="userEntry.role"
              />
            </el-form-item>

            <el-form-item :label="t('user.form.status')" prop="activation_status">
              <el-select v-model="userEntry.activation_status" :placeholder="t('user.form.status')">
                <el-option :label="t('user.status.active')" :value="1" />
                <el-option :label="t('user.status.inactive')" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('user.form.username')" prop="username">
              <el-input v-model="userEntry.username" />
            </el-form-item>

            <!-- Show only for new user -->
            <template v-if="userEntry.id == null">
              <el-form-item :label="t('user.form.newPassword')" prop="newPassword">
                <el-input v-model="newPassword" type="password" show-password />
              </el-form-item>

              <el-form-item :label="t('user.form.confirmPassword')" prop="confirmPassword">
                <el-input v-model="confirmPassword" type="password" show-password />
              </el-form-item>
            </template>

            <!-- Show only for editing existing user -->
            <template v-else>
              <el-form-item>
                <el-checkbox v-model="changePassword">
                  {{ t('user.form.changePassword') }}
                </el-checkbox>
              </el-form-item>

              <el-form-item v-if="changePassword" :label="t('user.form.newPassword')" prop="newPassword">
                <el-input v-model="newPassword" type="password" show-password />
              </el-form-item>

              <el-form-item v-if="changePassword" :label="t('user.form.confirmPassword')" prop="confirmPassword">
                <el-input v-model="confirmPassword" type="password" show-password />
              </el-form-item>
            </template>
          </el-form>
        </div>

        <template #footer>
          <div class="popup-container">
            <el-button @click="isUserFormDialogVisible = false">{{ t('user.form.cancelButton') }}</el-button>
            <el-button type="primary" @click="handleConfirmSubmit">{{ t('user.form.confirmButton') }}</el-button>
          </div>
        </template>
      </el-dialog>
    </template>

    <template #foot>
      <el-pagination
        v-if="shouldShowPagination"
        style="margin-top: 10px"
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
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import MesLayout from 'src/components/MesLayout'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import TeamMembershipSelect from '@/views/user/components/TeamMembershipSelect.vue'
import TeamLeadershipSelect from '@/views/user/components/TeamLeadershipSelect.vue'
import * as userService from '@/views/user/components/userService.js'

const { t } = useI18n()

const isUserFormDialogVisible = ref( false )
const searchInput = ref( '' )
const teamsOptions = ref( [] )
const teamsParentMap = ref( {} )
const users = userService.useUserList()
const filteredUsers = ref( [] )
const rolesOptions = ref( [] )
const sortSettings = ref( { prop : '', order : '' } )
const loading = ref( false )
const changePassword = ref( false )
const newPassword = ref( '' )
const confirmPassword = ref( '' )
const tableHeight = ref( window.innerHeight - 250 )
const currentPage = ref( 1 )
const pageSize = ref( 10 )

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

const shouldShowPagination = computed( () => filteredUsers.value.length > 10 && Array.isArray( filteredUsers.value ) )

watch( filteredUsers, newVal => {
  console.log( 'filteredUsers changed:', newVal.length )
} )

const userEntryFormRef = ref()
const userEntry = reactive( {
  id : null,
  name : '',
  role : '',
  username : '',
  email : '',
  phone_number : '',
  activation_status : 1,
  password : '',
  membershipTeams : [],
  leadershipTeams : [],
  teamAssignment : null
} )

const userFormValidationRules = ref( {
  name : [{ required : true, message : t( 'user.validation.nameRequired' ), trigger : 'blur' }],
  role : [{ required : true, message : t( 'user.validation.roleRequired' ), trigger : 'change' }],
  activation_status : [{ required : true, message : t( 'user.validation.statusRequired' ), trigger : 'change' }],
  username : [
    { required : true, message : t( 'user.validation.usernameRequired' ), trigger : 'blur' },
    { min : 4, message : t( 'user.validation.usernameMinLength' ), trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        if ( !value ) return callback()
        const existingNames = users.value.filter( user => user.id !== userEntry.id ).map( user => user.username.toLowerCase() )
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

function searchUsers() {
  const searchText = searchInput.value.toLowerCase()
  filteredUsers.value = users.value.filter( item => {
    return (
      String( item.id ).includes( searchText ) ||
        item.name?.toLowerCase().includes( searchText ) ||
        item.username?.toLowerCase().includes( searchText ) ||
        item.email?.toLowerCase().includes( searchText ) ||
        String( item.phone_number ).toLowerCase().includes( searchText ) ||
        rolesOptions.value.find( role => role.id === item.role_id )?.name.toLowerCase().includes( searchText ) ||
        ( item.activation_status !== undefined && ( item.activation_status === 1 ? '已激活' : '未激活' ).includes( searchText ) ) ||
        item.teams?.some( team => team.team_name?.toLowerCase().includes( searchText ) )
    )
  } )
  currentPage.value = 1
}

function resetUserEntry() {
  Object.assign( userEntry, {
    id : null,
    name : '',
    role : '',
    username : '',
    email : '',
    phone_number : '',
    activation_status : 1,
    password : '',
    membershipTeams : [],
    leadershipTeams : [],
    teamAssignment : null
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

function handleEdit( user ) {
  if ( userEntryFormRef.value ) {
    userEntryFormRef.value.resetFields()
  }

  Object.assign( userEntry, {
    ...user,
    role : user.role?.id || '',
    membershipTeams : [...user.teams || []],
    leadershipTeams : [...user.leadership_teams || []]
  } )
  isUserFormDialogVisible.value = true
}

async function handleConfirmSubmit() {
  const form = userEntryFormRef.value
  if ( !form ) return
  try {
    const valid = await form.validate()
    if ( !valid ) return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
    if ( changePassword.value && ( !newPassword.value || newPassword.value !== confirmPassword.value || newPassword.value.length < 4 ) ) {
      ElMessage.error( t( 'user.message.passwordNotMatchOrFewerCharacters' ) )
      return
    }
    const newUser = {
      id : userEntry.id ?? Date.now(),
      name : userEntry.name,
      username : userEntry.username,
      email : userEntry.email,
      phone_number : userEntry.phone_number,
      role : rolesOptions.value.find( r => r.id === userEntry.role ),
      activation_status : userEntry.activation_status,
      teams : [],
      leadership_teams : []
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

onMounted( async() => {
  filteredUsers.value = await userService.getUsers()
  rolesOptions.value = [
    { id : 1, name : 'Manager', el_tag_type : 'danger' },
    { id : 2, name : 'Supervisor', el_tag_type : 'primary' },
    { id : 3, name : 'Team Lead', el_tag_type : 'warning' },
    { id : 4, name : 'Worker', el_tag_type : 'success' }
  ]
} )

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
  padding: 12px;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;

  .toolbar-item {
    width: 100%;

    .el-select,
    .el-input {
      width: 100% !important;
    }
  }

  .right-group {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .actions-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 10px;
  }
}
</style>
