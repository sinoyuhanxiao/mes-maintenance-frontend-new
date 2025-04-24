<template>
  <YuLayout title="维护工单管理">
    <template #body>
      <div class="app-container">
        <div class="filter-container">
          <div class="filter-left">
            <el-input
              v-model="set.listQuery.title"
              placeholder="工单名称"
              style="width: 120px; margin-right: 20px"
              class="filter-item"
              @keyup.enter="handleFilter"
            />
            <el-select
              v-model="set.listQuery.importance"
              placeholder="维护类型"
              clearable
              style="width: 120px; margin-right: 20px"
              class="filter-item"
            >
              <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-select
              v-model="set.listQuery.type"
              placeholder="优先级"
              clearable
              class="filter-item"
              style="width: 130px; margin-right: 20px"
            >
              <el-option
                v-for="item in calendarTypeOptions"
                :key="item.key"
                :label="item.display_name + '(' + item.key + ')'"
                :value="item.key"
              />
            </el-select>
            <el-select
              v-model="set.listQuery.sort"
              style="width: 140px; margin-right: 20px"
              class="filter-item"
              @change="handleFilter"
            >
              <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-button v-wave class="filter-item" type="default" :icon="Search" @click="handleFilter"> 搜索 </el-button>
          </div>
          <div class="filter-right">
            <el-button class="filter-item" type="primary" :icon="EditPen" @click="handleCreate"> 新增 </el-button>
            <el-button
              v-wave
              :loading="downloadLoading"
              class="filter-item"
              type="success"
              :icon="Download"
              @click="handleDownload"
            >
              导出
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          style="width: 100%"
          :height="tableHeight"
          row-key="id"
          :tree-props="{ children: 'children' }"
          :lazy="true"
          :load="loadChildren"
          @expand-change="toggleRowHighlight"
          :row-class-name="getRowClass"
        >
          <!-- Work Order Name -->
          <el-table-column label="工单名称" prop="name" align="left" width="300" fixed="left">
            <template #default="{ row }">
              <span style="color: black">{{ row.name }}</span>
            </template>
          </el-table-column>

          <!-- ID Column -->
          <el-table-column label="ID" prop="id" align="center" width="120"></el-table-column>

          <!-- Work Order Code -->
          <el-table-column label="工单号" prop="code" align="center" width="250"></el-table-column>

          <!-- Due Date (With Highlighting If Overdue) -->
          <el-table-column label="截止日期" prop="due_date" align="center" width="180">
            <template #default="{ row }">
              <span :style="{ color: new Date(row.due_date) < new Date() ? 'red' : '' }">
                {{ convertToLocalTime(row.due_date) }}
              </span>
            </template>
          </el-table-column>

          <!-- Work Order Image -->
          <el-table-column label="工单预览图" align="center" width="150">
            <template #default="{ row }">
              <el-image
                v-if="row.image_path && row.image_path.length"
                style="width: 50px; height: 50px"
                :src="row.image_path[0]"
                :preview-src-list="[row.image_path[0]]"
                loading="lazy"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><IconPicture /></el-icon>
                  </div>
                </template>
              </el-image>
              <el-image v-else style="width: 50px; height: 50px">
                <template #error>
                  <el-tooltip>
                    <template #content>
                      <span>无图无真相</span>
                    </template>
                    <div class="image-slot">
                      <el-icon><IconPicture /></el-icon>
                    </div>
                  </el-tooltip>
                </template>
              </el-image>
            </template>
          </el-table-column>

          <!-- Priority -->
          <el-table-column label="优先级" prop="priority.name" align="center" width="120">
            <template #default="{ row }">
              <span
                :title="row.priority.description"
                style="display: flex; align-items: center; justify-content: center"
              >
                <el-icon :style="{ color: getPriorityColor(row.priority.name), marginRight: '4px' }">
                  <Flag />
                </el-icon>
                {{ row.priority.name }}
              </span>
            </template>
          </el-table-column>

          <!-- Maintenance Type -->
          <el-table-column label="维护类型" prop="work_type.name" align="center" width="150">
            <template #default="{ row }">
              <el-tag :type="getWorkTypeTagType(row.work_type.name)" :title="row.work_type.description" effect="light">
                {{ row.work_type.name }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- Category -->
          <el-table-column label="工单类别" prop="category.name" align="center" width="150">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.category.name)" :title="row.category.description" effect="plain">
                {{ row.category.name || '-' }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- Recurrence Type -->
          <el-table-column label="重复类型" prop="recurrence_type.name" align="center" width="150">
            <template #default="{ row }">
              <el-tag
                :type="getRecurrenceTagType(row.recurrence_type.id)"
                :title="row.recurrence_type.description || 'Does not repeat'"
                effect="dark"
              >
                {{ row.recurrence_type.name }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- Estimated Time -->
          <el-table-column label="预估时间 (分钟)" prop="estimated_minutes" align="center" width="150">
            <template #default="{ row }">
              {{ row.estimated_minutes != null ? row.estimated_minutes : '-' }}
            </template>
          </el-table-column>

          <!-- Start Date -->
          <el-table-column label="开始日期" prop="start_date" align="center" width="200">
            <template #default="{ row }">
              {{ convertToLocalTime(row.start_date) }}
            </template>
          </el-table-column>

          <!-- Finished Date -->
          <el-table-column label="完成日期" prop="finished_at" align="center" width="200">
            <template #default="{ row }">
              {{ row.finished_at ? convertToLocalTime(row.finished_at) : '-' }}
            </template>
          </el-table-column>

          <!-- Approved At -->
          <el-table-column label="审批时间" prop="approved_at" align="center" width="200">
            <template #default="{ row }">
              {{ row.approved_at ? convertToLocalTime(row.approved_at) : '-' }}
            </template>
          </el-table-column>

          <!-- State -->
          <el-table-column label="状态" prop="state.name" align="center" width="150">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.state.name === 'Failed'
                    ? 'danger'
                    : row.state.name === 'Completed'
                    ? 'success'
                    : row.state.name === 'In Progress'
                    ? 'warning'
                    : 'info'
                "
                effect="dark"
                round
              >
                {{ row.state.name }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- Created By -->
          <el-table-column label="创建者" prop="created_by" align="center" width="150"></el-table-column>

          <!-- Approved By -->
          <el-table-column label="审批人" prop="approved_by_id" align="center" width="150">
            <template #default="{ row }">
              {{ row.approved_by_id != null ? row.approved_by_id : '-' }}
            </template>
          </el-table-column>

          <!-- 工单描述 -->
          <el-table-column label="工单描述" prop="description" align="left" min-width="200">
            <template #default="{ row }">
              <span :title="row.description">{{ row.description || '-' }}</span>
            </template>
          </el-table-column>

          <!-- Actions -->
          <el-table-column
            label="操作"
            align="center"
            width="250"
            class-name="small-padding fixed-width action-column"
            fixed="right"
          >
            <template #default="{ row, $index }">
              <el-button type="info" size="small" @click="handleView(row)">查看</el-button>
              <el-button type="primary" size="small" @click="handleUpdate(row)">修改</el-button>
              <el-button v-if="row.status !== 'deleted'" size="small" type="danger" @click="handleDelete(row, $index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="pagination-center"
          :total="total"
          :hide-on-single-page="true"
          v-model:currentPage="set.listQuery.page"
          v-model:page-size="set.listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

        <el-dialog :title="set.textMap[dialogStatus]" v-model="dialogFormVisible">
          <el-form
            ref="dataForm"
            :rules="set.rules"
            :model="set.temp"
            label-position="left"
            label-width="70px"
            style="width: 400px; margin-left: 50px"
          >
            <el-form-item label="Type" prop="type">
              <el-select v-model="set.temp.type" class="filter-item" placeholder="Please select">
                <el-option
                  v-for="item in calendarTypeOptions"
                  :key="item.key"
                  :label="item.display_name"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Date" prop="timestamp">
              <el-date-picker v-model="set.temp.timestamp" type="datetime" placeholder="Please pick a date" />
            </el-form-item>
            <el-form-item label="Title" prop="title">
              <el-input v-model="set.temp.title" />
            </el-form-item>
            <el-form-item label="Status">
              <el-select v-model="set.temp.status" class="filter-item" placeholder="Please select">
                <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="Imp">
              <el-rate
                v-model="set.temp.importance"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :max="3"
                style="margin-top: 8px"
              />
            </el-form-item>
            <el-form-item label="Remark">
              <el-input
                v-model="set.temp.remark"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                placeholder="Please input"
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="hideDialog"> Cancel </el-button>
              <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
                Confirm
              </el-button>
            </div>
          </template>
        </el-dialog>

        <el-dialog v-model="dialogPvVisible" title="Reading statistics">
          <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="key" label="Channel" />
            <el-table-column prop="pv" label="Pv" />
          </el-table>
          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" @click="hideDialogPv">Confirm</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </template>
  </YuLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, nextTick, unref, onMounted, onBeforeUnmount } from 'vue'
import { createArticle, updateArticle } from '@/api/article'

import { parseTime } from '@/utils'
import { ElNotification } from 'element-plus'
import { Search, EditPen, Download, Picture as IconPicture, Flag } from '@element-plus/icons-vue'
import YuLayout from '@/components/YuLayout'
import { getAllWorkOrders, getWorkOrdersByRecurrence } from '@/api/workorder'
import { convertToLocalTime } from '../../utils/datetime'
import { getPriorityColor, getWorkTypeTagType, getCategoryTagType, getRecurrenceTagType } from '@/utils/general'

const tableHeight = ref( window.innerHeight - 300 )
const expandedRows = ref( new Set() )

const updateTableHeight = () => {
  tableHeight.value = window.innerHeight - 300
}

const handleView = row => {
  router.push( { name : 'ViewWorkOrder', params : { id : row.id }} )
}

const getRowClass = ( { row } ) => {
  return expandedRows.value.has( row.id ) ? 'expanded-highlight' : ''
}

const toggleRowHighlight = ( row, expanded ) => {
  if ( expanded ) {
    expandedRows.value.add( row.id )
    if ( row.children ) {
      row.children.forEach( child => expandedRows.value.add( child.id ) )
    }
  } else {
    expandedRows.value.delete( row.id )
    if ( row.children ) {
      row.children.forEach( child => expandedRows.value.delete( child.id ) )
    }
  }
}

onMounted( () => {
  window.addEventListener( 'resize', updateTableHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateTableHeight )
} )

const calendarTypeOptions = ref( [
  { key : 'CN', display_name : 'China' },
  { key : 'US', display_name : 'USA' },
  { key : 'JP', display_name : 'Japan' },
  { key : 'EU', display_name : 'Eurozone' }
] )
// const calendarTypeKeyValue = calendarTypeOptions.value.reduce( ( acc, cur ) => {
//   acc[cur.key] = cur.display_name
//   return acc
// }, {} )

const router = useRouter()

const handleSizeChange = val => {
  set.listQuery.limit = val
  getList() // 重新加载数据
}

const handleCurrentChange = val => {
  set.listQuery.page = val
  getList() // 重新加载数据
}

const loadChildren = async( row, treeNode, resolve ) => {
  try {
    const recurrenceId = row.recurrence_uuid
    if ( !recurrenceId ) return resolve( [] )

    const response = await getWorkOrdersByRecurrence( recurrenceId )
    let children = response.data.data.content

    // ✅ 避免把自己加载为子项
    children = children.filter( child => child.id !== row.id )

    row.children = children
    resolve(
      children.map( child => ( {
        ...child,
        hasChildren : false // 如果还会再嵌套才设 true
      } ) )
    )
  } catch ( err ) {
    console.error( 'Error loading children:', err )
    resolve( [] )
  }
}

const dataForm = ref( null )
const total = ref( 0 )
const list = ref( null )
const listLoading = ref( true )

const importanceOptions = ref( [1, 2, 3] )

const sortOptions = ref( [
  {
    label : 'ID 升序',
    key : '+id'
  },
  {
    label : 'ID 降序',
    key : '-id'
  }
] )
const statusOptions = ref( ['published', 'draft', 'deleted'] )
// const showReviewer = ref( false )
const dialogFormVisible = ref( false )
const dialogStatus = ref( '' )
const dialogPvVisible = ref( false )
const pvData = ref( [] )
const downloadLoading = ref( false )

const set = reactive( {
  listQuery : {
    page : 1,
    limit : 20,
    importance : undefined,
    title : undefined,
    type : undefined,
    sort : '-id'
  },
  temp : {
    id : undefined,
    importance : 1,
    remark : '',
    timestamp : new Date(),
    title : '',
    type : '',
    status : 'published',
    author : 'vite element admin'
  },
  textMap : {
    update : 'Edit',
    create : 'Create'
  },
  rules : {
    type : [{ required : true, message : 'type is required', trigger : 'change' }],
    timestamp : [{ type : 'date', required : true, message : 'timestamp is required', trigger : 'change' }],
    title : [{ required : true, message : 'title is required', trigger : 'blur' }]
  }
} )

const hideDialog = () => {
  dialogFormVisible.value = false
}
const hideDialogPv = () => {
  dialogPvVisible.value = false
}

// const getList = async() => {
//   listLoading.value = true
//   const { data } = await getArticle( set.listQuery )
//
//   if ( set.listQuery.sort == '+id' ) {
//     list.value = data.items.sort( ( a, b ) => a.id - b.id )
//   } else {
//     list.value = data.items.sort( ( a, b ) => b.id - a.id )
//   }
//
//   total.value = data.total
//
//   setTimeout( () => {
//     listLoading.value = false
//   }, 1.5 * 1000 )
// }

const getList = async() => {
  listLoading.value = true
  list.value = null

  try {
    const response = await getAllWorkOrders( set.listQuery.page, set.listQuery.limit )
    const data = response.data.data.content
    total.value = response.data.data.totalElements

    // Conditionally add `children` if recurrence_type.id !== 1
    list.value = data.map( item => {
      if ( item.recurrence_type?.id !== 1 ) {
        return { ...item, children : null, hasChildren : true } // 加上 hasChildren 就会有小箭头了
      }
      return item
    } )
  } catch ( error ) {
    console.error( 'Failed to fetch data:', error )
  } finally {
    listLoading.value = false
  }
}

// const statusFilter = status => {
//   const statusMap = {
//     published : 'success',
//     draft : 'info',
//     deleted : 'danger'
//   }
//   return statusMap[status]
// }

// const typeFilter = type => {
//   return calendarTypeKeyValue[type]
// }

const handleFilter = () => {
  set.listQuery.page = 1
  getList()
}

// const handleModifyStatus = ( row, status ) => {
//   ElMessage( {
//     message : '操作Success',
//     type : 'success'
//   } )
//   row.status = status
// }

// const resetTemp = () => {
//   set.temp = {
//     id : 0,
//     importance : 1,
//     remark : '',
//     timestamp : new Date(),
//     title : '',
//     status : 'published',
//     type : '',
//     author : 'vite element admin'
//   }
// }

// const handleCreate = () => {
//   resetTemp()
//   dialogStatus.value = 'create'
//   dialogFormVisible.value = true
//   nextTick( () => {
//     dataForm.value && dataForm.value.clearValidate()
//   } )
// }

const handleCreate = () => {
  router.push( { name : 'NewWorkOrder' } )
}

const createData = () => {
  dataForm.value &&
    dataForm.value.validate( valid => {
      if ( valid ) {
        set.temp.id = parseInt( Math.random() * 100 ) + 1024 // mock a id
        set.temp.author = 'vite element admin'
        createArticle( unref( set.temp ) ).then( () => {
          list.value.unshift( unref( set.temp ) )
          hideDialog()
          ElNotification( {
            title : 'Success',
            message : 'Created Successfully',
            type : 'success',
            duration : 2000
          } )
        } )
      }
    } )
}

const handleUpdate = row => {
  set.temp = Object.assign( {}, row ) // copy obj
  set.temp.timestamp = new Date( set.temp.timestamp )
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
  nextTick( () => {
    dataForm.value && dataForm.value.clearValidate()
  } )
}

const updateData = () => {
  dataForm.value?.validate( valid => {
    if ( valid ) {
      const tempData = {
        ...set.temp
        // timestamp : +new Date( tempData.timestamp )
      }
      updateArticle( tempData ).then( () => {
        const index = list.value.findIndex( v => v.id === set.temp.id )
        list.value.splice( index, 1, set.temp )
        hideDialog()
        ElNotification( {
          title : 'Success',
          message : 'Update Successfully',
          type : 'success',
          duration : 2000
        } )
      } )
    }
  } )
}

const handleDelete = ( row, index ) => {
  ElNotification( {
    title : 'Success',
    message : 'Delete Successfully',
    type : 'success',
    duration : 2000
  } )
  list.value.splice( index, 1 )
}

// const handleFetchPv = pv => {
//   getPv( pv ).then( response => {
//     pvData.value = response.data.pvData
//     dialogPvVisible.value = true
//   } )
// }

const handleDownload = () => {
  downloadLoading.value = true
  import( '@/vendor/Export2Excel' ).then( excel => {
    const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
    const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
    const data = formatJson( filterVal )
    excel.export_json_to_excel( {
      header : tHeader,
      data,
      filename : 'table-list'
    } )
    downloadLoading.value = false
  } )
}

const formatJson = filterVal => {
  return list.value.map( v =>
    filterVal.map( j => {
      if ( j === 'timestamp' ) {
        return parseTime( v[j] )
      } else {
        return v[j]
      }
    } )
  )
}

// const getSortClass = key => {
//   const sort = set.listQuery.sort
//   return sort === `+${key}` ? 'ascending' : 'descending'
// }

getList()

defineOptions( {
  name : 'ComplexTable'
} )
</script>

<style scoped lang="scss">
.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}

.el-table::v-deep(.action-column) {
  border-left: 1px solid grey; /* Adjust the thickness and color as needed */
}

.pagination-center {
  margin: 10px 10px 10px;
}

/*el-table el-table-column 组件中 使用插槽 加载 el-image 组件预览图片 层级过低问题*/
.el-table {
  & ::v-deep(th.el-table__cell),
  ::v-deep(td.el-table__cell) {
    // 设置position 使得子元素不与其产生新的层叠关系
    position: static;
  }
}
.yu-layout {
  ::v-deep(.body) {
    background: #fff;
  }
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.el-table__expand-icon > .el-icon {
  font-size: 15px !important;
}

::v-deep(.el-table__body-wrapper .expanded-highlight td),
::v-deep(.el-table__fixed .el-table__row.expanded-highlight td),
::v-deep(.el-table__fixed-left .el-table__row.expanded-highlight td),
::v-deep(.el-table__fixed-right .el-table__row.expanded-highlight td) {
  background-color: #e0f3ff !important;
}
</style>
