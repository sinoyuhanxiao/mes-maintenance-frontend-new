<template>
  <div class="lot-transaction-timeline">
    <!-- Header (search + type filter) -->
    <div class="timeline-header">
      <el-input
          v-model="searchInput"
          placeholder="Search by ID or remark"
          clearable
          class="timeline-search-input"
          prefix-icon="Search"
      />

      <el-select
          v-model="selectedType"
          placeholder="Filter by type"
          clearable
          filterable
          class="timeline-type-select"
      >
        <el-option
            v-for="type in transactionTypeOptions"
            :key="type.id"
            :label="type.name"
            :value="type.id"
        />
      </el-select>
    </div>

    <!-- TIMELINE VIEW -->
    <div class="timeline-content">
      <el-timeline>
        <el-timeline-item
            v-for="tx in paginatedData"
            :key="tx.id"
            :timestamp="formatAsLocalDateTimeString(tx.created_at)"
            placement="top"
        >
          <!-- Custom hollow dot -->
          <template #dot>
            <div class="timeline-dot">
              <el-icon
                  :class="['timeline-dot-icon', getIconClass(tx.transaction_type?.id)]"
              >
                <component :is="getNodeIcon(tx.transaction_type?.id)" />
              </el-icon>
            </div>
          </template>

          <div class="timeline-entry">
            <div class="timeline-text">
              {{ formatTransaction(tx).text }}
            </div>

            <div
                v-if="tx.remark"
                class="timeline-remark"
            >
              Remark: {{ tx.remark }}
            </div>
          </div>
        </el-timeline-item>

        <template v-if="paginatedData.length === 0">
          <el-empty description="No Transaction Record" :image-size="60" />
        </template>
      </el-timeline>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > 10" class="timeline-footer">
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
import {
  Top, Bottom, Sort, Edit
} from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { getAllTransactionTypes } from '@/api/resources'
import { ElMessage } from 'element-plus'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

// props
const props = defineProps( {
  inventory_transaction_logs : {
    type : Array,
    required : true
  }
} )

/* -------------------------
   FILTER & PAGINATION STATE
-------------------------- */
const searchInput = ref( '' )
const selectedType = ref( null )
const currentPage = ref( 1 )
const currentPageSize = ref( 10 )

const transactionTypeOptions = ref( [] )

/* -------------------------
   LOAD TRANSACTION TYPES
-------------------------- */
async function loadTransactionType() {
  try {
    const res = await getAllTransactionTypes()
    const types = res.data.filter( t => t.status === 1 )

    transactionTypeOptions.value = types
  } catch ( e ) {
    console.error( 'Failed to load transaction type: ', e )
    ElMessage.error( 'Error loading transaction types' )
  }
}

onMounted( loadTransactionType )

