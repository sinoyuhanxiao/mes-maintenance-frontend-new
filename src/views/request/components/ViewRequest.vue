<template>
  <div class="details-layout">
    <div>
      <div style="display: flex; flex-direction: row; justify-content: space-between">
        <el-text size="large" tag="b">Request: {{ localData.name }}</el-text>
        <el-button @click="() => emit('create', localData)">Create Work Order</el-button>
      </div>
      <hr />
    </div>

    <div class="details-panel">
      <el-descriptions :column="localData.work_order_id ? 3 : 2" direction="vertical">
        <el-descriptions-item v-if="localData.work_order_id" label="Work Order ID">{{
          localData.work_order_id
        }}</el-descriptions-item>
        <el-descriptions-item label="Created By">{{ localData.created_by }}</el-descriptions-item>
        <el-descriptions-item label="Created At">{{ convertToLocalTime(localData.created_at) }}</el-descriptions-item>

        <el-descriptions-item label="Description"
          ><span>{{ localData.description }} </span></el-descriptions-item
        >
      </el-descriptions>

      <div class="displays">
        <el-card>
          <el-text tag="b">Related Assets</el-text>
          <hr />
          <el-breadcrumb :separator-icon="ArrowRight" style="padding-top: 10px">
            <el-breadcrumb-item v-for="en in localData.equipment_node_tree" :key="en.id" :label="en.name">
              {{ en.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>
      </div>

      <div class="displays">
        <el-card>
          <el-text tag="b">Related Images</el-text>
          <hr />
          <el-image
            v-if="localData.image_list"
            :src="localData.image_list"
            style="border-radius: 100%; max-height: 150px; aspect-ratio: 1/0.75"
          />
          <el-text v-if="!localData.image_list">No Attached Images</el-text>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { convertToLocalTime } from '../../../utils/datetime'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps( {
  data : Object
} )

const emit = defineEmits( ['create'] )

const localData = ref( props.data )

watch(
  () => props.data,
  newData => {
    localData.value = { ...newData }
    console.log( localData.value )
  },
  { immediate : true, deep : true }
)
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.details-panel {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  flex: 1;
  gap: 1rem;
}

.displays {
  margin-top: 10px;
}

@media (max-width: 800px) {
  .details-layout {
    height: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
  }
}
</style>
