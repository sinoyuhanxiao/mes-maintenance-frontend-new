<template>
  <div class="page-layout">
    <el-dialog
      v-model="newToolActive"
      title="New Tool"
      width="800"
      top="5vh"
      @close="
        () => {
          ;(newToolActive = false), emit('close')
        }
      "
    >
      <NewTool @createTool="handleCreate" />
    </el-dialog>

    <el-dialog
      v-model="editToolActive"
      title="Update Tool"
      width="800"
      top="5vh"
      @close="
        () => {
          editToolActive = false
        }
      "
    >
      <EditTool @editTool="handleEdit" :data="selectedTool" />
    </el-dialog>

    <el-dialog v-model="deleteActive" title="Confirm Tool Deletion" width="450px">
      <ConfirmDeletion :data="selectedTool" @emitDeleteTool="handleDelete" @close="deleteActive = false" />
    </el-dialog>

    <div class="table-body">
      <el-table :data="tools" :style="{ width: '100%', height: maxHeight }" border>
        <el-table-column width="110px">
          <template #default="{ row }">
            <el-image v-if="row.image_list.length > 0" :src="row.image_list" style="width: 80px" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" sortable />
        <el-table-column prop="code" label="Code" sortable />
        <el-table-column prop="description" label="Description" width="300px" />
        <el-table-column prop="tool_class.name" label="Tool Class" sortable />
        <el-table-column label="Last Updated" sortable>
          <template #default="{ row }">
            {{ row.updated_at ? convertToLocalTime(row.updated_at) : null }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_by" label="Updated By" sortable />

        <!-- Actions -->
        <el-table-column
          :label="$t('workOrder.table.actions')"
          align="center"
          width="250"
          class-name="small-padding fixed-width action-column"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button :icon="EditPen" type="success" size="large" @click="editTool(row)">Edit </el-button>
            <el-button :icon="Delete" type="danger" size="large" @click="selectDeleteTool(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="prev, pager, next"
        :current-page="listQuery.page"
        :page-size="listQuery.size"
        :total="totalItems"
        :pager-count="3"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import { convertToLocalTime } from '../../../../utils/datetime'
import { EditPen, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import NewTool from './NewTool.vue'
import EditTool from './EditTool.vue'
import ConfirmDeletion from './ConfirmDeletion.vue'
import { searchTools, createTool, updateTool, deleteTool } from '../../../../api/resources'

const props = defineProps({
  newTool: Boolean,
  keyword: String,
})

const emit = defineEmits(['close'])

const newToolActive = ref(props.newTool)
const editToolActive = ref(false)
const deleteActive = ref(false)

const selectedTool = ref(null)

watch(
  () => props.newTool,
  newVal => {
    newToolActive.value = newVal
  }
)

const maxHeight = ref('737px')
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : maxHeight.value
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight)
})

const apiSuccess = (header, name) => {
  console.log(header + name)
  ElMessage({
    message: header + name,
    type: 'success',
  })
}

const listQuery = reactive({
  page: 1,
  size: 20,
})

const search = ref({ keyword: null })

const tools = ref(null)
const totalItems = ref(null)

async function getToolsData() {
  const response = await searchTools(listQuery.page, listQuery.size, 'name', 'ASC', search.value)

  tools.value = response.data.content
  totalItems.value = response.data.totalElements
}

getToolsData()

watch(
  () => props.keyword,
  newVal => {
    search.value.keyword = newVal
    getToolsData()
  }
)

async function handleCreate(data) {
  try {
    const create = await createTool(data)
    if (create.status == 200) {
      apiSuccess('Tool Created: ', create.data.name)
      emit('close')
      getToolsData()
    }
  } catch (err) {
    console.log('Failed to create tool', err)
  }
}

async function handleEdit(data) {
  try {
    const update = await updateTool(data)
    if (update.status == 200) {
      apiSuccess('Tool Updated: ', data.name)
      editToolActive.value = false
      getToolsData()
    }
  } catch (err) {
    console.log('Failed to update tool', err)
  }
}

async function handleDelete(data) {
  // try {
  await deleteTool(data.id)
  console.log(data)
  apiSuccess('Tool Deleted: ', data.name)
  deleteActive.value = false
  getToolsData()
  // } catch ( err ) {
  //   console.log( 'Failed to delete tool', err )
  // }
}

function editTool(row) {
  row.tool_class_id = row.tool_class.id
  selectedTool.value = row
  editToolActive.value = true
}

function selectDeleteTool(row) {
  selectedTool.value = row
  deleteActive.value = true
  // apiSuccess( 'Tool Deleted: ', row.name )
}

const handleCurrentChange = val => {
  listQuery.page = val
  getToolsData()
}
</script>

<style scoped>
.page-layout {
  padding: 5px;
}

.pagination {
  margin-top: 5px;
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
}
</style>
