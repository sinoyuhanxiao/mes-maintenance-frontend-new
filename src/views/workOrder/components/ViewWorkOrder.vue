<template>
  <div>
    <div v-if="!loading" class="el-row card-row">
      <!-- 基本信息卡片 -->
      <div class="el-col el-col-24 is-guttered card-container">
        <el-card class="card-shadow">
          <div class="el-card__header">
            <div class="card-header">
              <span>工单基本信息</span>
              <span class="workorder-id">#{{ workOrder.id }}</span>
            </div>
          </div>
          <div class="el-card__body">
            <el-descriptions border :column="2">
              <el-descriptions-item label="工单名称" :width="labelWidth" :span="1">
                <template #default>
                  <div style="display: flex; align-items: center">
                    <el-input v-if="editing" v-model="workOrder.name" ref="nameInputRef" size="default" />
                    <template v-else>
                      <span>{{ workOrder.name }}</span>
                      <el-icon
                        style="cursor: pointer; margin-left: 8px; color: var(--el-color-primary)"
                        @click="copyToClipboard(workOrder.name)"
                      >
                        <CopyDocument />
                      </el-icon>
                    </template>
                  </div>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="工单号" :width="labelWidth" :span="1">
                <template #default>
                  <div style="display: flex; align-items: center">
                    <span>{{ workOrder.code }}</span>
                    <el-icon
                      style="cursor: pointer; margin-left: 8px; color: var(--el-color-primary)"
                      @click="copyToClipboard(workOrder.code)"
                    >
                      <CopyDocument />
                    </el-icon>
                  </div>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="是否停机" :width="labelWidth" :span="2">
                <template #default>
                  <el-switch
                    v-if="editing"
                    v-model="workOrder.halt_type"
                    :active-value="1"
                    :inactive-value="0"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                  <span v-else>{{ workOrder.halt_type === 1 ? '是' : '否' }}</span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="描述" :width="labelWidth" :span="2">
                <template #default>
                  <el-input v-if="editing" v-model="workOrder.description" type="textarea" />
                  <span v-else>{{ workOrder.description }}</span>
                </template>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 资产信息卡片 -->
      <div class="el-col el-col-24 is-guttered card-container">
        <el-card class="card-shadow">
          <div class="el-card__header">
            <div class="card-header"><span>设备与资产信息</span></div>
          </div>
          <div class="el-card__body">
            <el-descriptions border :column="2">
              <el-descriptions-item label="生产线" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.production_line.id" placeholder="生产线">
                    <el-option
                      v-for="item in commonDataStore.productionLines"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                  <span v-else>{{ workOrder.production_line?.name }}</span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="设备组" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.equipment_group.id" placeholder="设备组">
                    <el-option v-for="item in equipmentGroups" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                  <span v-else>{{ workOrder.equipment_group?.name }}</span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="设备" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.equipment.id" placeholder="设备">
                    <el-option v-for="item in equipments" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                  <span v-else>{{ workOrder.equipment?.name }}</span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="组件" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.component.id" placeholder="组件">
                    <el-option v-for="item in components" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                  <span v-else>{{ workOrder.component?.name }}</span>
                </template>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 分类信息卡片 -->
      <div class="el-col el-col-24 is-guttered card-container">
        <el-card class="card-shadow">
          <div class="el-card__header">
            <div class="card-header"><span>分类信息</span></div>
          </div>
          <div class="el-card__body">
            <el-descriptions border :column="2">
              <el-descriptions-item label="优先级" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.priority.id" placeholder="优先级" style="width: 100%">
                    <el-option
                      v-for="item in commonDataStore.priorities"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                  <el-tag v-else type="danger">{{ workOrder.priority?.name }}</el-tag>
                </template>
              </el-descriptions-item>

              <el-descriptions-item label="工单类别" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.category.id" placeholder="工单类别" style="width: 100%">
                    <el-option
                      v-for="item in commonDataStore.categories"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                  <el-tag v-else>{{ workOrder.category?.name }}</el-tag>
                </template>
              </el-descriptions-item>

              <el-descriptions-item label="工作类型" :width="labelWidth">
                <template #default>
                  <el-select v-if="editing" v-model="workOrder.work_type.id" placeholder="工作类型" style="width: 100%">
                    <el-option
                      v-for="item in commonDataStore.workTypes"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                  <el-tag v-else type="success">{{ workOrder.work_type?.name }}</el-tag>
                </template>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 附件信息卡片 -->
      <!--    <div class="el-col el-col-24 is-guttered card-container">-->
      <!--      <el-card class="card-shadow">-->
      <!--        <div class="el-card__header">-->
      <!--          <div class="card-header"><span>附件信息</span></div>-->
      <!--        </div>-->
      <!--        <div class="el-card__body">-->
      <!--          <el-descriptions border :column="1">-->
      <!--            <el-descriptions-item label="图片预览">-->
      <!--              <div class="image-list">-->
      <!--                <el-image-->
      <!--                    v-for="(img, index) in workOrder.image_list"-->
      <!--                    :key="index"-->
      <!--                    :src="img"-->
      <!--                    style="width: 100px; height: 100px; margin-right: 10px"-->
      <!--                    fit="cover"-->
      <!--                    :preview-src-list="workOrder.image_list"-->
      <!--                />-->
      <!--              </div>-->
      <!--            </el-descriptions-item>-->
      <!--            <el-descriptions-item label="文件下载" >-->
      <!--              <div class="file-list">-->
      <!--                <div-->
      <!--                    v-for="(file, index) in workOrder.file_list"-->
      <!--                    :key="index"-->
      <!--                    style="margin-bottom: 8px"-->
      <!--                >-->
      <!--                  <el-link-->
      <!--                      :href="file"-->
      <!--                      target="_blank"-->
      <!--                      type="primary"-->
      <!--                  >-->
      <!--                    {{ getFileName(file) }}-->
      <!--                  </el-link>-->
      <!--                </div>-->
      <!--              </div>-->
      <!--            </el-descriptions-item>-->
      <!--          </el-descriptions>-->
      <!--        </div>-->
      <!--      </el-card>-->
      <!--    </div>-->

      <!-- 附件信息Common卡片 -->
      <div class="el-col el-col-24 is-guttered">
        <ImagesAndFiles
          :mode="editing ? 'edit' : 'view'"
          :imageListUrl="workOrder.image_list"
          :fileListUrl="workOrder.file_list"
          v-model:image_list_multipart_added="imageListMultipartAdded"
          v-model:file_list_multipart_added="fileListMultipartAdded"
          v-model:image_list_url_deleted="imageListUrlDeleted"
          v-model:file_list_url_deleted="fileListUrlDeleted"
        />
      </div>

      <!-- 任务进度卡片11 -->
      <div class="el-col el-col-24 is-guttered card-container">
        <el-card class="card-shadow">
          <div class="el-card__header">
            <div class="card-header"><span>任务进度</span></div>
          </div>
          <div class="el-card__body progress-body">
            <div class="progress-left">
              <el-progress type="circle" :percentage="taskProgress" :stroke-width="8" status="success" />
              <div class="progress-text">
                已完成 {{ workOrder.work_order_progress.completed_task_amount || 0 }} /
                {{ workOrder.work_order_progress.total_task_amount || 0 }}
              </div>
            </div>
            <el-descriptions border :column="1" class="progress-descriptions">
              <el-descriptions-item label="开始时间">
                {{ convertToLocalTime(workOrder.start_date) }}
              </el-descriptions-item>
              <el-descriptions-item label="截止时间">
                {{ convertToLocalTime(workOrder.end_date) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态"> 进行中 </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 评论卡片 -->
      <div class="el-col el-col-24 is-guttered card-container">
        <el-card class="card-shadow">
          <div class="el-card__header">
            <div class="card-header"><span>评论</span></div>
          </div>
          <div class="el-card__body">
            <el-input
              v-model="newComment"
              placeholder="写下评论..."
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              style="margin-bottom: 10px"
            />
            <div style="text-align: right">
              <el-button type="primary" size="default" @click="addComment">发送</el-button>
            </div>
            <div v-for="(comment, index) in comments" :key="index" style="margin-top: 15px">
              <div style="font-weight: bold">Erik Yu <span style="color: #999; font-size: 12px">2:15 PM</span></div>
              <div>{{ comment }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <div v-else>
      <el-skeleton :rows="8" animated />
      <!-- optional skeleton UI -->
    </div>
    <el-tooltip :content="editing ? '保存修改' : '编辑工单'" placement="top">
      <el-button
        class="floating-edit-button"
        :type="editing ? 'success' : 'primary'"
        circle
        size="large"
        :icon="editing ? 'Check' : 'Edit'"
        @click="editing = !editing"
      />
    </el-tooltip>

    <transition name="slide-fade">
      <el-tooltip v-if="editing" content="删除工单" placement="bottom">
        <el-button class="floating-delete-button" type="danger" circle size="large" icon="Delete" />
      </el-tooltip>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getWorkOrderById } from '@/api/work-order'
import { convertToLocalTime } from '@/utils/datetime'
import { updateTabTitle } from '@/utils/tabs'
import { useCommonDataStore } from '@/store/modules/commonData'
import { getEquipmentGroups, getEquipments, getEquipmentComponents } from '@/api/equipment'
import ImagesAndFiles from '@/views/workOrder/components/ImagesAndFiles.vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const workOrder = ref( {
  estimated_minutes : 0,
  priority : {},
  category : {},
  work_type : {},
  production_line : {},
  equipment_group : {},
  equipment : {},
  component : {},
  image_list : [],
  file_list : []
} )
const originalWorkOrder = ref( {} )
const updatedWorkOrder = ref( {} )
const loading = ref( true )
const labelWidth = ref( '100' )
const editing = ref( false )
const nameInputRef = ref( null )
const commonDataStore = useCommonDataStore()
const taskProgress = computed( () => {
  const progress = workOrder.value.work_order_progress
  if ( !progress || !progress.total_task_amount ) return 0
  return Math.round( ( progress.completed_task_amount / progress.total_task_amount ) * 100 )
} )
const equipmentGroups = ref( [] )
const equipments = ref( [] )
const components = ref( [] )
const imageListMultipartAdded = ref( [] )
const fileListMultipartAdded = ref( [] )
const imageListUrlDeleted = ref( [] )
const fileListUrlDeleted = ref( [] )
const comments = ref( ['喝口腌笃鲜，郭郝每一天', '工单工单，非同一般。要想吃饱，先得不堪。'] ) // initial mock comments
const newComment = ref( '' )
const addComment = () => {
  if ( newComment.value.trim() ) {
    comments.value.push( newComment.value.trim() )
    newComment.value = ''
  }
}
const copyToClipboard = text => {
  navigator.clipboard.writeText( text ).then( () => {
    ElMessage.success( '已复制到剪贴板' )
  } )
}

