<template>
  <div class="lot-transaction-table">
    <!-- Table Header -->
    <div class="transaction-table-header">
      <el-input
        v-model="searchInput"
        placeholder="Search by ID or remark"
        clearable
        class="table-search-input"
        prefix-icon="Search"
      />

      <el-select v-model="selectedType" placeholder="Filter by type" clearable filterable class="table-type-select">
        <el-option v-for="type in transactionTypeOptions" :key="type.id" :label="type.name" :value="type.id" />
      </el-select>
    </div>

    <!-- Table Content -->
    <div class="lot-table-wrapper">
      <el-table :data="paginatedData" border size="small" style="width: 100%; height: 100%">
        <template #empty>
          <el-empty :description="'No Transaction Record'" :image-size="60" />
        </template>

        <el-table-column label="Transaction ID" sortable prop="id" width="150" align="center" />

        <el-table-column label="Transaction Type" sortable prop="transaction_type.name" width="180" align="center" />

        <el-table-column label="Quantity" sortable prop="quantity_change" width="120" align="center" />

        <el-table-column label="From Lot" prop="from_inventory.id" align="center">
          <template #default="{ row }">
            {{ row.from_inventory?.id ?? '-' }}
          </template>
        </el-table-column>

        <el-table-column label="To Lot" prop="to_inventory.id" align="center">
          <template #default="{ row }">
            {{ row.to_inventory?.id ?? '-' }}
          </template>
        </el-table-column>

        <el-table-column label="Remark" prop="remark" width="250" align="center">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="Created At" sortable prop="created_at" width="200" align="center">
          <template #default="{ row }">
            {{ formatAsLocalDateTimeString(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 10" class="transaction-table-footer">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        background
        small
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAllTransactionTypes } from '@/api/resources'
import { ElMessage } from 'element-plus'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

// Reactive state
const searchInput = ref( '' )
const selectedType = ref( null )
const currentPage = ref( 1 )
const currentPageSize = ref( 10 )
const TRANSACTION_TYPE = ref( {} )
const transactionTypeOptions = ref( [] )
const props = defineProps( {
  inventory_transaction_logs : {
    type : Array,
    required : true
  }
} )

const filteredData = computed( () => {
  let data = props.inventory_transaction_logs || []

  // Filter by search text (match id or remark)
  if ( searchInput.value.trim() ) {
    const keyword = searchInput.value.toLowerCase()
    data = data.filter(
      item => String( item.id ).includes( keyword ) || ( item.remark && item.remark.toLowerCase().includes( keyword ) )
    )
  }

  // Filter by transaction type
  if ( selectedType.value ) {
    data = data.filter( item => item.transaction_type?.id === selectedType.value )
  }

  return data
} )

const totalCount = computed( () => filteredData.value.length )

const paginatedData = computed( () => {
  const start = ( currentPage.value - 1 ) * currentPageSize.value
  const end = start + currentPageSize.value
  return filteredData.value.slice( start, end )
} )

function handlePageChange( page ) {
  currentPage.value = page
}
function handlePageSizeChange( size ) {
  currentPageSize.value = size
  currentPage.value = 1
}

async function loadTransactionType() {
  try {
    const res = await getAllTransactionTypes()
    const types = res.data.filter( type => type.status === 1 )

    transactionTypeOptions.value = types

    // Build runtime enum-like map
    TRANSACTION_TYPE.value = Object.fromEntries(
      types.map( t => [
        t.name.toUpperCase().replace( /\s+/g, '_' ), // e.g. "Receive From Vendor" → "RECEIVE_FROM_VENDOR"
        t.id
      ] )
    )
  } catch ( e ) {
    console.error( 'Failed to load transaction type: ', e )
    ElMessage.error( 'Error loading transaction types' )
  }
}

onMounted( async() => {
  await loadTransactionType()
} )
</script>

<style scoped>
.lot-transaction-table {
  width: 1080px;
  height: 450px;
  box-sizing: border-box;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.transaction-table-header {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.table-search-input {
  flex: 1;
}

.table-type-select {
  flex: 1;
}

.lot-table-wrapper {
  flex: 8;
  width: 100%;
  overflow-x: auto;

  /* Force the Element Plus table to fill the container */
  .lot-table-wrapper :deep(.el-table) {
    height: 100%;
  }
}

.transaction-table-footer {
  display: flex;
  flex: 1;
  flex-shrink: 0;
  justify-content: center;
  padding-top: 10px;
}
</style>
