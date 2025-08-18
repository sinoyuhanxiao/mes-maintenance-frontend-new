<template>
  <div class="work-order-edit-enhanced">
    <!-- Edit Header -->
    <div class="edit-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="edit-title">{{ $t('workOrder.editWorkOrder') }}</h2>
            <div class="header-meta">
              <div class="edit-info">
                <el-icon><Edit /></el-icon>
                <span>ID: #{{ workOrder?.id }}</span>
              </div>
              <div class="edit-info">
                <el-icon><Calendar /></el-icon>
                <span>{{ $t('workOrder.form.created') }}: {{ formatDate(workOrder?.created_at) }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="header-actions">
            <el-button type="default" size="small" @click="$emit('back-to-detail')">
              <el-icon><ArrowLeft /></el-icon>
              {{ $t('workOrder.actions.backToDetail') }}
            </el-button>
            <el-button type="warning" size="small" @click="resetForm">
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('workOrder.actions.reset') }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Form Container -->
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="edit-form" v-loading="loading">
      <!-- Task Title -->
      <div class="form-section">
        <el-form-item prop="taskTitle">
          <el-input
            v-model="form.taskTitle"
            :placeholder="$t('workOrder.create.taskTitlePlaceholder')"
            size="large"
            class="task-title-input"
          />
        </el-form-item>
      </div>

      <!-- Description -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.form.description')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :placeholder="$t('workOrder.create.descriptionPlaceholder')"
            :rows="3"
            resize="vertical"
          />
        </el-form-item>
      </div>

      <!-- Location Tree Select -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.location')" prop="location">
          <el-tree-select
            v-model="form.location"
            :data="locationTreeData"
            :props="treeProps"
            :placeholder="$t('workOrder.create.locationPlaceholder')"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- Asset Tree Select -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.asset')" prop="asset">
          <el-tree-select
            v-model="form.asset"
            :data="assetTreeData"
            :props="treeProps"
            :placeholder="$t('workOrder.create.assetPlaceholder')"
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- Procedure Picker -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.procedure')" prop="procedure">
          <div class="procedure-picker">
            <div class="procedure-placeholder">
              <el-icon><Document /></el-icon>
              <span>{{ $t('workOrder.create.procedurePlaceholder') }}</span>
            </div>
            <el-button type="primary" plain @click="handleAddProcedure">
              + {{ $t('workOrder.create.addProcedure') }}
            </el-button>
          </div>
        </el-form-item>
      </div>

      <!-- Assignee -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.assignTo')" prop="assignee">
          <el-select
            v-model="form.assignee"
            :placeholder="$t('workOrder.create.assigneePlaceholder')"
            filterable
            remote
            style="width: 100%"
          >
            <el-option v-for="user in assigneeOptions" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
      </div>

      <!-- Estimated Time -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.estimatedTime')">
          <el-row :gutter="8">
            <el-col :span="12">
              <el-form-item prop="estimatedHours">
                <el-input-number
                  v-model="form.estimatedHours"
                  :min="0"
                  :max="999"
                  :placeholder="$t('workOrder.create.hours')"
                  style="width: 100%"
                />
                <div class="input-label">{{ $t('workOrder.create.hours') }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="estimatedMinutes">
                <el-input-number
                  v-model="form.estimatedMinutes"
                  :min="0"
                  :max="59"
                  :placeholder="$t('workOrder.create.minutes')"
                  style="width: 100%"
                />
                <div class="input-label">{{ $t('workOrder.create.minutes') }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
      </div>

      <!-- Due Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.dueDate')" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="datetime"
            :placeholder="$t('workOrder.create.dueDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </div>

      <!-- Start Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.startDate')" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="datetime"
            :placeholder="$t('workOrder.create.startDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </div>

      <!-- Work Type and Priority -->
      <div class="form-section">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('workOrder.create.workType')" prop="workType">
              <el-select
                v-model="form.workType"
                :placeholder="$t('workOrder.create.workTypePlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="type in workTypeOptions" :key="type.id" :label="type.name" :value="type.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('workOrder.create.priority')" prop="priority">
              <el-select
                v-model="form.priority"
                :placeholder="$t('workOrder.create.priorityPlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="priority in priorityOptions"
                  :key="priority.id"
                  :label="priority.name"
                  :value="priority.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Enhanced Recurrence Settings -->
      <div class="form-section">
        <div class="recurrence-editor">
          <el-form-item :label="$t('workOrder.create.recurrenceSettings')" prop="recurrence" required>
            <el-select
              v-model="form.recurrence"
              :placeholder="$t('workOrder.create.recurrencePlaceholder')"
              style="width: 100%"
              clearable
              @clear="form.recurrence = 'none'"
            >
              <el-option :label="$t('workOrder.recurrence.none')" value="none"></el-option>
              <el-option :label="$t('workOrder.recurrence.daily')" value="daily"></el-option>
              <el-option :label="$t('workOrder.recurrence.weekly')" value="weekly"></el-option>
              <el-option :label="$t('workOrder.recurrence.monthlyByDate')" value="monthlyByDate"></el-option>
              <el-option :label="$t('workOrder.recurrence.yearly')" value="yearly"></el-option>
            </el-select>
          </el-form-item>

          <!-- Weekly Interval Selection -->
          <div v-if="form.recurrence === 'weekly'" class="weekly-interval-selection">
            <el-form-item>
              <div class="repeat-interval">
                <span>{{ $t('workOrder.recurrence.every') }}</span>
                <el-input-number
                  v-model="form.recurrenceSettings.repeatInterval"
                  :min="1"
                  :max="52"
                  style="width: 120px; margin: 0 10px"
                />
                <span>{{ $t('workOrder.recurrence.weeksRepeat') }}</span>
              </div>
            </el-form-item>
          </div>

          <!-- Days of the Week Selection -->
          <div v-if="form.recurrence === 'weekly'" class="weekly-selection">
            <el-form-item>
              <el-checkbox-group v-model="form.recurrenceSettings.selectedDays">
                <el-checkbox-button :label="1">{{ $t('workOrder.days.monday') }}</el-checkbox-button>
                <el-checkbox-button :label="2">{{ $t('workOrder.days.tuesday') }}</el-checkbox-button>
                <el-checkbox-button :label="3">{{ $t('workOrder.days.wednesday') }}</el-checkbox-button>
                <el-checkbox-button :label="4">{{ $t('workOrder.days.thursday') }}</el-checkbox-button>
                <el-checkbox-button :label="5">{{ $t('workOrder.days.friday') }}</el-checkbox-button>
                <el-checkbox-button :label="6">{{ $t('workOrder.days.saturday') }}</el-checkbox-button>
                <el-checkbox-button :label="0">{{ $t('workOrder.days.sunday') }}</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </div>

          <!-- Monthly By Date Selection -->
          <div v-if="form.recurrence === 'monthlyByDate'" class="monthly-by-date-selection">
            <el-form-item>
              <div class="repeat-interval">
                <span>{{ $t('workOrder.recurrence.every') }}</span>
                <el-input-number
                  v-model="form.recurrenceSettings.monthlyRepeatInterval"
                  :min="1"
                  :max="12"
                  style="width: 120px; margin: 0 10px"
                />
                <span>{{ $t('workOrder.recurrence.monthsOn') }}</span>
                <el-select
                  v-model="form.recurrenceSettings.monthlyDate"
                  :placeholder="$t('workOrder.recurrence.selectDate')"
                  style="width: 100px; margin: 0 10px"
                >
                  <el-option
                    v-for="day in 31"
                    :key="day"
                    :label="`${day}${$t('workOrder.recurrence.dayOfMonth')}`"
                    :value="day"
                  />
                </el-select>
                <span>{{ $t('workOrder.recurrence.repeat') }}</span>
              </div>
            </el-form-item>
          </div>

          <!-- Yearly Selection -->
          <div v-if="form.recurrence === 'yearly'" class="yearly-selection">
            <el-form-item>
              <div class="repeat-interval">
                <span>{{ $t('workOrder.recurrence.every') }}</span>
                <el-input-number
                  v-model="form.recurrenceSettings.yearlyRepeatInterval"
                  :min="1"
                  :max="10"
                  style="width: 120px; margin: 0 6px"
                />
                <span>{{ $t('workOrder.recurrence.yearsOn') }}</span>

                <el-select
                  v-model="form.recurrenceSettings.yearlyMonth"
                  :placeholder="$t('workOrder.recurrence.selectMonth')"
                  style="width: 100px; margin: 0 6px"
                >
                  <el-option
                    v-for="month in 12"
                    :key="month"
                    :label="`${month}${$t('workOrder.recurrence.month')}`"
                    :value="month"
                  />
                </el-select>

                <el-select
                  v-model="form.recurrenceSettings.yearlyDay"
                  :placeholder="$t('workOrder.recurrence.selectDate')"
                  style="width: 100px; margin: 0 6px"
                >
                  <el-option
                    v-for="day in 31"
                    :key="day"
                    :label="`${day}${$t('workOrder.recurrence.dayOfMonth')}`"
                    :value="day"
                  />
                </el-select>

                <span>{{ $t('workOrder.recurrence.repeat') }}</span>
              </div>
            </el-form-item>
          </div>

          <!-- Start Date Time (Always Displayed) -->
          <el-form-item
            v-if="form.recurrence !== 'none'"
            :label="$t('workOrder.recurrence.startDateTime')"
            prop="recurrenceSettings.startDate"
            required
          >
            <el-date-picker
              v-model="form.recurrenceSettings.startDate"
              type="datetime"
              :placeholder="$t('workOrder.recurrence.selectStartTime')"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- End Date Time -->
          <el-form-item
            v-if="form.recurrence !== 'none'"
            :label="$t('workOrder.recurrence.endDateTime')"
            prop="recurrenceSettings.endDate"
            required
          >
            <el-date-picker
              v-model="form.recurrenceSettings.endDate"
              type="datetime"
              :placeholder="$t('workOrder.recurrence.selectEndTime')"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </div>

      <!-- Categories -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.categories')" prop="categories">
          <el-select
            v-model="form.categories"
            :placeholder="$t('workOrder.create.categoriesPlaceholder')"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Vendors -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.vendors')" prop="vendors">
          <el-select
            v-model="form.vendors"
            :placeholder="$t('workOrder.create.vendorsPlaceholder')"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option v-for="vendor in vendorOptions" :key="vendor.id" :label="vendor.name" :value="vendor.id" />
          </el-select>
        </el-form-item>
      </div>

      <!-- Enhanced File Upload Section with existing files support -->
      <div class="form-section">
        <div class="upload-section">
          <FileUploadMultiple
            ref="fileUploadRef"
            :existing-image-list="workOrder?.image_list || []"
            :existing-file-list="workOrder?.file_list || []"
            image-label="Work Order Images"
            file-label="Work Order Files"
            upload-type="both"
            :max-images="10"
            :max-files="15"
            @update:imageList="handleImageListUpdate"
            @update:filesList="handleFilesListUpdate"
            @remove-existing-image="handleRemoveExistingImage"
            @remove-existing-file="handleRemoveExistingFile"
          />
        </div>
      </div>

      <!-- Submit Button - Fixed at bottom -->
      <div class="form-actions-fixed">
        <div class="form-actions-content">
          <el-button type="default" size="large" @click="$emit('back-to-detail')" class="cancel-button">
            {{ $t('workOrder.actions.cancel') }}
          </el-button>
          <el-button type="primary" size="large" @click="submitForm" :loading="loading" class="update-button">
            {{ $t('workOrder.actions.update') }}
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, RefreshLeft, Document, Edit, Calendar } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { convertToLocalTime } from '@/utils/datetime'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import {
  getAllWorkTypes,
  getAllPriorities,
  getAllCategories,
  getLocationNodeTrees,
  getEquipmentNodeTrees
} from '@/api/workorder'

// Valid recurrence values from the UI
const VALID_RECURRENCES = new Set( ['daily', 'weekly', 'monthlyByDate', 'yearly'] )

// TODO: If you have an API for recurrence types, replace this static map
// with dynamic loading (e.g., getRecurrenceTypes()).
// const RECURRENCE_TYPE_MAP = {
//   daily : 1,
//   weekly : 2,
//   monthlyByDate : 3,
//   yearly : 4
// }

// Unused for now - keeping for future use
// const mapRecurrenceToId = val => {
//   if ( !val || !VALID_RECURRENCES.has( val ) ) return null
//   return RECURRENCE_TYPE_MAP[val] ?? null
// }

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

// Emits
const emit = defineEmits( ['back-to-detail', 'work-order-updated'] )

const { t } = useI18n()

// State
const formRef = ref( null )
const fileUploadRef = ref( null )
const loading = ref( false )
const removedExistingImages = ref( [] )
const removedExistingFiles = ref( [] )
const newImageFiles = ref( [] )
const newFiles = ref( [] )
const optionsLoaded = ref( false )

// Form data
const form = reactive( {
  taskTitle : '',
  pictures : [],
  description : '',
  location : null,
  asset : null,
  procedure : null,
  assignee : null,
  estimatedHours : 1,
  estimatedMinutes : 0,
  dueDate : null,
  startDate : null,
  recurrence : 'none',
  workType : null,
  priority : null,
  files : [],
  categories : [],
  vendors : [],
  recurrenceSettings : {
    repeatInterval : 1,
    selectedDays : [],
    monthlyRepeatInterval : 1,
    monthlyDate : 1,
    yearlyRepeatInterval : 1,
    yearlyMonth : 1,
    yearlyDay : 1,
    startDate : null,
    endDate : null
  }
} )

// Validation rules
const rules = reactive( {
  taskTitle : [{ required : true, message : t( 'workOrder.validation.taskTitleRequired' ), trigger : 'blur' }],
  location : [{ required : true, message : t( 'workOrder.validation.locationRequired' ), trigger : 'change' }],
  asset : [{ required : true, message : t( 'workOrder.validation.assetRequired' ), trigger : 'change' }]
} )

// Tree props for tree selects
const treeProps = {
  children : 'children',
  label : 'name',
  value : 'id'
}

// API data options (same as create form)
const priorityOptions = ref( [] )
const workTypeOptions = ref( [] )
const categoryOptions = ref( [] )
const locationTreeData = ref( [] )
const assetTreeData = ref( [] )

const assigneeOptions = ref( [
  { id : 1, name : 'John Doe' },
  { id : 2, name : 'Jane Smith' },
  { id : 3, name : 'Mike Johnson' },
  { id : 4, name : 'Sarah Wilson' }
] )

const vendorOptions = ref( [
  { id : 1, name : 'ABC Maintenance Co.' },
  { id : 2, name : 'XYZ Equipment Services' },
  { id : 3, name : 'TechFix Solutions' }
] )

// Load data from APIs (same as create form)
const loadFormData = async() => {
  try {
    loading.value = true
    console.log( 'WorkOrderEditEnhanced: Loading form data...' )

    const res = await Promise.all( [
      getAllWorkTypes(),
      getAllPriorities(),
      getAllCategories(),
      getLocationNodeTrees(),
      getEquipmentNodeTrees()
    ] )

    const [workTypesRes, prioritiesRes, categoriesRes, locationsRes, equipmentRes] = res

    console.log( 'WorkOrderEditEnhanced: API responses:', workTypesRes.data )

    if ( Array.isArray( workTypesRes.data.workTypes ) ) {
      workTypeOptions.value = workTypesRes.data.workTypes
    }

    if ( Array.isArray( prioritiesRes.data.priorities ) ) {
      priorityOptions.value = prioritiesRes.data.priorities
    }

    if ( Array.isArray( categoriesRes.data.categories ) ) {
      categoryOptions.value = categoriesRes.data.categories
    }

    if ( Array.isArray( locationsRes.data.locations ) ) {
      locationTreeData.value = locationsRes.data.locations
    }

    if ( Array.isArray( equipmentRes.data.equipment ) ) {
      assetTreeData.value = equipmentRes.data.equipment
    }
  } catch ( error ) {
    console.error( 'WorkOrderEditEnhanced: Failed to load form data:', error )
    const errorMessage = error.response?.data?.message || error.message || t( 'workOrder.messages.loadDataFailed' )
    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
    optionsLoaded.value = true
  }
}

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

// Convert 'YYYY-MM-DDTHH:mm:ss' (local timezone semantics) to UTC ISO string (...Z)
const toUtcIso = dateTimeString => {
  if ( !dateTimeString ) return null
  const normalized = dateTimeString.replace( ' ', 'T' ) // Fallback: in case it comes with space
  const d = new Date( normalized ) // Parse as "local time"
  if ( isNaN( d.getTime() ) ) return null
  return d.toISOString() // e.g. 2025-08-12T17:15:15.425Z
}

const populateForm = () => {
  if ( !props.workOrder ) return

  const wo = props.workOrder

  // Basic fields
  form.taskTitle = wo.name || ''
  form.description = wo.description || ''

  // Dates - convert to proper format for datetime pickers
  if ( wo.due_date ) {
    // Keep datetime format for editing (remove timezone for local editing)
    form.dueDate = wo.due_date.includes( 'T' ) ? wo.due_date.split( '+' )[0].split( 'Z' )[0] : `${wo.due_date}T00:00:00`
  }
  if ( wo.start_date ) {
    // Keep datetime format for editing (remove timezone for local editing)
    form.startDate = wo.start_date.includes( 'T' )
      ? wo.start_date.split( '+' )[0].split( 'Z' )[0]
      : `${wo.start_date}T00:00:00`
  }

  // Work type and priority
  if ( wo.work_type ) {
    form.workType = wo.work_type.id
  }
  if ( wo.priority ) {
    form.priority = wo.priority.id
  }

  // Categories
  if ( wo.categories ) {
    form.categories = [wo.categories.id]
  }

  // Equipment node (asset)
  if ( wo.equipment_node ) {
    form.asset = wo.equipment_node.id
  }

  // Estimated time
  if ( wo.estimated_minutes ) {
    form.estimatedHours = Math.floor( wo.estimated_minutes / 60 )
    form.estimatedMinutes = wo.estimated_minutes % 60
  }

  // Recurrence type
  if ( wo.recurrence_type ) {
    const recurrenceName = wo.recurrence_type.name?.toLowerCase()
    if ( recurrenceName === 'does not repeat' ) {
      form.recurrence = 'none'
    } else if ( recurrenceName === 'daily' ) {
      form.recurrence = 'daily'
    } else if ( recurrenceName === 'weekly' ) {
      form.recurrence = 'weekly'
    } else if ( recurrenceName === 'monthly' ) {
      form.recurrence = 'monthlyByDate'
    } else {
      form.recurrence = 'none'
    }
  }

  console.log( 'Form populated with work order data:', wo )
}

const handleAddProcedure = () => {
  ElMessage.info( t( 'workOrder.messages.procedurePickerNotImplemented' ) )
}

// File upload handlers
const handleImageListUpdate = imageFiles => {
  newImageFiles.value = imageFiles
  console.log( 'New image files:', imageFiles )
}

const handleFilesListUpdate = files => {
  newFiles.value = files
  console.log( 'New files:', files )
}

const handleRemoveExistingImage = imageUrl => {
  removedExistingImages.value.push( imageUrl )
  console.log( 'Marked existing image for removal:', imageUrl )
}

const handleRemoveExistingFile = fileUrl => {
  removedExistingFiles.value.push( fileUrl )
  console.log( 'Marked existing file for removal:', fileUrl )
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  // Reset file upload component
  if ( fileUploadRef.value ) {
    fileUploadRef.value.resetRemovedItems()
  }

  // Reset removal tracking
  removedExistingImages.value = []
  removedExistingFiles.value = []
  newImageFiles.value = []
  newFiles.value = []

  // Re-populate with original data
  populateForm()

  ElMessage.success( t( 'workOrder.messages.formReset' ) )
}

// Watcher to reset recurrence details when switching to none
watch(
  () => form.recurrence,
  val => {
    if ( !VALID_RECURRENCES.has( val ) ) {
      // reset sub-fields when none/invalid
      form.recurrenceSettings.startDate = null
      form.recurrenceSettings.endDate = null
      form.recurrenceSettings.repeatInterval = 1
      form.recurrenceSettings.selectedDays = []
      form.recurrenceSettings.monthlyRepeatInterval = 1
      form.recurrenceSettings.monthlyDate = 1
      form.recurrenceSettings.yearlyRepeatInterval = 1
      form.recurrenceSettings.yearlyMonth = 1
      form.recurrenceSettings.yearlyDay = 1
    }
  }
)

// Remove debugger for production
// onMounted( () => {
//   debugger
// } )

const submitForm = async() => {
  if ( !formRef.value ) return

  try {
    const valid = await formRef.value.validate()
    if ( !valid ) {
      ElMessage.error( t( 'workOrder.messages.validationFailed' ) )
      return
    }

    loading.value = true

    // Prepare properly formatted dates for backend (convert to UTC Z)
    const formattedDueDate = toUtcIso( form.dueDate )
    const formattedStartDate = toUtcIso( form.startDate )

    // Log update data for debugging
    console.log( 'Updating work order with data:', {
      id : props.workOrder.id,
      name : form.taskTitle,
      description : form.description,
      estimated_minutes : form.estimatedHours * 60 + form.estimatedMinutes,
      due_date : formattedDueDate,
      start_date : formattedStartDate,
      priority : form.priority,
      work_type : form.workType,
      categories : form.categories,
      equipment_node_id : form.asset,
      removedExistingImages : removedExistingImages.value,
      removedExistingFiles : removedExistingFiles.value,
      newImageFiles : newImageFiles.value,
      newFiles : newFiles.value
    } )

    // Simulate API call
    await new Promise( resolve => setTimeout( resolve, 1500 ) )

    // Mock successful update
    const updatedWorkOrder = {
      ...props.workOrder,
      name : form.taskTitle,
      description : form.description,
      estimated_minutes : form.estimatedHours * 60 + form.estimatedMinutes,
      due_date : formattedDueDate,
      start_date : formattedStartDate,
      priority : priorityOptions.value.find( p => p.id === form.priority ),
      work_type : workTypeOptions.value.find( wt => wt.id === form.workType ),
      categories : form.categories.length > 0 ? categoryOptions.value.find( c => c.id === form.categories[0] ) : null,
      updated_at : new Date().toISOString()
    }

    ElMessage.success( t( 'workOrder.messages.updateSuccess' ) )

    // Emit the updated work order
    emit( 'work-order-updated', updatedWorkOrder )
  } catch ( error ) {
    console.error( 'Failed to update work order:', error )
    ElMessage.error( t( 'workOrder.messages.updateFailed' ) )
  } finally {
    loading.value = false
  }
}

// Watch for prop changes to re-populate form
watch(
  () => props.workOrder,
  async newWorkOrder => {
    if ( !newWorkOrder ) return

    // Always make sure options are loaded before setting form values
    if ( !optionsLoaded.value ) {
      await loadFormData()
    }

    const wo = newWorkOrder

    // Basic fields
    form.taskTitle = wo.name || ''
    form.description = wo.description || ''

    // Dates - convert to proper format for datetime pickers
    form.dueDate = wo.due_date
      ? wo.due_date.includes( 'T' )
        ? wo.due_date.split( '+' )[0].split( 'Z' )[0]
        : `${wo.due_date}T00:00:00`
      : null
    form.startDate = wo.start_date
      ? wo.start_date.includes( 'T' )
        ? wo.start_date.split( '+' )[0].split( 'Z' )[0]
        : `${wo.start_date}T00:00:00`
      : null

    // Dropdowns — ensure type matches options (convert to number if needed)
    form.workType = wo.work_type ? parseInt( wo.work_type.id, 10 ) : null
    form.priority = wo.priority ? parseInt( wo.priority.id, 10 ) : null
    form.categories = Array.isArray( wo.categories )
      ? wo.categories.map( c => parseInt( c.id, 10 ) )
      : wo.categories
        ? [parseInt( wo.categories.id, 10 )]
        : []

    // Asset
    form.asset = wo.equipment_node ? Number( wo.equipment_node.id ) : null

    // Estimated time
    if ( wo.estimated_minutes ) {
      form.estimatedHours = Math.floor( wo.estimated_minutes / 60 )
      form.estimatedMinutes = wo.estimated_minutes % 60
    }
  },
  { immediate : true }
)

// Lifecycle
onMounted( async() => {
  await loadFormData()
  // Debug i18n setup
  console.log( '🌐 WorkOrderEditEnhanced i18n setup:', {
    updateKey : t( 'workOrder.actions.update' ),
    cancelKey : t( 'workOrder.actions.cancel' ),
    i18nInstance : !!t
  } )
} )

defineOptions( {
  name : 'WorkOrderEditEnhanced'
} )
</script>

<style scoped lang="scss">
// Import styles from WorkOrderCreateEnhanced and modify for edit
.work-order-edit-enhanced {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 24px;
  padding: 0px 24px 0px 24px; // Extra bottom padding for fixed buttons
  height: 100%;
  overflow-y: auto;
  position: relative; // Enable absolute positioning for children
}

// Header styling (consistent with WorkOrderDetail and Create)
.edit-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
    .edit-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      .edit-info {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

// Form styling (reuse from WorkOrderCreateEnhanced)
.edit-form {
  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // Task title input
  .task-title-input {
    :deep(.el-input__wrapper) {
      font-size: 16px;
      padding: 12px 16px;
    }
  }

  // Upload section styling
  .upload-section {
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    background: var(--el-fill-color-lighter);
  }

  // Procedure picker
  .procedure-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    background: var(--el-fill-color-lighter);

    .procedure-placeholder {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: var(--el-color-primary);
      font-size: 14px;

      .el-icon {
        font-size: 18px;
      }
    }
  }

  // Estimated time inputs
  .input-label {
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  // Recurrence editor styling
  .recurrence-editor {
    .weekly-interval-selection,
    .weekly-selection,
    .monthly-by-date-selection,
    .yearly-selection {
      margin-top: 15px;
    }

    .repeat-interval {
      display: flex;
      align-items: center;
      gap: 8px;

      span {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .weekly-selection {
      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  // Form actions - Fixed at bottom of parent container
  .form-actions-fixed {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);
    padding: 16px 24px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);

    .form-actions-content {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .update-button,
      .cancel-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        min-width: 120px;
      }

      .update-button {
        background-color: var(--el-color-warning);
        border-color: var(--el-color-warning);
        color: white;

        &:hover {
          background-color: var(--el-color-warning-light-3);
          border-color: var(--el-color-warning-light-3);
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .work-order-edit-enhanced {
    padding: 16px 16px 120px 16px; // Extra bottom padding for mobile
  }

  .edit-header {
    .header-actions {
      flex-direction: column;
      gap: 4px;
    }
  }

  // Mobile specific adjustments for fixed buttons
  .form-actions-fixed {
    padding: 12px 16px;

    .form-actions-content {
      flex-direction: column;
      gap: 8px;

      .update-button,
      .cancel-button {
        width: 100%;
        min-width: auto;
      }
    }
  }
}

.recurrence-editor {
  .repeat-interval {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .weekly-selection {
    :deep(.el-checkbox-group) {
      flex-direction: column;
      gap: 4px;
    }
  }
}
</style>