/* -------------------------
   FILTERED DATA
-------------------------- */
const filteredData = computed( () => {
  let data = props.inventory_transaction_logs || []

  // search by ID or remark
  if ( searchInput.value.trim() ) {
    const keyword = searchInput.value.toLowerCase()
    data = data.filter(
      item =>
        String( item.id ).includes( keyword ) ||
            ( item.remark && item.remark.toLowerCase().includes( keyword ) )
    )
  }

  // filter by type ID
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

/* -------------------------
   EVENT HANDLERS
-------------------------- */
function handlePageChange( page ) {
  currentPage.value = page
}
function handlePageSizeChange( size ) {
  currentPageSize.value = size
  currentPage.value = 1
}

/* -------------------------
   TIMELINE ICON LOGIC
-------------------------- */
function getNodeIcon( typeId ) {
  switch ( typeId ) {
    case 101: // Restock
      return Top
    case 104: // Transfer
      return Sort
    case 106: // Inventory created
    case 107: // Inventory updated
      return Edit
    case 102: // Return
    case 103: // Use in maintenance
    case 105: // Discard
      return Bottom
    default:
      return Bottom
  }
}

function getIconClass( typeId ) {
  switch ( typeId ) {
    case 101: return 'icon-green' // Restock
    case 104: return 'icon-orange' // Transfer
    case 106:
    case 107: return 'icon-blue' // Create / Update
    case 102:
    case 103:
    case 105: return 'icon-red' // Remove / Use / Discard
    default: return 'icon-gray'
  }
}

/* -------------------------
   Transaction Description Format
-------------------------- */
function formatTransaction( tx ) {
  const user = `${tx.created_by?.first_name ?? ''} ${tx.created_by?.last_name ?? ''}`.trim()
  const qty = tx.quantity_change
  const fromInv = tx.from_inventory
  const toInv = tx.to_inventory
  const typeId = tx.transaction_type?.id
  const typeName = tx.transaction_type?.name || ''
  const fromLoc = fromInv?.location
  const toLoc = toInv?.location

  /* -------------------------
     104 — TRANSFER(Move Between Lots)
  -------------------------- */
  if ( typeId === 104 && fromInv && toInv ) {
    return {
      text : `${user} transferred ${qty} units from inventory #${fromInv.id} at ${fromLoc?.name} (${fromLoc?.code}) to inventory #${toInv.id} at ${toLoc?.name} (${toLoc?.code})`
    }
  }

  /* -------------------------
     101 — ADD STOCK(Receive from Vendor)
  -------------------------- */
  if ( typeId === 101 ) {
    return {
      text : `${user} added ${qty} units to inventory #${toInv?.id ?? fromInv?.id ?? 'Unknown'} at ${toLoc?.name ?? fromLoc?.name ?? 'Unknown'} (${toLoc?.code ?? fromLoc?.code ?? 'N/A'})`
    }
  }

  /* -------------------------
     102 / 105 — REMOVE STOCK(Return to Vendor, Discard)
  -------------------------- */
  if ( typeId === 102 || typeId === 105 ) {
    return {
      text : `${user} removed ${Math.abs( qty )} units from inventory #${fromInv?.id} at ${fromLoc?.name} (${fromLoc?.code})`
    }
  }

  /* -------------------------
     103 — USE IN MAINTENANCE (WORK ORDER COMPLETION)
     Placeholder until real work order data is available
  -------------------------- */
  if ( typeId === 103 ) {
    return {
      text : `${user} completed maintenance work. ${Math.abs( qty )} units removed from inventory #${fromInv?.id} at ${fromLoc?.name} (${fromLoc?.code})`
    }
  }

  /* -------------------------
   106 — INVENTORY CREATED
-------------------------- */
  if ( typeId === 106 ) {
    return {
      text : `${user} created inventory #${toInv?.id ?? 'Unknown'} with initial quantity ${qty} units at ${toLoc?.name} (${toLoc?.code})`
    }
  }

  /* -------------------------
   107 — INVENTORY UPDATED
-------------------------- */
  if ( typeId === 107 ) {
    return {
      text : `${user} updated available quantity to ${qty} units for inventory #${toInv?.id ?? 'Unknown'} at ${toLoc?.name} (${toLoc?.code})`
    }
  }

  /* -------------------------
     FALLBACK
  -------------------------- */
  return {
    text : `${user} performed a transaction (${typeName}): ${tx.remark ?? ''}`
  }
}

</script>

<style scoped>
.lot-transaction-timeline {
  height: 450px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.timeline-search-input,
.timeline-type-select {
  flex: 1;
}

.timeline-content {
  flex: 8;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.timeline-entry {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.4;
}

.timeline-footer {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* Hollow circle */
.timeline-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
}

/* Icon sizing */
.timeline-dot-icon {
  font-size: 14px;
}

/* Semantic icon colors */
.icon-green  { color: var(--el-color-success); }
.icon-red    { color: var(--el-color-danger); }
.icon-orange { color: var(--el-color-warning); }
.icon-blue   { color: var(--el-color-primary); }
.icon-gray   { color: var(--el-text-color-secondary); }

/* Optional: remark styling */
.timeline-remark {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* Align timeline tail with larger dot */
:deep(.el-timeline-item__tail) {
  left: 12px; /* was 4px */
}

/* Add more left padding so content lines up */
:deep(.el-timeline-item__wrapper) {
  padding-left: 40px; /* was 28px */
}
</style>
