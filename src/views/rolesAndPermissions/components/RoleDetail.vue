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
            placeholder="Search by keyword"
            prefix-icon="Search"
            clearable
            class="toolbar-input"
          />
        </div>

        <el-table border :data="paginatedUsers" style="width: 100%" height="500" @sort-change="handleSortChange">
          <el-table-column label="Name" min-width="200" sortable="custom" align="center">
            <template #default="scope">
              <span>
                <el-link @click="goToUserDetail(scope.row.id)">
                  {{ scope.row.first_name }} {{ scope.row.last_name }}
                </el-link>
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="id" label="ID" width="80" sortable="custom" align="center" />

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
                  style="width: 30px; height: 30px; border-radius: 50%"
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

          <el-table-column prop="email" label="Email" min-width="220" align="center" />
          <el-table-column prop="phone_number" label="Phone" min-width="140" align="center" />
          <el-table-column prop="username" label="Username" min-width="220px" align="center" />

<!--          <el-table-column :label="'Certificates'" prop="certificate_list" min-width="220px" align="center">-->
<!--            <template #default="scope">-->
<!--              <certificate-hover-detail :certificates="scope.row.certificate_list || []" />-->
<!--            </template>-->
<!--          </el-table-column>-->

          <el-table-column prop="employee_number" label="Employee Number" min-width="200" align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.employee_number || '-' }}
              </el-text>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <!-- left spacer to balance flex -->
          <div class="pagination-spacer"></div>

          <!-- centered pagination -->
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :page-sizes="pageSizeOptions"
            v-model:page-size="pageSize"
            :total="filteredUsers.length"
            v-model:current-page="page"
          />
          <div class="dialog-footer">
            <el-button @click="visible = false">Close</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
// import CertificateHoverDetail from '@/views/user/components/CertificateHoverDetail.vue'

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
  if ( !list ) {
    return []
  }
  const keyword = q.trim().toLowerCase()
  if ( !keyword ) {
    return list
  }

  return list.filter( item =>
    fields.some( f => {
      if ( f === 'full_name' ) {
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase().trim()
        return fullName.includes( keyword )
      }

      return String( item[f] || '' )
        .toLowerCase()
        .includes( keyword )
    } )
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
  const f = filterData( mappedUsers.value, search.value.users, ['id', 'full_name', 'username'] )
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
  display: flex;
  align-items: center;
  justify-content: space-between; /* space for three zones */
  margin-top: 12px;
  width: 100%;
  position: relative;

  /* keep pagination centered visually */
  .el-pagination {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .pagination-spacer {
    width: 120px; /* roughly same width as button area, tweak as needed */
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    width: 120px; /* same as spacer to stay balanced */
  }
}
</style>
