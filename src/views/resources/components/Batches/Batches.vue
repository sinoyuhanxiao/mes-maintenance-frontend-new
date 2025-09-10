<template>
  <div class="title">
    <el-text>Associated Batches ({{ batches.length }})</el-text>
    <el-button @click="newBatch(b)">New Batch</el-button>
  </div>
  <div class="main-container-b">
    <el-row :gutter="0" style="gap: 0.5rem">
      <el-col v-for="b in batches" :key="b.id" :xs="24" :sm="24" :md="24" :lg="24">
        <el-card>
          <div class="outer">
            <BatchCard :data="b" />
            <div class="button-container">
              <div><el-button :icon="EditPen" type="success" @click="updateBatch(b)">Edit</el-button></div>
              <div>
                <el-button @click="transferBatch(b)" type="primary"
                  >Transfer <el-icon><DArrowRight /></el-icon
                ></el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" title="Transfer Batch" width="1000" top="5vh">
      <BatchTransfer :batches="batches" :data="selectedBatch" :key="selectedBatch.id" @transfer="handleTransfer" />
    </el-dialog>
    <el-dialog v-model="newBatchVisible" title="New Batch" width="700">
      <NewBatch :sparePart="props.sparePart" @newBatch="handleNewBatch" />
    </el-dialog>
    <el-dialog v-model="editVisible" title="Edit Batch" width="700">
      <EditBatch :sparePart="props.sparePart" :data="selectedBatch" @updateBatch="hanldeUpdateBatch" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DArrowRight, EditPen } from '@element-plus/icons-vue'
import BatchCard from './BatchCard.vue'
import BatchTransfer from './BatchTransfer.vue'
import NewBatch from './NewBatch.vue'
import { ElMessage } from 'element-plus'
import { searchInventory } from '../../../../api/resources'
import EditBatch from './EditBatch.vue'

const props = defineProps({
  sparePart: Object,
})

const dialogVisible = ref(false)
const newBatchVisible = ref(false)
const editVisible = ref(false)

// const batches = ref( [
//   {
//     id : 47,
//     location_id : 28,
//     quantity : 2,
//     created_at : '2024-09-10T20:49:08.353Z',
//     created_by : 47,
//     updated_at : '2024-09-10T20:49:23.945Z',
//     updated_by : 47,
//     status : 0,
//     item_id : 114,
//     inventory_type_id : 3,
//     age_status : null
//   },
//   {
//     id : 49,
//     location_id : 28,
//     quantity : 7,
//     created_at : '2024-09-10T21:02:10.866Z',
//     created_by : 43,
//     updated_at : null,
//     updated_by : null,
//     status : 0,
//     item_id : 114,
//     inventory_type_id : 3,
//     age_status : null
//   },
//   {
//     id : 45,
//     location_id : 28,
//     quantity : 5,
//     created_at : '2024-09-10T20:26:27.810Z',
//     created_by : 43,
//     updated_at : null,
//     updated_by : null,
//     status : 0,
//     item_id : 114,
//     inventory_type_id : 3,
//     age_status : null
//   },
//   {
//     id : 48,
//     location_id : 28,
//     quantity : 1,
//     created_at : '2024-09-10T20:49:23.971Z',
//     created_by : 47,
//     updated_at : '2024-10-22T20:03:00.486Z',
//     updated_by : 43,
//     status : 0,
//     item_id : 114,
//     inventory_type_id : 3,
//     age_status : null
//   },
//   {
//     id : 186,
//     location_id : 49,
//     quantity : 3,
//     created_at : '2024-10-22T20:03:00.515Z',
//     created_by : 43,
//     updated_at : null,
//     updated_by : null,
//     status : 1,
//     item_id : 114,
//     inventory_type_id : 3,
//     age_status : null
//   }
// ] )

const batches = ref([])

const search = ref({
  material_type_id: 3,
  material_id: null,
})

async function getInventory() {
  const response = await searchInventory(1, 20, 'id', 'ASC', search.value)

  batches.value = response.data.content
}

getInventory()

watch(
  () => props.sparePart,
  newVal => {
    search.value.material_id = newVal.id
    getInventory()
  },
  { deep: true }
)

const batchSubmitted = () => {
  ElMessage({
    message: 'Batch Created',
    type: 'success',
  })
}

const batchTransfered = () => {
  ElMessage({
    message: 'Inventory Transferred',
    type: 'success',
  })
}

const batchUpdated = () => {
  ElMessage({
    message: 'Inventory Updated',
    type: 'success',
  })
}

const selectedBatch = ref(null)

watch(
  () => batches.value,
  newVal => {
    selectedBatch.value = batches.value[0]
  },
  { deep: true }
)

function updateBatch(batch) {
  selectedBatch.value = batch
  console.log(selectedBatch.value)
  editVisible.value = true
}

function transferBatch(batch) {
  selectedBatch.value = batch
  console.log(selectedBatch.value)
  dialogVisible.value = true
}

function newBatch(batch) {
  selectedBatch.value = batch
  newBatchVisible.value = true
}

function handleNewBatch(response) {
  newBatchVisible.value = false
  batchSubmitted()
  getInventory()
}

function handleTransfer(response) {
  dialogVisible.value = false
  batchTransfered()
  getInventory()
}

function hanldeUpdateBatch(response) {
  editVisible.value = false
  batchUpdated()
  getInventory()
}
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
}

.main-container-b {
  overflow-y: auto;
  height: 582px;
  /* margin-right: 50px; */
  padding: 5px;
}

.outer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: top;
}

.main-card {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 2rem;
  flex: 1;
}

.left-container {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 40%;
}

.description-container {
  display: flex;
  flex-direction: column;
}

.button-container {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

@media (max-width: 1600px) {
  .main-container-b {
    overflow-y: auto;
    height: 367px;
    /* margin-right: 10px; */
    padding: 5px;
  }

  .main-card {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 0.5rem;
    flex: 1;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 120px;
  }

  .button-container .el-button {
    width: 80px;
  }
}
</style>
