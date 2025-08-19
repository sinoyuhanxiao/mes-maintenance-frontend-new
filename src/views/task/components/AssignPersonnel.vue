<template>
  <div class="table-main">
    <div class="table-group">
      <el-card>
        <div class="header-group" v-if="from === 'table'">
          <el-text size="large"
            >Assign Work Order: <span style="font-weight: bold">{{ wo.name }}</span></el-text
          >
          <el-text>Code: {{ wo.code }}</el-text>
        </div>
        <div class="button-header">
          <!-- <el-radio-group v-model="option" style="margin-bottom: 20px; margin-top: 10px">
            <el-radio-button label="1">Option 1</el-radio-button>
            <el-radio-button label="2">Option 2</el-radio-button>
          </el-radio-group> -->

          <el-radio-group v-if="from === 'table'" v-model="listType" style="margin-bottom: 20px; margin-top: 10px">
            <el-radio-button label="2">Supervisor</el-radio-button>
            <el-radio-button label="1">Personnel</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="option === '1'">
          <el-text size="large">Assign Personnel (Option 1)</el-text>
          <el-card style="margin-top: 10px">
            <el-table
              :data="listType === '1' ? personnel : supervisor"
              :height="tableHeight"
              style="width: 100%"
              :row-class-name="tableRowClassName"
              :fit="true"
              :border="true"
            >
              <el-table-column prop="firstName" label="First Name" sortable />
              <el-table-column prop="lastName" label="Last Name" sortable />
              <el-table-column prop="role" label="Role" sortable />
              <el-table-column prop="assigned" label="Assignment Status">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.assigned"
                    class="ml-2"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="Assigned"
                    inactive-text="Unassigned"
                    @change="val => handleAssignChange(val, row)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <div v-if="option === '2'">
          <el-text size="large">Assign Personnel</el-text>
          <el-card style="margin-top: 10px">
            <el-table
              :data="listType === '1' ? personnel : supervisor"
              :height="tableHeight"
              style="width: 100%"
              :fit="true"
              :border="true"
            >
              <el-table-column prop="firstName" label="First Name" sortable />
              <el-table-column prop="lastName" label="Last Name" sortable />
              <el-table-column prop="role" label="Role" sortable />
              <el-table-column prop="assigned" label="Assignment Status">
                <template #default="{ row }">
                  <AssignButton
                    @click="handleAssignChange(row.assigned, row)"
                    v-model:assigned="row.assigned"
                    :woId="wo.id"
                    :personnelId="row.id"
                    align="center"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
        <div class="btn-container">
          <el-button @click="handleClose" type="primary" :icon="Close">Close</el-button>
        </div>
      </el-card>
    </div>
    <!-- <h4>{{ personnel }}</h4> -->
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'
import AssignButton from '../../../components/Tables/Widgets/AssignButton.vue'
import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue'

// eslint-disable-next-line vue/no-setup-props-destructure
const { wo, type, personnelList, supervisorList, from } = defineProps( {
  wo : Object,
  type : Number,
  personnelList : Object,
  supervisorList : Object,
  from : String
} )
console.log( wo )
const personnel = reactive( personnelList )

const listType = ref( String( type ) )

const supervisor = computed( () => {
  return supervisorList
} )

const emit = defineEmits( ['close'] )

const option = ref( '2' )

const tableHeight = ref( 537 )

const tableRowClassName = ( { row } ) => {
  if ( row.assigned === 1 ) {
    return 'success-row'
  }
  return ''
}

function handleClose() {
  emit( 'close', false )
}

onMounted( () => {
  updateTableHeight()
  window.addEventListener( 'resize', updateTableHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateTableHeight )
} )

function updateTableHeight() {
  const windowHeight = window.innerHeight

  if ( windowHeight < 800 ) {
    tableHeight.value = 322
  }
}

function handleAssignChange( val, currentRow ) {
  if ( type !== 1 ) {
    if ( val === 1 ) {
      // Set all to 0 except the current row
      supervisor.value.forEach( item => {
        item.assigned = item === currentRow ? 1 : 0
      } )
    } else {
      // If you toggle off the current row, allow it to be unassigned
      currentRow.assigned = 0
    }
  }
}
</script>

<style scoped>
::v-deep(.success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.header-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.table-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}

.table-group {
  flex: 1;
}

.btn-container {
  flex-direction: row;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.button-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