onMounted( async() => {
  const id = route.params.id
  const res = await getWorkOrderById( id )
  const data = res.data
  await commonDataStore.fetchPriorities()
  await commonDataStore.fetchWorkTypes()
  await commonDataStore.fetchCategories()

  // TODO: update with new equipment api
  // await commonDataStore.fetchProductionLines()
  originalWorkOrder.value = JSON.parse( JSON.stringify( workOrder.value ) ) // snapshot

  workOrder.value = {
    id : data.id,
    code : data.code,
    name : data.name,
    description : data.description,
    halt_type : data.halt_type,
    estimated_minutes : data.estimated_minutes || 0,
    priority : data.priority || {},
    category : data.category || {},
    work_type : data.work_type || {},
    production_line : data.production_line || {},
    equipment_group : data.equipment_group || {},
    equipment : data.equipment || {},
    component : data.component || {},
    image_list : data.image_list || [],
    file_list : data.file_list || [],
    start_date : data.start_date,
    end_date : data.end_date,
    due_date : data.due_date,
    state_id : data.state_id,
    recurrence_type : data.recurrence_type || {},
    work_order_progress : data.work_order_progress || {},
    created_by : data.created_by,
    created_at : data.created_at,
    approved_by_id : data.approved_by_id
  }

  loading.value = false

  // update the title TODO: make the slicing util functions
  const shortName = workOrder.value.name.length > 5 ? `${workOrder.value.name.slice( 0, 5 )}...` : workOrder.value.name
  updateTabTitle( route, `工单#${workOrder.value.id} - ${shortName}` )
} )

