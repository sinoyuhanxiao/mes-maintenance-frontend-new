<template>
  <div class="table-container">
    <div class="toolbar">
      <el-input v-model="q" clearable placeholder="Search" @clear="emitSearch" @input="emitSearch">
        <template #prefix
          ><el-icon><Search /></el-icon
        ></template>
      </el-input>
    </div>

    <div class="card-scroll" v-loading="loading">
      <template v-if="items && items.length">
        <el-row :gutter="8">
          <el-col v-for="t in items" :key="t.id" :xs="24" :sm="24" :md="24" :lg="24">
            <el-card class="task-card" shadow="hover" @click="handlePick(t)">
              <div class="title">{{ t.name || 'Untitled Task' }}</div>
              <div class="meta">
                <el-tag size="small">Equipment: {{ t.equipment_node.name }}</el-tag>
                <span>{{ t.total_steps ?? 0 }} Steps</span>
                <span>Estimate: {{ Math.round((t.time_estimate_sec ?? 0) / 60) }} min</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <el-empty v-else description="No related task templates available." :image-size="80" />
    </div>

    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      :pager-count="3"
      @current-change="onPageChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

defineProps( {
  items : { type : Array, default : () => [] },
  pageSize : { type : Number, default : 6 },
  totalItems : { type : Number, default : 0 },
  currentPage : { type : Number, default : 1 },
  loading : { type : Boolean, default : false }
} )

const emit = defineEmits( ['page-change', 'requestData', 'search'] )

const q = ref( '' )

function onPageChange( p ) {
  emit( 'page-change', p )
}
function handlePick( t ) {
  emit( 'requestData', t )
}
function emitSearch() {
  emit( 'search', q.value.trim() )
}
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
}
.toolbar {
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.card-scroll {
  padding: 6px;
  min-height: 220px;
}
.task-card {
  margin-bottom: 8px;
  cursor: pointer;
}
.title {
  margin-bottom: 10px;
}
.desc {
  color: #666;
  margin-bottom: 6px;
}
.meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}
.pagination {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}
</style>
