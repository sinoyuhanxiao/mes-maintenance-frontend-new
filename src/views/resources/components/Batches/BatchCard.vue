<template>
  <div class="main-card">
    <div class="left-container">
      <div>
        <el-text type="primary">Batch ID: #{{ batch.id }}</el-text>
      </div>
      <div class="description-container">
        <el-descriptions :column="1" direction="horizontal" labelWidth="105px">
          <el-descriptions-item label="Batch Number:">{{ batch.batch_number }}</el-descriptions-item>
          <el-descriptions-item label="Created At:">{{ convertToLocalTime(batch.created_at) }}</el-descriptions-item>
          <el-descriptions-item v-if="batch.updated_at" label="Last Updated At:">{{
            convertToLocalTime(batch.updated_at)
          }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <div class="middle-container">
      <el-descriptions :column="2" direction="vertical" style="max-width: 25vw">
        <el-descriptions-item label="Batch Size" width="10vw"
          >{{ props.addStock ? batch.unit_in_stock + ' (+' + props.addStock + ')' : batch.unit_in_stock }}
        </el-descriptions-item>
        <el-descriptions-item label="Location">
          <el-breadcrumb>
            <el-breadcrumb-item v-for="loc in locationTree" :key="loc.id">{{ loc.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { convertToLocalTime } from '../../../../utils/datetime'
import { ref, watch } from 'vue'
import { getLocationPathById } from '../../../../api/location'

const props = defineProps({
  data: Object,
  addStock: Number,
})

const batch = ref(props.data)

const locationTree = ref(null)

async function getLocationTreeData() {
  const response = await getLocationPathById(batch.value.location_id)

  locationTree.value = response.data
  // console.log( locationTree.value )
}

getLocationTreeData()

watch(
  () => props.data,
  newVal => {
    batch.value = newVal
    getLocationTreeData()
  },
  { deep: true }
)
</script>

<style scoped>
.main-card {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 2rem;
  flex: 1;
}

.middle-container {
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  flex: 1 1;
}

.left-container {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 50%;
}

.description-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