function calculateUpdatedWorkOrder() {
  const updated = {}

  for ( const key in workOrder.value ) {
    if ( typeof workOrder.value[key] === 'object' && workOrder.value[key] !== null ) {
      if ( 'id' in workOrder.value[key] ) {
        const originalId = originalWorkOrder.value[key]?.id
        const currentId = workOrder.value[key]?.id
        if ( originalId !== currentId ) {
          updated[key + '_id'] = currentId
        }
      } else if ( Array.isArray( workOrder.value[key] ) ) {
        // skip array fields (or handle as needed)
      } else {
        // nested object without 'id' (skip or handle)
      }
    } else {
      if ( workOrder.value[key] !== originalWorkOrder.value[key] ) {
        updated[key] = workOrder.value[key]
      }
    }
  }

  // Add updated_by and updated_at
  updated.updated_by = 37
  updated.updated_at = new Date().toISOString()
  delete updated.created_by
  delete updated.created_at

  updatedWorkOrder.value = updated
}

function highlightAllInputs() {
  nextTick( () => {
    const inputWrappers = document.querySelectorAll( '.el-input__wrapper, .el-textarea__inner, .el-select__wrapper' )
    inputWrappers.forEach( wrapper => {
      wrapper.classList.add( 'highlight-border' )
    } )
    setTimeout( () => {
      inputWrappers.forEach( wrapper => {
        wrapper.classList.remove( 'highlight-border' )
      } )
    }, 1500 )
  } )
}

