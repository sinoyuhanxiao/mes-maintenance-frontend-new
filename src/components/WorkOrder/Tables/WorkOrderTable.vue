<template>
  <div class="work-order-table" ref="rootEl">
    <el-table
      v-loading="loading"
      :data="data"
      border
      fit
      highlight-current-row
      :height="tableHeight"
      style="width: 100%"
      row-key="id"
      :tree-props="{ children: 'children' }"
      :lazy="true"
      :load="loadChildren"
      @expand-change="onExpandChange"
      :row-class-name="getRowClass"
    >
      <!-- Work Order Name -->
      <el-table-column :label="$t('workOrder.table.name')" prop="name" align="left" width="400" fixed="left" />

      <!-- ID Column -->
      <el-table-column :label="$t('workOrder.table.id')" prop="id" align="center" width="120">
        <template #default="{ row }">
          <span class="work-order-id clickable-id" @click="$emit('view', row)">#{{ row.id }}</span>
        </template>
      </el-table-column>

      <!-- Work Order Image -->
      <el-table-column :label="$t('workOrder.table.preview')" align="center" width="100">
        <template #default="{ row }">
          <WorkOrderImage :image-path="row.image_list" />
        </template>
      </el-table-column>

      <!-- Assigned To -->
      <el-table-column :label="$t('workOrder.table.assignedTo')" align="center" width="360">
        <template #default="{ row }">
          <span v-if="!row.user_list || row.user_list.length <= 2">
            {{ displayedAssignedUsers(row) }}
          </span>
          <span v-else>
            {{ displayedAssignedUsersText(row) }}
            <span class="total-count-link" @click="openUserListDialog(row)"> ({{ row.user_list.length }} total) </span>
          </span>
        </template>
      </el-table-column>

      <!-- Work Order Code -->
      <el-table-column :label="$t('workOrder.table.code')" prop="code" align="center" width="250" />

      <!-- Due Date (With Highlighting If Overdue) -->
      <el-table-column :label="$t('workOrder.table.dueDate')" prop="due_date" align="center" width="180">
        <template #default="{ row }">
          <span :style="{ color: isOverdue(row.due_date) ? 'var(--el-color-danger)' : '' }">
            {{ formatDateTime(row.due_date) }}
          </span>
        </template>
      </el-table-column>

      <!-- Priority -->
      <el-table-column :label="$t('workOrder.table.priority')" prop="priority.name" align="center" width="120">
        <template #default="{ row }">
          <PriorityTag :priority="row.priority" />
        </template>
      </el-table-column>

      <!-- Maintenance Type -->
      <el-table-column :label="$t('workOrder.table.workType')" prop="work_type.name" align="center" width="150">
        <template #default="{ row }">
          <WorkTypeTag :work-type="row.work_type" />
        </template>
      </el-table-column>

      <!-- Category -->
      <el-table-column :label="$t('workOrder.table.category')" prop="category.name" align="center" width="400">
        <template #default="{ row }">
          <div class="category-tag-list" v-if="getCategoryTags(row).length">
            <CategoryTag
              v-for="category in getCategoryTags(row)"
              :key="getCategoryKey(category)"
              :category="category"
            />
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- Recurrence Type -->
      <el-table-column
        :label="$t('workOrder.table.recurrenceType')"
        prop="recurrence_type.name"
        align="center"
        width="150"
      >
        <template #default="{ row }">
          <div
            :class="{
              'recurrence-clickable': !recurrenceViewMode && row.recurrence_uuid && row.recurrence_type?.id !== 1,
            }"
            @click="handleRecurrenceClick(row)"
          >
            <RecurrenceTag :recurrence-type="row.recurrence_type" />
          </div>
        </template>
      </el-table-column>

      <!-- Estimated Time -->
      <el-table-column :label="$t('workOrder.table.estimatedTime')" prop="estimated_minutes" align="center" width="150">
        <template #default="{ row }">
          {{ row.estimated_minutes != null ? row.estimated_minutes : '-' }}
        </template>
      </el-table-column>

      <!-- Start Date -->
      <el-table-column :label="$t('workOrder.table.startDate')" prop="start_date" align="center" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.start_date) }}
        </template>
      </el-table-column>

      <!-- State -->
      <el-table-column :label="$t('workOrder.table.state')" prop="state.name" align="center" width="150">
        <template #default="{ row }">
          <el-tag
            v-if="row.state?.name"
            :type="getStateTagType(row.state?.name)"
            :effect="getStateTagEffect(row.state?.name)"
          >
            {{ row.state.name }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- Created By -->
      <el-table-column :label="$t('workOrder.table.createdBy')" prop="created_by" align="center" width="200">
        <template #default="{ row }">
          <span v-if="row.created_by">
            {{
              typeof row.created_by === 'object'
                ? `${row.created_by.first_name} ${row.created_by.last_name}`
                : row.created_by
            }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- Created At -->
      <el-table-column :label="$t('workOrder.table.createdAt')" prop="created_at" align="center" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>

      <!-- Updated By -->
      <el-table-column :label="$t('workOrder.table.updatedBy')" prop="updated_by" align="center" width="200">
        <template #default="{ row }">
          <span v-if="row.updated_by">
            {{
              typeof row.updated_by === 'object'
                ? `${row.updated_by.first_name} ${row.updated_by.last_name}`
                : row.updated_by
            }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- Updated At -->
      <el-table-column :label="$t('workOrder.table.updatedAt')" prop="updated_at" align="center" width="180">
        <template #default="{ row }">
          {{ row.updated_at ? formatDateTime(row.updated_at) : '-' }}
        </template>
      </el-table-column>

      <!-- Description -->
      <el-table-column :label="$t('workOrder.table.description')" prop="description" align="left" width="500">
        <template #default="{ row }">
          <span :title="row.description">{{ row.description || '-' }}</span>
        </template>
      </el-table-column>

      <!-- Actions -->
      <el-table-column
        :label="$t('workOrder.table.actions')"
        align="center"
        width="250"
        class-name="small-padding fixed-width action-column"
        fixed="right"
      >
        <template #default="{ row, $index }">
          <WorkOrderActions
            :row="row"
            :index="$index"
            @view="$emit('view', row)"
            @edit="$emit('edit', row)"
            @delete="$emit('delete', row, $index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- User List Dialog -->
    <el-dialog v-model="userListDialogVisible" title="Assigned Users" width="900px" top="10vh" class="user-list-dialog">
      <div class="tab-toolbar">
        <el-input
          v-model="userSearchQuery"
          placeholder="Search by name or email"
          prefix-icon="Search"
          clearable
          class="toolbar-input"
        />
      </div>

      <el-table :data="filteredUserList" style="width: 100%" height="400">
        <el-table-column label="Name" min-width="170px" align="center" fixed="left">
          <template #default="scope">
            <span>{{ scope.row.first_name + ' ' + scope.row.last_name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" min-width="80px" align="center" fixed="left" />

        <el-table-column prop="image" label="Profile Picture" min-width="150px" align="center">
          <template #default="scope">
            <div class="profile-picture-cell">
              <template v-if="!scope.row.image">
                <el-tooltip content="No image available">
                  <div class="image-slot-circle">
                    <el-icon><Picture /></el-icon>
                  </div>
                </el-tooltip>
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
                  <el-tooltip content="Image failed to load">
                    <div class="image-slot-circle">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </el-tooltip>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="role_list" label="Primary Role" min-width="200px" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.role_list && scope.row.role_list.length > 0">
              {{ getPrimaryRole(scope.row.role_list) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="Email" min-width="220px" align="center" />
        <el-table-column prop="phone_number" label="Phone" min-width="220px" align="center" />
        <el-table-column prop="username" label="Username" min-width="220px" align="center" />

        <el-table-column prop="employee_number" label="Employee Number" min-width="200" align="center">
          <template #default="scope">
            <el-text>{{ scope.row.employee_number || '-' }}</el-text>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="userListDialogVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { convertToLocalTime } from '@/utils/datetime'
import { Picture } from '@element-plus/icons-vue'
import WorkOrderImage from '../Display/WorkOrderImage.vue'
import PriorityTag from '../Display/PriorityTag.vue'
import WorkTypeTag from '../Display/WorkTypeTag.vue'
import CategoryTag from '../Display/CategoryTag.vue'
import RecurrenceTag from '../Display/RecurrenceTag.vue'
import WorkOrderActions from '../Actions/WorkOrderActions.vue'
import { getStateTagType, getStateTagEffect } from '@/components/WorkOrder/utils/stateUtils'

// Props
const props = defineProps( {
  data : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  },
  expandedRows : {
    type : Set,
    default : () => new Set()
  },
  loadChildren : {
    type : Function,
    required : true
  },
  recurrenceViewMode : {
    type : Boolean,
    default : false
  }
} )

// Emits
const emit = defineEmits( ['expand-change', 'view', 'edit', 'delete', 'view-recurrence'] )

// State
const tableHeight = ref( 300 )
const rootEl = ref( null )
const userListDialogVisible = ref( false )
const userSearchQuery = ref( '' )
const currentWorkOrderRow = ref( null )

// Computed
const getRowClass = ( { row } ) => {
  return props.expandedRows.has( row.id ) ? 'expanded-highlight' : ''
}

const filteredUserList = computed( () => {
  const userList = currentWorkOrderRow.value?.user_list
  if ( !userList || !Array.isArray( userList ) ) {
    return []
  }

  if ( !userSearchQuery.value ) {
    return userList
  }

  const query = userSearchQuery.value.toLowerCase()
  return userList.filter( user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = ( user.email || '' ).toLowerCase()
    return fullName.includes( query ) || email.includes( query )
  } )
} )

// Methods
let roNavbar = null
let roTagsView = null
let roHeader = null
let roFooter = null

const safeOffsetHeight = el => ( el && el.offsetHeight ) || 0

const calcTableHeight = () => {
  try {
    let h = window.innerHeight
    const navbar = document.querySelector( '.main-container .fixed-header .navbar' )
    const tagsViewView = document.querySelector( '.main-container .fixed-header .tags-view-wrapper .el-scrollbar__view' )
    const layout = rootEl.value ? rootEl.value.closest( '.mes-layout' ) : null
    const header = layout ? layout.querySelector( ':scope > .header' ) : null
    const footer = layout ? layout.querySelector( ':scope > .footer' ) : null

    h -= safeOffsetHeight( navbar )
    h -= safeOffsetHeight( tagsViewView )
    h -= safeOffsetHeight( header )
    h -= safeOffsetHeight( footer )
    h -= 20

    // Minimum sensible height to prevent collapse
    tableHeight.value = Math.max( h, 160 )
  } catch ( e ) {
    // Fallback if any selector breaks
    tableHeight.value = Math.max( window.innerHeight - 320, 160 )
  }
}

const updateTableHeight = () => {
  calcTableHeight()
}

const onExpandChange = ( row, expanded ) => {
  emit( 'expand-change', row, expanded )
}

const formatDateTime = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
}

const isOverdue = dueDate => {
  return dueDate && new Date( dueDate ) < new Date()
}

const handleRecurrenceClick = row => {
  if ( props.recurrenceViewMode || !row.recurrence_uuid || row.recurrence_type?.id === 1 ) {
    return
  }
  emit( 'view-recurrence', row.recurrence_uuid )
}

const displayedAssignedUsers = row => {
  const userList = row?.user_list
  if ( !userList || !Array.isArray( userList ) || userList.length === 0 ) {
    return 'Unassigned'
  }

  const formatUser = user => `${user.first_name} ${user.last_name}`

  if ( userList.length === 1 ) {
    return formatUser( userList[0] )
  } else if ( userList.length === 2 ) {
    return `${formatUser( userList[0] )}, ${formatUser( userList[1] )}`
  } else {
    return `${formatUser( userList[0] )}, ${formatUser( userList[1] )}... (${userList.length} total)`
  }
}

const displayedAssignedUsersText = row => {
  const userList = row?.user_list
  if ( !userList || !Array.isArray( userList ) || userList.length === 0 ) {
    return 'Unassigned'
  }

  const formatUser = user => `${user.first_name} ${user.last_name}`

  if ( userList.length === 1 ) {
    return formatUser( userList[0] )
  } else if ( userList.length === 2 ) {
    return `${formatUser( userList[0] )}, ${formatUser( userList[1] )}`
  } else {
    return `${formatUser( userList[0] )}, ${formatUser( userList[1] )}...`
  }
}

const openUserListDialog = row => {
  currentWorkOrderRow.value = row
  userSearchQuery.value = ''
  userListDialogVisible.value = true
}

const getPrimaryRole = roleList => {
  if ( !roleList || !Array.isArray( roleList ) || roleList.length === 0 ) {
    return '-'
  }

  // Find the primary role
  const primaryRole = roleList.find( r => r.is_primary === true )

  if ( primaryRole && primaryRole.role && primaryRole.role.name ) {
    return primaryRole.role.name
  }

  // Fallback to first role if no primary role found
  if ( roleList[0] && roleList[0].role && roleList[0].role.name ) {
    return roleList[0].role.name
  }

  return '-'
}

const getCategoryTags = row => {
  if ( !row ) return []
  // Check for categories array first
  if ( Array.isArray( row.categories ) && row.categories.length ) {
    return row.categories
  }
  // Check for category_list array
  if ( Array.isArray( row.category_list ) && row.category_list.length ) {
    return row.category_list
  }
  // Check for single category
  if ( row.category ) {
    return Array.isArray( row.category ) ? row.category : [row.category]
  }
  return []
}

const getCategoryKey = category => {
  if ( category && typeof category === 'object' ) {
    return category.id ?? category.name ?? JSON.stringify( category )
  }
  return category
}

// Lifecycle
onMounted( async() => {
  await nextTick()
  // Initial calculation after DOM paints
  calcTableHeight()

  // Recalculate on window resize
  window.addEventListener( 'resize', updateTableHeight )

  // Observe dynamic height changes in relevant containers
  if ( 'ResizeObserver' in window ) {
    const layout = rootEl.value ? rootEl.value.closest( '.mes-layout' ) : null
    const navbar = document.querySelector( '.main-container .fixed-header .navbar' )
    const tagsViewView = document.querySelector( '.main-container .fixed-header .tags-view-wrapper .el-scrollbar__view' )
    const header = layout ? layout.querySelector( ':scope > .header' ) : null
    const footer = layout ? layout.querySelector( ':scope > .footer' ) : null

    const makeRO = () => new ResizeObserver( () => calcTableHeight() )

    if ( navbar ) {
      roNavbar = makeRO()
      roNavbar.observe( navbar )
    }
    if ( tagsViewView ) {
      roTagsView = makeRO()
      roTagsView.observe( tagsViewView )
    }
    if ( header ) {
      roHeader = makeRO()
      roHeader.observe( header )
    }
    if ( footer ) {
      roFooter = makeRO()
      roFooter.observe( footer )
    }
  }
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateTableHeight )
  // Disconnect observers
  if ( roNavbar ) roNavbar.disconnect()
  if ( roTagsView ) roTagsView.disconnect()
  if ( roHeader ) roHeader.disconnect()
  if ( roFooter ) roFooter.disconnect()
} )

defineOptions( {
  name : 'WorkOrderTable'
} )
</script>

<style scoped lang="scss">
.work-order-table {
  height: 100%;
  .el-table {
    &::v-deep(.action-column) {
      border-left: 1px solid grey;
    }

    &::v-deep(th.el-table__cell),
    &::v-deep(td.el-table__cell) {
      position: static;
    }
  }

  .el-table__expand-icon > .el-icon {
    font-size: 15px !important;
  }

  &::v-deep(.el-table__body-wrapper .expanded-highlight td),
  &::v-deep(.el-table__fixed .el-table__row.expanded-highlight td),
  &::v-deep(.el-table__fixed-left .el-table__row.expanded-highlight td),
  &::v-deep(.el-table__fixed-right .el-table__row.expanded-highlight td) {
    background-color: #e0f3ff !important;
  }
}

// Clickable recurrence type styling
.recurrence-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px 4px;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// Category tag list styling
.category-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

// Work order ID styling (matching detail view)
.work-order-id {
  color: var(--el-color-primary);
  font-weight: 500;
  font-size: 14px;

  &.clickable-id {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: var(--el-color-primary-light-3);
    }

    &:active {
      color: var(--el-color-primary-dark-2);
    }
  }
}

// Assigned users styling
.total-count-link {
  color: var(--el-color-primary);
  cursor: pointer;
  margin-left: 4px;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: var(--el-color-primary-light-3);
  }

  &:active {
    color: var(--el-color-primary-dark-2);
  }
}

// User list dialog styling
.user-list-dialog {
  .tab-toolbar {
    margin-bottom: 16px;

    .toolbar-input {
      width: 100%;
    }
  }

  .profile-picture-cell {
    display: flex;
    justify-content: center;
    align-items: center;

    .image-slot-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: var(--el-fill-color-light);
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--el-text-color-secondary);
      font-size: 16px;
    }
  }
}
</style>
