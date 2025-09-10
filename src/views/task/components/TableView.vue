<template>
  <div class="page-layout">
    <div class="body-container">
      <div class="table-body">
        <el-table :data="tableData" style="width: 100%; margin-bottom: 20px" row-key="id" border height="100%">
          <el-table-column type="expand" fixed>
            <template #default="{ row }">
              <el-table
                v-if="row.task_list && row.task_list.length"
                :data="row.task_list"
                size="small"
                border
                style="width: 85vw; margin-left: 60px"
              >
                <el-table-column fixed prop="task_name" label="Task Name" width="250px" />
                <el-table-column prop="_id" label="Task Code" />
                <el-table-column prop="state" label="State" width="140px" />
                <el-table-column prop="estimated_minutes" label="Estimated Minutes" width="150px" />
                <el-table-column label="Step Count" width="140px">
                  <template #default="{ row }">
                    {{ row.steps.length }}
                  </template>
                </el-table-column>
              </el-table>
              <!-- <ul v-if="row.task_list && row.task_list.length" class="task-list">
                <el-text tag="b">Associated Tasks</el-text>
                <li  v-for="task in row.task_list" v-bind:key="task.id">
                  <el-descriptions border :column="3" style="width:80%;">
                    <el-descriptions-item width='120px'>
                      <template #label>
                        <el-icon><Suitcase /></el-icon> Task
                      </template>
                      {{ task.task_name }}
                    </el-descriptions-item>

                    <el-descriptions-item width='120px'>
                      <template #label>
                        <el-icon><Memo /></el-icon> Task Code
                      </template>
                      {{ task._id }}
                    </el-descriptions-item>

                    <el-descriptions-item width='100px'>
                      <template #label>
                        <el-icon><List /></el-icon> Step Count
                      </template>
                      {{ task.steps?.length || 0 }}
                    </el-descriptions-item>

                    <el-descriptions-item width='120px'>
                      <template #label>
                        <el-icon><Flag /></el-icon> State
                      </template>
                      {{ task.state }}
                    </el-descriptions-item>

                    <el-descriptions-item  width='120px'>
                      <template #label>
                        <el-icon><Timer /></el-icon> Estimated Minutes
                      </template>
                      {{ task.estimated_minutes ?? 'N/A' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </li>
              </ul> -->
              <div v-else style="padding: 10px; color: gray">No tasks available</div>
            </template>
          </el-table-column>
          <el-table-column fixed prop="name" label="Work Order" sortable min-width="200px" />
          <el-table-column prop="code" label="Code" sortable min-width="220px" />
          <el-table-column prop="description" label="Description" sortable min-width="220px" />
          <el-table-column prop="state.name" label="State" sortable width="140px" />
          <el-table-column prop="priority.name" label="Priority" sortable width="140px" />
          <el-table-column prop="recurrence_type.name" label="Recurrence" sortable width="140px" />
          <el-table-column prop="work_type.name" label="Work Type" sortable width="140px" />
          <el-table-column label="Start Date" sortable min-width="180px">
            <template #default="{ row }">
              {{ convertToLocalTime(row.start_date) }}
            </template>
          </el-table-column>
          <el-table-column label="Due Date" sortable min-width="180px">
            <template #default="{ row }">
              {{ convertToLocalTime(row.due_date) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_by" label="Created By" sortable width="140px" />

          <el-table-column label="Creation Date" sortable min-width="180px">
            <template #default="{ row }">
              {{ convertToLocalTime(row.created_at) }}
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
              <el-button
                type="success"
                size="large"
                @click="() => router.push({ name: 'ViewWorkOrder', params: { id: row.id } })"
              >
                View
              </el-button>
              <el-button type="primary" size="large" @click="selectAndAssign($index)"> Assign </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <AssignPersonnel
        v-if="assignPersonnel == true"
        @close="handleCloseRequest"
        :wo="selectedData"
        :personnelList="personnel"
        :supervisorList="supervisor"
        :type="listType"
        from="table"
      />
    </div>
  </div>
</template>

<script setup>
import { workOrdersWithTasks } from '../../../utils'
import { ref, reactive, computed } from 'vue'
import { convertToLocalTime } from '../../../utils/datetime'
import router from '../../../router'
import AssignPersonnel from './AssignPersonnel.vue'

const assignPersonnel = ref(false)

const selectedWorkOrder = ref(null)

const selectedData = computed(() => {
  return workOrdersWithTasks[selectedWorkOrder.value]
})

const listType = ref(2)

const personnel = reactive([
  { id: 1, firstName: 'John', lastName: 'Andrews', assigned: 0, role: 'Technician' },
  { id: 2, firstName: 'Maria', lastName: 'Lopez', assigned: 1, role: 'Supervisor' },
  { id: 3, firstName: 'James', lastName: 'Nguyen', assigned: 0, role: 'Electrician' },
  { id: 4, firstName: 'Sara', lastName: 'Lee', assigned: 0, role: 'Technician' },
  { id: 5, firstName: 'David', lastName: 'Patel', assigned: 0, role: 'Planner' },
  { id: 6, firstName: 'Emily', lastName: 'Martinez', assigned: 0, role: 'Mechanic' },
  { id: 7, firstName: 'Brian', lastName: 'Smith', assigned: 0, role: 'Technician' },
  { id: 8, firstName: 'Olivia', lastName: 'Hernandez', assigned: 0, role: 'Electrician' },
  { id: 9, firstName: 'Daniel', lastName: 'Kim', assigned: 0, role: 'Supervisor' },
  { id: 10, firstName: 'Ava', lastName: 'Brown', assigned: 0, role: 'Planner' },
  { id: 11, firstName: 'William', lastName: 'Clark', assigned: 0, role: 'Technician' },
  { id: 12, firstName: 'Zoey', lastName: 'Duan', assigned: 1, role: 'Mechanic' },
  { id: 13, firstName: 'Logan', lastName: 'Adams', assigned: 0, role: 'Technician' },
  { id: 14, firstName: 'Chloe', lastName: 'Scott', assigned: 0, role: 'Electrician' },
  { id: 15, firstName: 'Henry', lastName: 'Green', assigned: 0, role: 'Supervisor' },
  { id: 16, firstName: 'Isabella', lastName: 'Baker', assigned: 0, role: 'Technician' },
  { id: 17, firstName: 'Erik', lastName: 'Yu', assigned: 1, role: 'Planner' },
  { id: 18, firstName: 'Lily', lastName: 'Turner', assigned: 0, role: 'Mechanic' },
  { id: 19, firstName: 'Justin', lastName: 'Tung', assigned: 1, role: 'Technician' },
  { id: 20, firstName: 'Mia', lastName: 'Parker', assigned: 0, role: 'Supervisor' },
])

const supervisor = reactive([
  { id: 1, firstName: 'Richard', lastName: 'Drew', assigned: 0, role: 'Supervisor' },
  { id: 2, firstName: 'Maria', lastName: 'Lopez', assigned: 0, role: 'Supervisor' },
  { id: 3, firstName: 'Yao', lastName: 'Li', assigned: 1, role: 'Supervisor' },
  { id: 9, firstName: 'Daniel', lastName: 'Kim', assigned: 0, role: 'Supervisor' },
  { id: 15, firstName: 'Henry', lastName: 'Green', assigned: 0, role: 'Supervisor' },
  { id: 20, firstName: 'Mia', lastName: 'Parker', assigned: 0, role: 'Supervisor' },
])

const tableData = ref(workOrdersWithTasks)

function selectAndAssign(rowIdx) {
  selectedWorkOrder.value = rowIdx
  assignPersonnel.value = true
}

function handleCloseRequest() {
  assignPersonnel.value = false
}
</script>

<style scoped>
.page-layout {
  display: flex;
  flex: 1 1 100vh;
  flex-direction: column;
  padding: 10px;
}

.header-title {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 5px;
  margin-right: 12px;
  margin-left: 10px;
  color: #181818;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
}

.body-container {
  /* margin-top: 10px; */
  padding: 5px;
}

.task-list {
  margin: 10px;
  margin-left: 20px;
  width: 50%;
}

.task-list li {
  margin-top: 10px;
  margin-left: 30px;
}
</style>
