<template>
  <div class="work-order-standard-selector">
    <div class="standard-cards-container" :class="{ 'with-border': showBorder }">
      <el-row :gutter="0">
        <el-col v-for="standard in data" :key="standard.id" :xs="24" :sm="24" :md="24" :lg="24">
          <AddNewStandardCard
            :template="standard"
            :selected="selectedItems?.has?.(standard.id) || false"
            :focused="focusedCardId === standard.id"
            @selection="handleSelection"
          />
        </el-col>
      </el-row>
    </div>

    <el-pagination
      v-if="showPagination"
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      :pager-count="3"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import AddNewStandardCard from '@/components/Tables/Cards/AddNewStandardCard.vue'

const props = defineProps( {
  data : {
    type : Array,
    default : () => []
  },
  selectedItems : {
    type : Set,
    default : () => new Set()
  },
  focusedCardId : {
    type : [String, Number],
    default : null
  },
  currentPage : {
    type : Number,
    default : 1
  },
  pageSize : {
    type : Number,
    default : 20
  },
  totalItems : {
    type : Number,
    default : 0
  },
  maxHeight : {
    type : String,
    default : '60vh'
  },
  showBorder : {
    type : Boolean,
    default : true
  },
  showPagination : {
    type : Boolean,
    default : true
  }
} )

const emit = defineEmits( ['selection', 'page-change'] )

function handleSelection( data ) {
  emit( 'selection', data )
}

function handlePageChange( page ) {
  emit( 'page-change', page )
}
</script>

<style scoped lang="scss">
.work-order-standard-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.standard-cards-container {
  height: v-bind(maxHeight);
  max-height: v-bind(maxHeight);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px;
  border-radius: 6px;
  flex: 1;
  min-height: 0;

  &.with-border {
    border: 1px solid #e4e7ed;
  }

  :deep(.el-row) {
    width: 100%;
    margin: 0 !important;
  }

  :deep(.el-col) {
    padding: 0 !important;
  }

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 3px;

    &:hover {
      background: var(--el-fill-color-darker);
    }
  }
}

.pagination {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
</style>
