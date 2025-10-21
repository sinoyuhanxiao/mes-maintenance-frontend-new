<template>
  <el-dialog v-model="visible" width="50%" top="10vh" destroy-on-close>
    <!-- Header -->
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">
          <span class="role-name">{{ role?.name }}</span>
          <span v-if="role?.id" class="role-id">#{{ role.id }}</span>
        </div>

        <el-button :icon="Edit" type="info" @click="emit('edit', role)"> Edit </el-button>
      </div>
    </template>

    <!-- Basic Info -->
    <!--    <el-descriptions :column="3" direction="vertical" size="default" class="general-details-descriptions">-->
    <!--      <el-descriptions-item label="Code">-->
    <!--        {{ role?.code || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Module">-->
    <!--        {{ role?.module || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Description" :span="3">-->
    <!--        {{ role?.description || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Created At" min-width="150px">-->
    <!--        {{ formatAsLocalDateTimeString(role?.created_at) || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Updated At" min-width="150px">-->
    <!--        {{ formatAsLocalDateTimeString(role?.updated_at) || '-' }}-->
    <!--      </el-descriptions-item>-->
    <!--    </el-descriptions>-->

    <!-- Tabs -->
    <el-tabs v-model="activeTab">
      <!-- Assigned Users -->
      <el-tab-pane label="Assigned Users" name="users">
        <div class="tab-toolbar">
          <el-input
            v-model="search.users"
            placeholder="Search by name or email"
            prefix-icon="Search"
            clearable
            class="toolbar-input"
          />
        </div>

        <el-table border :data="paginatedUsers" style="width: 100%" height="500" @sort-change="handleSortChange">
          <el-table-column prop="id" label="ID" width="80" sortable="custom" align="center" />
          <el-table-column label="Name" min-width="200" sortable="custom" align="center">
            <template #default="scope">
              <span>
                <el-link @click="goToUserDetail(scope.row.id)">
                  {{ scope.row.first_name }} {{ scope.row.last_name }}
                </el-link>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="Email" min-width="220" align="center" />
          <el-table-column prop="phone_number" label="Phone" min-width="140" align="center" />
        </el-table>

        <div class="pagination-container">
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :page-sizes="pageSizeOptions"
            v-model:page-size="pageSize"
            :total="filteredUsers.length"
            v-model:current-page="page"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Footer -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'

const props = defineProps( {
  role : { type : Object, default : null },
  modelValue : { type : Boolean, default : false }
} )

const emit = defineEmits( ['update:modelValue', 'edit'] )
const router = useRouter()

// ===== Dialog visibility =====
const visible = ref( props.modelValue )
watch(
  () => props.modelValue,
  v => ( visible.value = v )
)
watch( visible, v => emit( 'update:modelValue', v ) )

// ===== State =====
const activeTab = ref( 'users' )
const pageSize = ref( 10 )
const pageSizeOptions = [5, 10, 20, 50]
const search = ref( { users : '' } )
const page = ref( 1 )
const sort = ref( { prop : null, order : null } )

// ===== Derived lists =====
const mappedUsers = computed( () => {
  if ( !props.role?.user_list ) return []
  return props.role.user_list
} )

// ===== Filtering =====
const filterData = ( list, q, fields ) => {
  if ( !list ) return []
  const keyword = q.trim().toLowerCase()
  if ( !keyword ) return list
  return list.filter( item =>
    fields.some( f =>
      String( item[f] || '' )
        .toLowerCase()
        .includes( keyword )
    )
  )
}

// ===== Sorting =====
const sortData = ( list, { prop, order } ) => {
  if ( !prop || !order ) return list
  return [...list].sort( ( a, b ) => {
    const va = a[prop] ?? ''
    const vb = b[prop] ?? ''
    return order === 'ascending' ? String( va ).localeCompare( String( vb ) ) : String( vb ).localeCompare( String( va ) )
  } )
}

const handleSortChange = ( { prop, order } ) => {
  sort.value = { prop, order }
}

// ===== Computed lists =====
const filteredUsers = computed( () => {
  const f = filterData( mappedUsers.value, search.value.users, ['id', 'first_name', 'last_name', 'email'] )
  return sortData( f, sort.value )
} )

// ===== Pagination =====
const paginate = ( list, p ) => {
  const start = ( p - 1 ) * pageSize.value
  return list.slice( start, start + pageSize.value )
}
const paginatedUsers = computed( () => paginate( filteredUsers.value, page.value ) )

// ===== Navigation =====
function goToUserDetail( id ) {
  router.push( { name : 'UserDetail', params : { id }} )
}
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}

.dialog-title {
  display: flex;
  align-items: baseline;
  gap: 8px;

  .role-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .role-id {
    font-size: 14px;
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.general-details-descriptions {
  :deep(.el-descriptions__label) {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  :deep(.el-descriptions__content) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}

.tab-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;

  .toolbar-input {
    width: 280px;
  }
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
