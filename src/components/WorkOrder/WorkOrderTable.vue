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
      <el-table-column :label="$t('workOrder.table.name')" prop="name" align="left" width="300" fixed="left">
        <template #default="{ row }">
          <span style="color: black">{{ row.name }}</span>
        </template>
      </el-table-column>

      <!-- ID Column -->
      <el-table-column :label="$t('workOrder.table.id')" prop="id" align="center" width="120">
        <template #default="{ row }">
          <span style="color: grey">#{{ row.id }}</span>
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

      <!-- Work Order Image -->
      <el-table-column :label="$t('workOrder.table.preview')" align="center" width="150">
        <template #default="{ row }">
          <WorkOrderImage :image-path="row.image_list" />
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
      <el-table-column :label="$t('workOrder.table.category')" prop="category.name" align="center" width="150">
        <template #default="{ row }">
          <CategoryTag :category="row.category" />
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
          <RecurrenceTag :recurrence-type="row.recurrence_type" />
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

      <!-- Finished Date -->
      <el-table-column :label="$t('workOrder.table.finishedDate')" prop="finished_at" align="center" width="200">
        <template #default="{ row }">
          {{ row.finished_at ? formatDateTime(row.finished_at) : '-' }}
        </template>
      </el-table-column>

      <!-- Approved At -->
      <el-table-column :label="$t('workOrder.table.approvedDate')" prop="approved_at" align="center" width="200">
        <template #default="{ row }">
          {{ row.approved_at ? formatDateTime(row.approved_at) : '-' }}
        </template>
      </el-table-column>

      <!-- State -->
      <el-table-column :label="$t('workOrder.table.state')" prop="state.name" align="center" width="150">
        <template #default="{ row }">
          <StatusTag :status="row.state" />
        </template>
      </el-table-column>

      <!-- Created By -->
      <el-table-column :label="$t('workOrder.table.createdBy')" prop="created_by" align="center" width="150" />

      <!-- Approved By -->
      <el-table-column :label="$t('workOrder.table.approvedBy')" prop="approved_by_id" align="center" width="150">
        <template #default="{ row }">
          {{ row.approved_by_id != null ? row.approved_by_id : '-' }}
        </template>
      </el-table-column>

      <!-- Description -->
      <el-table-column :label="$t('workOrder.table.description')" prop="description" align="left" min-width="200">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { convertToLocalTime } from '@/utils/datetime'
import WorkOrderImage from './WorkOrderImage.vue'
import PriorityTag from './PriorityTag.vue'
import WorkTypeTag from './WorkTypeTag.vue'
import CategoryTag from './CategoryTag.vue'
import RecurrenceTag from './RecurrenceTag.vue'
import StatusTag from './StatusTag.vue'
import WorkOrderActions from './WorkOrderActions.vue'

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
  }
} )

// Emits
const emit = defineEmits( ['expand-change', 'view', 'edit', 'delete'] )

// State
const tableHeight = ref( 300 )
const rootEl = ref( null )

// Computed
const getRowClass = ( { row } ) => {
  return props.expandedRows.has( row.id ) ? 'expanded-highlight' : ''
}

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
</style>