watch( editing, newVal => {
  if ( newVal ) {
    highlightAllInputs()
  }
} )

watch(
  workOrder,
  newVal => {
    // Work order data changed
  },
  { deep : true }
)

watch(
  () => workOrder.value.production_line?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipmentGroups( val )
      equipmentGroups.value = data.data
    }
  }
)

watch(
  () => workOrder.value.equipment_group?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipments( val )
      equipments.value = data.data
    }
  }
)

watch(
  () => workOrder.value.equipment?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipmentComponents( val )
      components.value = data.data
    }
  }
)

watch( editing, newVal => {
  if ( !newVal ) {
    calculateUpdatedWorkOrder() // when exiting edit mode
  }
} )

watch(
  [
    imageListMultipartAdded,
    fileListMultipartAdded,
    imageListUrlDeleted,
    fileListUrlDeleted,
    () => workOrder.value.image_list,
    () => workOrder.value.file_list,
    editing
  ],
  ( [newImagesAdded, newFilesAdded, deletedImages, deletedFiles, imageListUrl, fileListUrl, mode] ) => {
    // Images and files state changed
  },
  { deep : true }
)

watch(
  () => workOrder.value.production_line?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipmentGroups( val )
      equipmentGroups.value = data.data
    }
    // 清空下级选择
    workOrder.value.equipment_group.id = null
    workOrder.value.equipment.id = null
    workOrder.value.component.id = null
  }
)

watch(
  () => workOrder.value.equipment_group?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipments( val )
      equipments.value = data.data
    }
    // 清空下级选择
    workOrder.value.equipment.id = null
    workOrder.value.component.id = null
  }
)

watch(
  () => workOrder.value.equipment?.id,
  async val => {
    if ( val ) {
      const { data } = await getEquipmentComponents( val )
      components.value = data.data
    }
    // 清空下级选择
    workOrder.value.component.id = null
  }
)

defineExpose( {
  workOrderExpose : {
    id : workOrder.value.id,
    name : workOrder.value.name
  }
} )
</script>

<style scoped>
.card-container {
  padding: 7.5px 140px;
}
.card-shadow {
  box-shadow: var(--el-box-shadow-light);
}
.card-header {
  font-weight: bold;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
}
.floating-edit-button {
  position: absolute;
  top: 35px;
  right: 40px;
  z-index: 1000;
  transform: scale(1.2);
}
.floating-edit-button :deep(.el-icon) {
  font-size: 20px;
  font-weight: bold;
}
.floating-edit-button {
  position: absolute;
  top: 35px;
  right: 50px;
  z-index: 1000;
  transform: scale(1.2);
}
.floating-edit-button :deep(.el-icon) {
  font-size: 20px;
  font-weight: bold;
}

.floating-delete-button {
  position: absolute;
  top: 95px; /* 10px below the edit button */
  right: 50px;
  z-index: 999;
  transform: scale(1.2);
}

/* Slide down animation */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.workorder-id {
  color: #999;
  margin-left: 10px;
}
.progress-body {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.progress-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30px; /* spacing between progress and descriptions */
  flex-shrink: 0;
}

.progress-text {
  margin-top: 10px;
  color: #666;
}

.progress-descriptions {
  flex-grow: 1; /* only take remaining space */
  max-width: 300px; /* limit descriptions width */
}

:deep(.el-input__wrapper.highlight-border),
:deep(.el-textarea__inner.highlight-border) {
  box-shadow: 0 0 0 2px var(--el-color-primary) !important;
}
</style>
