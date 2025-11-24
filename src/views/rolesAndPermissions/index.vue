<template>
  <MesLayout :title="'Role Management'" :view-mode="'table'">
    <template #viewMode> </template>

    <template #head>
      <!-- local filters -->
      <div class="toolbar">
        <div class="filters-container">
          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--              v-model="localFilters.assigned_user_ids"-->
          <!--              :placeholder="'Filter By Assigned Users'"-->
          <!--              clearable-->
          <!--              multiple-->
          <!--              collapse-tags-->
          <!--              collapse-tags-tooltip-->
          <!--              filterable-->
          <!--              size="default"-->
          <!--              style="width: 240px"-->
          <!--              @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option-->
          <!--                v-for="user in userOptions"-->
          <!--                :key="user.id"-->
          <!--                :label="user.first_name + ' ' + user.last_name"-->
          <!--                :value="user.id"-->
          <!--              />-->
          <!--            </el-select>-->
          <!--          </div>-->

          <div class="filter-item">
            <el-select
              v-model="localFilters.module"
              :placeholder="'Filter By Module'"
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              filterable
              size="default"
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
            </el-select>
          </div>

          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--                v-model="localFilters.permission_ids"-->
          <!--                :placeholder="t('Filter By Permissions')"-->
          <!--                clearable-->
          <!--                multiple-->
          <!--                collapse-tags-->
          <!--                collapse-tags-tooltip-->
          <!--                size="default"-->
          <!--                style="width: 200px"-->
          <!--                @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option v-for="p in permissionOptions" :key="p.id" :label="p.name" :value="p.id" />-->
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
              style="width: 200px"
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
      <el-table
        v-loading="loading"
        :data="rolesTableData"
        style="width: 100%"
        fit
        highlight-current-row
        :height="tableHeight"
        :empty-text="t('common.noData')"
        @sort-change="handleSortChange"
        border
      >
        <el-table-column prop="name" :label="'Role Name'" width="220" sortable="custom" align="center" fixed="left">
          <template #default="scope">
            <el-link @click="handleView(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="'ID'" width="100" sortable="custom" align="center" fixed="left" />

        <!-- Equipment count column -->
        <el-table-column prop="user_list" :label="'Assigned Users'" width="200" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.user_list?.length" type="info" size="small" plain @click="handleView(scope.row)">
              {{ scope.row.user_list?.length + ' users' }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!--        <el-table-column prop="permission_ids" :label="'Permissions'" align="center" width="200">-->
        <!--          <template #default="scope">-->
        <!--            <template v-if="scope.row.permission_ids && scope.row.permission_ids.length">-->
        <!--              <TagPopover-->
        <!--                  :items="scope.row.permission_ids"-->
        <!--                  singular-label="permission"-->
        <!--                  plural-label="permissions"-->
        <!--                  :search-key="pid => permissionMap[pid]?.name || ''"-->
        <!--                  :item-key="pid => pid"-->
        <!--              >-->
        <!--                <template #default="{ item }">-->
        <!--                  <EquipmentTag :permissionMap="permissionMap[String(item)] || null" />-->
        <!--                </template>-->
        <!--              </TagPopover>-->
        <!--            </template>-->
        <!--            <template v-else>-->
        <!--              <span>-</span>-->
        <!--            </template>-->
        <!--          </template>-->
        <!--        </el-table-column>-->

        <el-table-column prop="module" :label="'Module'" width="220" sortable="custom" align="center">
          <template #default="scope">
            <el-text>{{ scope.row.module || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="code" :label="'Code'" width="250" sortable="custom" align="center">
          <template #default="scope">
            <el-text>{{ scope.row.code }}</el-text>
          </template>
        </el-table-column>

        <el-table-column
          prop="description"
          :label="t('common.description')"
          width="400"
          sortable="custom"
          align="center"
        >
          <template #default="scope">
            <el-text>{{ scope.row.description || '-' }}</el-text>
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

        <el-table-column :label="t('common.actions')" fixed="right" align="center" header-align="center" width="280">
          <template #default="scope">
            <el-button :icon="View" type="success" size="small" @click="handleView(scope.row)">
              {{ t('common.view') }}
            </el-button>

            <el-button :icon="Edit" type="primary" size="small" @click="handleEdit(scope.row)">{{
              t('common.edit')
            }}</el-button>
            <el-button :icon="Delete" type="danger" size="small" @click="handleDelete(scope.row.id)">{{
              t('common.delete')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="currentEditingRole ? 'Edit Role' : 'New Role'"
        v-model="isDialogVisible"
        top="10vh"
        width="50%"
        @close="handleFormClosed"
      >
        <div v-loading="isFormProcessing">
          <RoleForm
            ref="roleFormRef"
            :role="currentEditingRole"
            @confirm="handleRoleSubmitted"
            @cancel="handleFormClosed"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>

      <RoleDetail
        v-model="showRoleDetail"
        :role="selectedRole"
        :key="selectedRole?.id + '-' + selectedRole?.updated_at"
        @edit="handleEdit"
      />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MesLayout from 'src/components/MesLayout'
import { Delete, Edit, EditPen, Refresh as RefreshIcon, Remove, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchUsers } from '@/api/user.js'
// import EquipmentTag from '@/views/team/components/EquipmentTag.vue'
// import UserTag from '@/views/user/components/UserTag.vue'
// import TagPopover from '@/views/team/components/TagPopover.vue'
import { disableRoles, searchRoles } from '@/api/rbac'
import RoleForm from '@/views/rolesAndPermissions/components/RoleForm.vue'
import RoleDetail from '@/views/rolesAndPermissions/components/RoleDetail.vue'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

const { t } = useI18n()
const loading = ref( false )
const isFormProcessing = ref( false )
const isDialogVisible = ref( false )
const rolesTableData = ref( [] )
const roleFormRef = ref()
const sortSettings = ref( { prop : 'id', order : 'ascending' } )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const totalElements = ref( 0 )
const totalPages = ref( 0 )
const tableHeight = ref( window.innerHeight - 250 )
const userOptions = ref( [] )
// const permissionOptions = ref( [] )
const currentEditingRole = ref( null )
const initialFilters = {
  keyword : '',
  // assigned_user_ids : [],
  permission_ids : [],
  module : null
}

const localFilters = reactive( { ...initialFilters } )

const moduleOptions = [
  {
    label : 'Maintenance',
    value : 'Maintenance'
  },
  {
    label : 'Quality Control',
    value : 'Quality Control'
  },
  {
    label : 'Production',
    value : 'Production'
  },
  {
    label : 'Inventory',
    value : 'Inventory'
  }
]
// const userMap = computed( () => {
//   return Object.fromEntries( userOptions.value.map( user => [user.id, user] ) )
// } )

const selectedRole = ref( null )
const showRoleDetail = ref( false )

function openCreateForm() {
  currentEditingRole.value = null
  isDialogVisible.value = true
}

function handleView( role ) {
  if ( !role ) {
    return
  }

  selectedRole.value = role
  showRoleDetail.value = true
}

function handleEdit( role ) {
  currentEditingRole.value = role
  isDialogVisible.value = true
}

async function handleRoleSubmitted() {
  isDialogVisible.value = false
  await loadRoles()

  if ( showRoleDetail.value && selectedRole.value?.id ) {
    const updated = rolesTableData.value.find( r => r.id === selectedRole.value.id )
    if ( updated ) {
      // clone to force new reactive reference
      console.log( 'found updated role in roles table' )
      selectedRole.value = { ...updated }
    }
  }
}

function handleFilterChange() {
  try {
    currentPage.value = 1

    loadRoles()
  } catch ( e ) {
    ElMessage.error( 'Error fetching roles data' )
  }
}

function clearLocalFilters() {
  Object.assign( localFilters, initialFilters )
  handleFilterChange()
}

function handlePageChange( val ) {
  currentPage.value = val
  loadRoles()
}

function handleSizeChange( val ) {
  pageSize.value = val
  currentPage.value = 1
  loadRoles()
}

function handleSortChange( { prop, order } ) {
  sortSettings.value = { prop, order }
  loadRoles()
}

function handleFormClosed() {
  isDialogVisible.value = false
  roleFormRef.value?.handleResetForm( true )
}

async function loadRoles() {
  function snakeToCamel( str ) {
    return str.replace( /_([a-z])/g, ( _, char ) => char.toUpperCase() )
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel( sortSettings.value.prop )

    const response = await searchRoles(
      localFilters,
      currentPage.value,
      pageSize.value,
      sortKey,
      sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC'
    )

    const data = response.data
    const rawRole = data.content || []

    rolesTableData.value = rawRole.map( role => {
      return {
        ...role,
        user_list : ( role.user_list || [] ).filter( user => user.status === 1 )
      }
    } )

    totalPages.value = data.totalPages
    totalElements.value = data.totalElements
  } catch ( err ) {
    console.error( 'Failed to load roles:', err )
    ElMessage.error( 'Error fetching roles data' )
  } finally {
    loading.value = false
  }
}

async function handleDelete( id ) {
  try {
    await ElMessageBox.confirm( t( 'common.confirmMessage' ), t( 'common.warning' ), {
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      type : 'warning',
      distinguishCancelAndClose : true
    } )

    await disableRoles( [id] )
    await loadRoles()

    ElMessage.success( 'Role delete successfully' )
  } catch ( err ) {
    if ( err === 'cancel' || err === 'close' ) {
      // User canceled — do nothing
      return
    }
    console.error( err )
    ElMessage.error( 'Error deleting a role' )
  }
}

async function loadUsers() {
  try {
    const response = await searchUsers( { status_ids : [1] }, 1, 1000 )
    userOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
  }
}

// async function loadPermissions() {
//   try {
//     const response = await searchPermissions( { status_ids : [1] }, 1, 1000 )
//     permissionOptions.value = response?.data?.content || []
//   } catch ( err ) {
//     console.error( 'Failed to load permissions:', err )
//     ElMessage.error( 'Failed to load permissions' )
//   }
// }

async function refreshTable() {
  try {
    loading.value = true

    await loadUsers()
    await loadRoles()
  } catch ( e ) {
  } finally {
    loading.value = false
  }
}

// Watch for changes in location or equipment filters and reload
watch(
  () => [localFilters.location_ids, localFilters.equipment_node_ids],
  () => {
    handleFilterChange()
  },
  { deep : true }
)

onMounted( async() => {
  try {
    loading.value = true
    // await loadPermissions()
    await loadUsers()
    await loadRoles()
  } finally {
    loading.value = false
  }
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
