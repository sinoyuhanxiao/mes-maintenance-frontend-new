<template>
  <div class="page-layout">
    <!-- Add -->
    <el-dialog
      draggable
      close-on-click-modal="true"
      v-model="newToolActive"
      title="Add New Tool"
      width="600"
      top="5vh"
      @close="
        () => {
          ;(newToolActive = false), emit('close')
        }
      "
    >
      <NewTool @createTool="handleCreate" />
    </el-dialog>

    <!-- Edit -->
    <el-dialog
      draggable
      close-on-click-modal="true"
      v-model="editToolActive"
      title="Edit Tool"
      width="600"
      top="5vh"
      @close="
        () => {
          editToolActive = false
        }
      "
    >
      <EditTool @editTool="handleEdit" :data="selectedTool" />
    </el-dialog>

    <!-- Deactivate / Soft-delete (inline, same style as your tier dialogs) -->
    <el-dialog v-model="deactivateDialogVisible" title="Confirm Deletion" width="420px">
      <div>
        Are you sure you want to delete
        <b>{{ selectedTool?.name }}</b
        >?
      </div>
      <template #footer>
        <el-button :disabled="deleting" @click="deactivateDialogVisible = false">Cancel</el-button>
        <el-button type="danger" :loading="deleting" @click="confirmDeactivate">Delete</el-button>
      </template>
    </el-dialog>

    <div class="table-body">
      <el-table :data="tools" :style="{ width: '100%', height: maxHeight }" border>
        <el-table-column width="110px" label="Image">
          <template #default="{ row }">
            <el-image v-if="row.image_list.length > 0" :src="row.image_list" style="width: 80px" />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="Tool Name" sortable />
        <el-table-column prop="code" label="Code" sortable />
        <el-table-column prop="tool_class.name" label="Category" sortable />
        <el-table-column prop="description" label="Description" min-width="250px" />

        <!-- Actions -->
        <el-table-column
          :label="$t('workOrder.table.actions')"
          align="center"
          width="140"
          class-name="small-padding fixed-width action-column"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="action-row">
              <el-button class="action-btn" size="small" @click="editTool(row)">Edit</el-button>
              <el-button class="action-btn"
type="danger"
size="small"
@click="openDeactivateDialog(row)"
                >Delete</el-button
              >
            </div>
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
import { ElMessage } from 'element-plus'
import NewTool from './NewTool.vue'
import EditTool from './EditTool.vue'
import { searchTools, createTool, updateTool, deleteTool } from '@/api/resources'

const props = defineProps( {
  newTool : Boolean,
  keyword : String
} )
const emit = defineEmits( ['close'] )

const newToolActive = ref( props.newTool )
const editToolActive = ref( false )

const selectedTool = ref( null )

// NEW: inline deactivate dialog state
const deactivateDialogVisible = ref( false )
const deleting = ref( false )

watch(
  () => props.newTool,
  newVal => {
    newToolActive.value = newVal
  }
)

const maxHeight = ref( '737px' )
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : maxHeight.value
}
onMounted( () => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
} )
onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

const apiSuccess = ( header, name ) => {
  ElMessage( { message : header + name, type : 'success' } )
}

const listQuery = reactive( { page : 1, size : 20 } )
const search = ref( { keyword : null } )

const tools = ref( null )
const totalItems = ref( null )

async function getToolsData() {
  const response = await searchTools( listQuery.page, listQuery.size, 'name', 'ASC', search.value )
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

async function handleCreate( data ) {
  try {
    const create = await createTool( data )
    if ( create.status == 200 ) {
      apiSuccess( 'Tool Created: ', create.data.name )
      emit( 'close' )
      getToolsData()
    }
  } catch ( err ) {
    console.log( 'Failed to create tool', err )
  }
}

async function handleEdit( data ) {
  try {
    const update = await updateTool( data )
    if ( update.status == 200 ) {
      apiSuccess( 'Tool Updated: ', data.name )
      editToolActive.value = false
      getToolsData()
    }
  } catch ( err ) {
    console.log( 'Failed to update tool', err )
  }
}

// NEW: open dialog like your t2/t3/t4 components
function openDeactivateDialog( row ) {
  selectedTool.value = row
  deactivateDialogVisible.value = true
}

async function confirmDeactivate() {
  if ( !selectedTool.value ) return
  deleting.value = true
  try {
    await deleteTool( selectedTool.value.id )
    ElMessage.success( `Tool Deactivated: ${selectedTool.value.name}` )
    deactivateDialogVisible.value = false
    await getToolsData()
  } catch ( err ) {
    const r = err?.response
    const msg = r?.data?.message || r?.data?.error || r?.statusText || err?.message || 'Unknown error'
    ElMessage.error( `Delete failed: ${msg}` )
    console.error( 'DELETE failed', { status : r?.status, data : r?.data, headers : r?.headers } )
  } finally {
    deleting.value = false
  }
}

function editTool( row ) {
  row.tool_class_id = row.tool_class.id
  selectedTool.value = row
  editToolActive.value = true
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

/* tighter actions column */
.action-column :deep(.cell) {
  padding: 0 6px;
}
.action-row {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
}
.action-btn {
  padding: 4px 10px;
}
</style>
