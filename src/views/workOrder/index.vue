<template>
  <MesLayout :title="$t('workOrder.title')" :subtitle="$t('workOrder.subtitle')">
    <!-- HEADER: Filters Section -->
    <template #head>
      <div>
        <WorkOrderFilters
          v-model="listQuery"
          :export-loading="downloadLoading"
          class="work-order-filters"
          @search="handleFilter"
          @create="handleCreate"
          @export="handleDownload"
        />
      </div>
    </template>

    <!-- BODY: Table Section -->
    <template #body>
      <WorkOrderTable
        :data="list"
        :loading="listLoading"
        :expanded-rows="expandedRows"
        :load-children="loadChildren"
        class="work-order-table"
        @expand-change="toggleRowHighlight"
        @view="handleView"
        @edit="handleUpdate"
        @delete="handleDelete"
      />
    </template>

    <!-- FOOTER: Pagination Section -->
    <template #foot>
      <div>
        <el-pagination
          :total="total"
          :hide-on-single-page="true"
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MesLayout from 'src/components/MesLayout'
import WorkOrderFilters from '@/components/WorkOrder/WorkOrderFilters.vue'
import WorkOrderTable from '@/components/WorkOrder/WorkOrderTable.vue'
import { useWorkOrder } from '@/composables/useWorkOrder'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Composables
const router = useRouter()
const { t } = useI18n()
const { showSuccess } = useErrorHandler()

// Work Order composable
const {
  loading : listLoading,
  list,
  total,
  listQuery,
  expandedRows,
  fetchWorkOrders,
  loadChildren,
  handleFilter,
  handleSizeChange,
  handleCurrentChange,
  toggleRowHighlight,
  handleDelete : deleteWorkOrder,
  initializeCommonData
} = useWorkOrder()

// State
const downloadLoading = ref( false )

// Methods
const handleView = row => {
  router.push( { name : 'ViewWorkOrder', params : { id : row.id }} )
}

const handleCreate = () => {
  router.push( { name : 'NewWorkOrder' } )
}

const handleUpdate = row => {
  console.log( 'Edit work order:', row )
}

const handleDelete = async( row, index ) => {
  try {
    await deleteWorkOrder( row, index )
    showSuccess( t( 'workOrder.messages.deleteSuccess' ) )
  } catch ( error ) {
    console.error( 'Delete failed:', error )
  }
}

const handleDownload = () => {
  console.log( 'Download work orders' )
}

// Lifecycle
onMounted( async() => {
  try {
    await initializeCommonData()
    await fetchWorkOrders()
  } catch ( error ) {
    console.error( 'Failed to initialize work order page:', error )
  }
} )

defineOptions( {
  name : 'WorkOrderManagement'
} )
</script>

<style scoped lang="scss"></style>
