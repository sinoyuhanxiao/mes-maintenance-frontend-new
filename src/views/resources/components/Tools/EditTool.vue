<template>
  <el-card>
    <div class="details-layout">
      <div>
        <el-text tag="b">General Details</el-text>
        <hr />
      </div>
      <el-form ref="ruleFormRef" :model="inputData" :rules="rules" label-width="120px">
        <el-form-item style="flex: 1" label="Tool Name" prop="name"
          ><el-input
            clearable
            v-model="inputData.name"
            placeholder="Please input Tool Name"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <!-- Code Input -->
        <el-form-item style="flex: 1" label="Tool Code" prop="code"
          ><el-input
            clearable
            v-model="inputData.code"
            placeholder="Please input Tool Code"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <el-form-item style="flex: 1" label="Description" prop="description"
          ><el-input
            clearable
            v-model="inputData.description"
            placeholder="Please Describe Tool"
            style="width: 99%"
            type="textarea"
          ></el-input
        ></el-form-item>

        <!-- Category Input  -->
        <el-form-item label="Tool Class" prop="tool_class_id">
          <el-select v-model="inputData.tool_class_id" style="width: 99%">
            <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-text tag="b">Upload Image(s)</el-text>
        <hr />
      </el-form>
      <!-- Submit Button  -->
    </div>
    <div class="submit-button" @click="editTool">
      <el-form-item><el-button type="primary">Update Tool</el-button></el-form-item>
    </div>
  </el-card>
  <!-- <h1>{{ inputData }}</h1> -->
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getAllToolClasses } from '../../../../api/resources'
const props = defineProps({
  data: Object,
})

const emit = defineEmits(['editTool'])

const toolClasses = ref(null)

const inputData = ref(props.data)

watch(
  () => props.data,
  newVal => {
    inputData.value = newVal
  },
  { deep: true }
)

async function getToolClasses() {
  const response = await getAllToolClasses()

  toolClasses.value = response.data
}

getToolClasses()

// Form rules
const rules = reactive({
  name: [{ required: true, message: 'Please input Name', trigger: 'blur' }],
  code: [{ required: true, message: 'Please enter Code' }],
  tool_class_id: [{ required: true, message: 'Please select Tool Class' }],
})

function editTool() {
  emit('editTool', inputData.value)
}
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
  /* max-height: 580px; */
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

.form-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.form-section .el-form-item {
  width: 50vw;
}

.submit-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}

@media (max-width: 1600px) {
  .details-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    /* height: 420px; */
  }
}
</style>
