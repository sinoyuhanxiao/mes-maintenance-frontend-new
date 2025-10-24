<template>
  <div class="page-layout">
    <!-- Add -->
    <el-dialog
      draggable
      :close-on-click-modal="true"
      v-model="newToolActive"
      title="Add New Tool"
      width="600"
      top="5vh"
      destroy-on-close
      @close="onAddDialogClose"
    >
      <NewTool :key="newToolKey" @createTool="handleCreate" @close="onChildRequestsClose" />
    </el-dialog>

    <!-- Edit -->
    <el-dialog
      draggable
      :close-on-click-modal="true"
      v-model="editToolActive"
      title="Edit Tool"
      width="600"
      top="5vh"
      destroy-on-close
      @close="
        () => {
          editToolActive = false
        }
      "
    >
      <EditTool
        :data="selectedTool"
        @editTool="handleEdit"
        @close="editToolActive = false"
        @cancel="editToolActive = false"
      />
    </el-dialog>

    <!-- Deactivate -->
    <el-dialog v-model="deactivateDialogVisible" title="Confirm" width="420px">
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
        <!-- IMAGE COLUMN (preview only if image valid) -->
        <el-table-column width="100px" label="Image">
          <template #default="{ row }">
            <div class="img-cell">
              <template v-if="firstImage(row)">
                <el-image
                  :src="firstImage(row)"
                  class="img-box"
                  fit="cover"
                  :preview-src-list="previewList(row)"
                  :initial-index="0"
                  :hide-on-click-modal="true"
                  :preview-teleported="true"
                  :z-index="3000"
                  @error="handleImageError(row)"
                >
                  <template #error>
                    <div class="img-fallback">
                      <el-icon><IconPicture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </template>

              <template v-else>
                <div class="img-fallback">
                  <el-icon><IconPicture /></el-icon>
                </div>
              </template>
            </div>
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
import { Picture as IconPicture } from '@element-plus/icons-vue'
import NewTool from './NewTool.vue'
import EditTool from './EditTool.vue'
import { searchTools, createTool, updateTool, deleteTool } from '@/api/resources'

const props = defineProps( {
  newTool : Boolean,
  keyword : String,
  /** ✅ new prop from parent: selected tool class IDs */
  categoryIds : {
    type : Array,
    default : () => []
  }
} )
const emit = defineEmits( ['close'] )

/** ----- Dialog state ----- */
const newToolActive = ref( props.newTool )
const newToolKey = ref( 0 )
const editToolActive = ref( false )
const selectedTool = ref( null )
const deactivateDialogVisible = ref( false )
const deleting = ref( false )

watch(
  () => props.newTool,
  v => {
    newToolActive.value = v
    if ( v ) newToolKey.value += 1
  }
)

/** ----- Layout height ----- */
const maxHeight = ref( '737px' )
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}
onMounted( () => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
} )
onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

/** ----- Table / paging / search state ----- */
const listQuery = reactive( { page : 1, size : 20 } )
const tools = ref( [] )
const totalItems = ref( 0 )

/** ✅ Build payload exactly like your curl */
async function getToolsData() {
  const payload = {}

  // include keyword only if non-empty (ok if backend ignores this)
  if ( props.keyword && props.keyword.trim().length > 0 ) {
    payload.keyword = props.keyword.trim()
  }

  // include tool_class_ids if any selected
  if ( Array.isArray( props.categoryIds ) && props.categoryIds.length > 0 ) {
    // ensure numbers
    payload.tool_class_ids = props.categoryIds.map( x => Number( x ) ).filter( n => !Number.isNaN( n ) )
  }

  const res = await searchTools(
    listQuery.page,
    listQuery.size,
    'name', // sort by name for category filtering UX
    'ASC',
    payload
  )

  const page = res?.data
  tools.value = page?.content ?? []
  totalItems.value = page?.totalElements ?? 0
}

/** React to keyword and category changes */
watch(
  () => props.keyword,
  () => {
    listQuery.page = 1
    getToolsData()
  }
)

watch(
  () => props.categoryIds,
  () => {
    listQuery.page = 1
    getToolsData()
  },
  { deep : true }
)

/** Initial load */
getToolsData()

/** ----- CRUD handlers ----- */
const apiSuccess = ( header, name ) => {
  ElMessage( { message : header + name, type : 'success' } )
}

async function handleCreate( data ) {
  try {
    const create = await createTool( data )
    if ( create.status == 200 ) {
      apiSuccess( 'Tool Created: ', create.data.name )
      newToolActive.value = false
      emit( 'close' )
      newToolKey.value += 1
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
      apiSuccess( 'Tool updated: ', data.name )
      editToolActive.value = false
      getToolsData()
    }
  } catch ( err ) {
    console.log( 'Failed to update tool', err )
  }
}

function openDeactivateDialog( row ) {
  selectedTool.value = row
  deactivateDialogVisible.value = true
}

async function confirmDeactivate() {
  if ( !selectedTool.value ) return
  deleting.value = true
  try {
    await deleteTool( selectedTool.value.id )
    ElMessage.success( `Tool Deleted: ${selectedTool.value.name}` )
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
  row.tool_class_id = row.tool_class?.id
  selectedTool.value = row
  editToolActive.value = true
}

const handleCurrentChange = val => {
  listQuery.page = val
  getToolsData()
}

/** ----- IMAGE HELPERS ----- */
const toArray = v => ( Array.isArray( v ) ? v : typeof v === 'string' && v ? [v] : [] )
const firstImage = row => {
  const list = toArray( row?.image_list )
  return list.length ? list[0] : null
}
const previewList = row => {
  return toArray( row?.image_list ).filter( u => typeof u === 'string' && u.trim().length > 0 )
}
function handleImageError( row ) {
  if ( Array.isArray( row.image_list ) && row.image_list.length > 0 ) {
    row.image_list = []
  }
}

/** ----- dialog close helpers ----- */
function onAddDialogClose() {
  newToolActive.value = false
  newToolKey.value += 1
  emit( 'close' )
}
function onChildRequestsClose() {
  newToolActive.value = false
  newToolKey.value += 1
  emit( 'close' )
}
</script>

<style scoped>
.page-layout {
  padding: 5px;
}

.pagination {
  margin: 10px 0;
  display: flex;
  justify-content: center; /* ⬅ center it */
  width: 100%; /* helps in some layouts */
  flex-shrink: 0;
}

/* action column */
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

/* image layout */
.img-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-sizing: border-box;
}
.img-box,
.img-fallback {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
}
.img-box {
  cursor: zoom-in;
}
.img-fallback {
  background: var(--el-fill-color-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  cursor: default;
}
</style>
