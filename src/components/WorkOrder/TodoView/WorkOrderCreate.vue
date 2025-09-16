<template>
  <div class="work-order-create-enhanced">
    <!-- Create Header -->
    <div class="create-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="create-title">{{ $t('workOrder.newWorkOrder') }}</h2>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="header-actions">
            <el-button type="default" @click="$emit('back-to-detail')">
              <el-icon><ArrowLeft /></el-icon>
              {{ $t('workOrder.actions.backToDetail') }}
            </el-button>
            <el-button type="warning" @click="resetForm" plain>
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('workOrder.actions.reset') }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Form Container -->
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="create-form" v-loading="loading">
      <!-- Task Title -->
      <div class="form-section">
        <el-form-item prop="name">
          <el-input
            v-model="form.name"
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
        <el-form-item :label="$t('workOrder.create.location')" prop="location_id">
          <el-tree-select
            v-model="form.location_id"
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
        <el-form-item :label="$t('workOrder.create.asset')" prop="equipment_node_ids">
          <el-tree-select
            v-model="form.equipment_node_ids"
            :data="assetTreeData"
            :props="treeProps"
            :placeholder="$t('workOrder.create.assetPlaceholder')"
            check-strictly
            :render-after-expand="false"
            multiple
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- Assigned To -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.assignTo')" prop="assignee_ids">
          <el-select
            v-model="form.assignee_ids"
            :placeholder="$t('workOrder.create.assigneePlaceholder')"
            filterable
            multiple
            style="width: 100%"
          >
            <el-option v-for="user in assigneeOptions" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
      </div>

      <!-- Supervisor -->
      <div class="form-section">
        <el-form-item label="Supervisor" prop="approved_by_id">
          <el-select v-model="form.approved_by_id" placeholder="Select Supervisor" filterable style="width: 100%">
            <el-option
              v-for="supervisor in supervisorOptions"
              :key="supervisor.id"
              :label="supervisor.name"
              :value="supervisor.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Tasks -->
      <el-divider />
      <div class="form-section">
        <el-form-item label="Tasks">
          <!-- Task Action Buttons -->
          <div class="task-actions">
            <el-button size="small" @click="handleAddTask" :icon="Plus"> Add Task </el-button>
            <el-button size="small" @click="handleDeleteAllTasks" :icon="Delete">
              Clear All ({{ form.tasks.length }})
            </el-button>
          </div>
          <CardTable
            @selection="handleTaskAction"
            :module="4"
            :data="form.tasks"
            :maxHeight="maxHeight"
            :totalItems="totalItems"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :showBorder="true"
            :showPagination="false"
            :showSearch="false"
          />
        </el-form-item>
      </div>

      <!-- Standards -->
      <el-divider />
      <div class="form-section">
        <el-form-item label="Standards">
          <!-- Standards Action Buttons -->
          <div class="standards-actions">
            <el-button size="small" @click="handleAddStandard" :icon="Plus"> Add Standard </el-button>
            <el-button size="small" @click="handleDeleteAllStandards" :icon="Delete">
              Clear All ({{ form.standards.length }})
            </el-button>
          </div>
          <CardTable
            @selection="handleStandardAction"
            :module="6"
            :data="form.standards"
            :maxHeight="maxHeight"
            :totalItems="form.standards.length"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :showBorder="true"
            :showPagination="false"
            :showSearch="false"
          />
        </el-form-item>
      </div>

      <!-- Due Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.dueDate')" prop="due_date">
          <el-date-picker
            v-model="form.due_date"
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
        <el-form-item :label="$t('workOrder.create.startDate')" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="datetime"
            :placeholder="$t('workOrder.create.startDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </div>

      <!-- Work Type, Priority, and State -->
      <div class="form-section">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item :label="$t('workOrder.create.workType')" prop="work_type_id">
              <el-select
                v-model="form.work_type_id"
                :placeholder="$t('workOrder.create.workTypePlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="type in workTypeOptions" :key="type.id" :label="type.name" :value="type.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('workOrder.create.priority')" prop="priority_id">
              <el-select
                v-model="form.priority_id"
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
          <el-col :span="8">
            <el-form-item label="State" prop="state_id">
              <el-select v-model="form.state_id" placeholder="Select state..." style="width: 100%">
                <el-option v-for="state in stateOptions" :key="state.id" :label="state.name" :value="state.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Recurrence Settings -->
      <div class="form-section">
        <RecurrenceEditor v-model:recurrence-setting="form.recurrence_setting" />
      </div>

      <!-- Categories -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.categories')" prop="category_ids">
          <el-select
            v-model="form.category_ids"
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

      <!-- Image and File Upload Section -->
      <div class="form-section">
        <el-divider />
        <div class="upload-section">
          <FileUploadMultiple
            @update:imageList="handleImageListUpdate"
            @update:filesList="handleFilesListUpdate"
            :image-label="$t('workOrder.create.imageUpload')"
            :file-label="$t('workOrder.create.fileUpload')"
            upload-type="both"
            :max-images="5"
            :max-files="10"
          />
        </div>
      </div>

      <!-- Add Task Dialog -->
      <el-dialog
        v-model="showAddTaskDialog"
        title="Add New Task"
        width="600px"
        :before-close="handleCloseAddTaskDialog"
      >
        <AddTask v-if="showAddTaskDialog" @close="closeAddTaskDialog" @add-templates="onAddTaskTemplates" />
      </el-dialog>

      <!-- Add Standard Dialog -->
      <el-dialog
        v-model="showAddStandardDialog"
        title="Add New Standard"
        width="600px"
        :before-close="handleCloseAddStandardDialog"
      >
        <AddStandard v-if="showAddStandardDialog" @close="closeAddStandardDialog" @add-standards="onAddStandards" />
      </el-dialog>

      <!-- Submit Button - Fixed at bottom -->
      <div class="form-actions-fixed">
        <div class="form-actions-content">
          <el-button type="default" @click="$emit('back-to-detail')" class="cancel-button">
            {{ $t('workOrder.actions.cancel') }}
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="loading" class="create-button">
            {{ $t('workOrder.actions.create') }}
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, RefreshLeft, Plus, Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import RecurrenceEditor from '@/views/workOrder/components/RecurrenceEditor.vue'
import CardTable from '../../Tables/CardTable.vue'
import AddTask from '../../Task/AddTask.vue'
import AddStandard from '../../Standard/AddStandard.vue'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '@/api/minio.js'
import {
  getAllWorkTypes,
  getAllPriorities,
  getAllCategories,
  getAllStates,
  getLocationNodeTrees,
  getEquipmentNodeTrees,
  createWorkOrder
} from '@/api/work-order'

// Initialize form.tasks with sample data
onMounted( () => {
  form.tasks = [
    {
      id : 1,
      name : 'HVAC Filter Replacement',
      category : 'Preventive Maintenance',
      estimated_minutes : 30
    },
    {
      id : 2,
      name : 'Fire Extinguisher Inspection',
      category : 'Safety',
      estimated_minutes : 15
    },
    {
      id : 3,
      name : 'Electrical Panel Check',
      category : 'Safety Inspection',
      estimated_minutes : 45
    },
    {
      id : 4,
      name : 'Emergency Lighting Test',
      category : 'Safety Testing',
      estimated_minutes : 20
    },
    {
      id : 5,
      name : 'Conveyor Belt Maintenance',
      category : 'Equipment Maintenance',
      estimated_minutes : 90
    },
    {
      id : 6,
      name : 'Water System Pressure Check',
      category : 'Plumbing',
      estimated_minutes : 25
    },
    {
      id : 7,
      name : 'Generator Monthly Test',
      category : 'Power Systems',
      estimated_minutes : 60
    },
    {
      id : 8,
      name : 'Roof Drain Cleaning',
      category : 'Building Maintenance',
      estimated_minutes : 40
    }
  ]

  form.standards = [
    {
      id : 1,
      name : 'Safety Protocol Checklist',
      category : 'Safety Standards',
      estimated_minutes : 20
    },
    {
      id : 2,
      name : 'Equipment Inspection Standard',
      category : 'Quality Control',
      estimated_minutes : 35
    },
    {
      id : 3,
      name : 'Environmental Compliance Check',
      category : 'Environmental',
      estimated_minutes : 40
    },
    {
      id : 4,
      name : 'Documentation Standard',
      category : 'Administrative',
      estimated_minutes : 15
    }
  ]

  loadFormData()
} )

const showAddTaskDialog = ref( false )
const showAddStandardDialog = ref( false )

const handleAddStandard = () => {
  showAddStandardDialog.value = true
}

const closeAddStandardDialog = () => {
  showAddStandardDialog.value = false
}

const handleAddTask = () => {
  showAddTaskDialog.value = true
}

// Pagination variables for Tasks and Standards
const totalItems = ref( 8 )
const maxHeight = ref( '200px' )
const currentPage = ref( 1 )
const pageSize = ref( 10 )

const closeAddTaskDialog = () => {
  showAddTaskDialog.value = false
}

const handleTaskAction = ( { id, action, data } ) => {
  console.log( 'Task action received:', id, action, data )
  if ( action === 'edit' ) {
    // something here later
  } else if ( action === 'delete' ) {
    form.tasks = form.tasks.filter( t => t.id !== id )
    ElMessage.success( `Task "${data.name}" removed` )
  }
}

const handleStandardAction = ( { id, action, data } ) => {
  console.log( 'Standard action received:', id, action, data )
  if ( action === 'edit' ) {
    // something here later
  } else if ( action === 'delete' ) {
    form.standards = form.standards.filter( s => s.id !== id )
    ElMessage.success( `Standard "${data.name}" removed` )
  }
}

const handleCloseAddTaskDialog = done => {
  done()
}

const onAddTaskTemplates = selectedTemplates => {
  console.log( 'Adding templates:', selectedTemplates )

  if ( selectedTemplates && selectedTemplates.length > 0 ) {
    // Get the highest existing ID to generate new unique IDs
    const maxId = form.tasks.length > 0 ? Math.max( ...form.tasks.map( task => task.id ) ) : 0

    // Append selected templates to form.tasks with new unique IDs
    const newTasks = selectedTemplates.map( ( template, index ) => ( {
      id : maxId + index + 1, // Generate new unique ID
      name : template.name,
      category : template.category,
      estimated_minutes : template.estimated_minutes,
      // Add any other properties from template that you need
      ...template
    } ) )

    // Append to existing tasks
    form.tasks.push( ...newTasks )

    // Show success message
    ElMessage.success(
      `${selectedTemplates.length} task template${selectedTemplates.length > 1 ? 's' : ''} added successfully`
    )

    // Close the dialog
    closeAddTaskDialog()
  }
}

const handleDeleteAllTasks = () => {
  if ( form.tasks.length === 0 ) {
    ElMessage.warning( 'No tasks selected to delete' )
    return
  }

  form.tasks = []
  ElMessage.success( 'All task selections cleared' )
}

const onAddStandards = selectedStandards => {
  console.log( 'Adding standards:', selectedStandards )

  if ( selectedStandards && selectedStandards.length > 0 ) {
    // Get the highest existing ID to generate new unique IDs
    const maxId = form.standards.length > 0 ? Math.max( ...form.standards.map( standard => standard.id ) ) : 0

    // Append selected standards to form.standards with new unique IDs
    const newStandards = selectedStandards.map( ( standard, index ) => ( {
      id : maxId + index + 1, // Generate new unique ID
      name : standard.name,
      category : standard.category,
      estimated_minutes : standard.estimated_minutes,
      // Add any other properties from standard that you need
      ...standard
    } ) )

    // Append to existing standards
    form.standards.push( ...newStandards )

    // Show success message
    ElMessage.success(
      `${selectedStandards.length} standard${selectedStandards.length > 1 ? 's' : ''} added successfully`
    )

    // Close the dialog
    closeAddStandardDialog()
  }
}

const handleDeleteAllStandards = () => {
  if ( form.standards.length === 0 ) {
    ElMessage.warning( 'No standards selected to delete' )
    return
  }

  form.standards = []
  ElMessage.success( 'All standard selections cleared' )
}

const handleCloseAddStandardDialog = done => {
  done()
}

// Emits
const emit = defineEmits( ['back-to-detail', 'work-order-created'] )

const { t } = useI18n()

// Component mounted
onMounted( () => {
  loadFormData()
} )

// Form data - matching API requirements
const form = reactive( {
  name : '',
  description : '',
  category_ids : [],
  priority_id : null,
  state_id : 1,
  work_type_id : null,
  location_id : null,
  equipment_node_ids : [],
  vendor_ids : [],
  assignee_ids : [],
  approved_by_id : null,
  time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
  start_date : null,
  due_date : null,
  recurrence_type_id : null,
  recurrence_type : null,
  recurrence_setting : {},
  recurrence_setting_request : {
    start_date_time : null
  },
  task_add_list : [],
  image_list : [],
  file_list : [],
  standard_list : [],
  tasks : [],
  standards : []
} )

// Validation rules
const rules = reactive( {
  name : [{ required : true, message : t( 'workOrder.validation.taskTitleRequired' ), trigger : 'blur' }],
  category_ids : [{ required : true, message : 'At least one category is required', trigger : 'change' }],
  equipment_node_ids : [{ required : true, message : 'At least one equipment is required', trigger : 'change' }],
  work_type_id : [{ required : true, message : t( 'workOrder.validation.workTypeRequired' ), trigger : 'change' }],
  priority_id : [{ required : true, message : t( 'workOrder.validation.priorityRequired' ), trigger : 'change' }],
  start_date : [{ required : true, message : 'Start date is required', trigger : 'change' }],
  due_date : [{ required : true, message : 'Due date is required', trigger : 'change' }]
} )

// Tree props for tree selects
const treeProps = {
  children : 'children',
  label : 'name',
  value : 'id'
}

// API data options
const priorityOptions = ref( [] )
const workTypeOptions = ref( [] )
const categoryOptions = ref( [] )
const stateOptions = ref( [] )
const locationTreeData = ref( [] )
const assetTreeData = ref( [] )
const loading = ref( false )

const assigneeOptions = ref( [
  { id : 1, name : 'Erik Yu' },
  { id : 2, name : 'Jane Smith' },
  { id : 3, name : 'Mike Johnson' },
  { id : 4, name : 'Sarah Wilson' }
] )

const supervisorOptions = ref( [
  { id : 1, name : 'Erik Yu' },
  { id : 2, name : 'Mary Johnson' },
  { id : 3, name : 'Robert Brown' },
  { id : 4, name : 'Lisa Davis' }
] )
const formRef = ref( null )

// Load data from APIs
const loadFormData = async() => {
  try {
    loading.value = true

    const [workTypesRes, prioritiesRes, categoriesRes, statesRes, locationsRes, equipmentRes] = await Promise.all( [
      getAllWorkTypes(),
      getAllPriorities(),
      getAllCategories(),
      getAllStates(),
      getLocationNodeTrees(),
      getEquipmentNodeTrees()
    ] )

    if ( workTypesRes.data ) {
      workTypeOptions.value = workTypesRes.data
    }

    if ( prioritiesRes.data ) {
      priorityOptions.value = prioritiesRes.data
    }

    if ( categoriesRes.data ) {
      categoryOptions.value = categoriesRes.data
    }

    if ( statesRes.data ) {
      stateOptions.value = statesRes.data
    }

    if ( locationsRes.data ) {
      locationTreeData.value = locationsRes.data
    }

    if ( equipmentRes.data ) {
      assetTreeData.value = equipmentRes.data
    }
  } catch ( error ) {
    console.error( 'WorkOrderCreate: Failed to load form data:', error )
    // Show specific error message if available
    const errorMessage = error.response?.data?.message || error.message || t( 'workOrder.messages.loadDataFailed' )
    ElMessage.error( errorMessage )

    // Disable form if critical data loading fails
    if ( !workTypeOptions.value.length || !priorityOptions.value.length ) {
      ElMessage.warning( t( 'workOrder.messages.criticalDataMissing' ) )
    }
  } finally {
    loading.value = false
  }
}

// Convert 'YYYY-MM-DDTHH:mm:ss' (local timezone semantics) to UTC ISO string (...Z)
const toUtcIso = dateTimeString => {
  if ( !dateTimeString ) return null
  const normalized = dateTimeString.replace( ' ', 'T' ) // Fallback: in case it comes with space
  const d = new Date( normalized ) // Parse as "local time"
  if ( isNaN( d.getTime() ) ) return null
  return d.toISOString() // e.g. 2025-08-12T17:15:15.425Z
}

// Upload handlers following equipment module pattern
const handleImageListUpdate = images => {
  form.image_list = images
}

const handleFilesListUpdate = files => {
  form.file_list = files
}

// Upload files to MinIO server
const uploadFilesToServer = async() => {
  try {
    let uploadedImages = []
    let uploadedFiles = []

    // Upload images if they exist
    if ( form.image_list.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( form.image_list )
      uploadedImages = imageRes.data.uploadedFiles || []
      form.image_list = uploadedImages.map( file => file.url )
    }

    // Upload files if they exist
    if ( form.file_list.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( form.file_list )
      uploadedFiles = fileRes.data.uploadedFiles || []
      form.file_list = uploadedFiles.map( file => file.url )
    }

    return { uploadedImages, uploadedFiles }
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    throw new Error( 'File upload failed' )
  }
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  // Reset form to initial values
  Object.assign( form, {
    name : '',
    description : '',
    category_ids : [],
    priority_id : null,
    state_id : 1,
    work_type_id : null,
    location_id : null,
    equipment_node_ids : [],
    vendor_ids : [],
    assignee_ids : [],
    approved_by_id : null,
    time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
    start_date : null,
    due_date : null,
    recurrence_type_id : null,
    recurrence_type : null,
    recurrence_setting : {},
    recurrence_setting_request : {
      start_date_time : null
    },
    task_add_list : [],
    image_list : [],
    file_list : [],
    standard_list : [],
    tasks : [],
    standards : []
  } )

  ElMessage.success( t( 'workOrder.messages.formReset' ) )
}

// Watcher to sync recurrence_type from recurrence_setting
watch(
  () => form.recurrence_setting,
  newVal => {
    if ( newVal && typeof newVal === 'object' ) {
      // The RecurrenceEditor outputs recurrence_type, map it correctly
      form.recurrence_type = newVal.recurrence_type
      form.recurrence_type_id = newVal.recurrence_type

      // Update the recurrence_setting_request
      form.recurrence_setting_request = {
        start_date_time : newVal.start_date_time || form.start_date,
        end_date_time : newVal.end_date_time,
        month_of_year : newVal.month_of_year,
        day_of_month : newVal.day_of_month,
        days_of_week : newVal.days_of_week,
        interval : newVal.interval,
        duration_minutes : newVal.duration_minutes
      }
    }
  },
  { deep : true }
)

const submitForm = async() => {
  if ( !formRef.value ) return

  try {
    const valid = await formRef.value.validate()
    if ( !valid ) {
      ElMessage.error( t( 'workOrder.messages.validationFailed' ) )
      return
    }

    loading.value = true

    // Upload files to MinIO first if there are any files
    if ( form.image_list.length > 0 || form.file_list.length > 0 ) {
      await uploadFilesToServer()
    }

    // Prepare properly formatted dates for backend (convert to UTC Z)
    const formattedDueDate = toUtcIso( form.due_date )
    const formattedStartDate = toUtcIso( form.start_date )

    // Ensure start_date_time is set for recurrence
    if ( !form.recurrence_setting_request.start_date_time && formattedStartDate ) {
      form.recurrence_setting_request.start_date_time = formattedStartDate
    }

    // Ensure we have a valid recurrence_type (default to 1 if not set)
    const recurrenceType = form.recurrence_type || form.recurrence_type_id || 1

    // Convert tasks to task_add_list format (ensure we always have an array)
    const taskAddList =
      form.tasks && form.tasks.length > 0
        ? form.tasks.map( task => ( {
          name : task.name,
          description : task.description || '',
          time_estimate_sec : ( task.estimated_minutes || 0 ) * 60,
          steps : [], // Temporarily empty as per requirements
          work_order_id : 0,
          attachments : [],
          assignee_ids : [],
          equipment_node_id : null,
          location_id : null,
          category_id : null
        } ) )
        : [
          {
            name : 'Default Task',
            description : 'Auto-generated default task',
            time_estimate_sec : 300, // 5 minutes default
            steps : [],
            work_order_id : 0,
            attachments : [],
            assignee_ids : [],
            equipment_node_id : null,
            location_id : null,
            category_id : null
          }
        ]

    // Prepare payload according to API specification
    const payload = {
      name : form.name,
      description : form.description,
      category_ids : form.category_ids,
      priority_id : form.priority_id,
      state_id : form.state_id,
      work_type_id : form.work_type_id,
      location_id : form.location_id,
      equipment_node_ids : form.equipment_node_ids,
      vendor_ids : form.vendor_ids,
      assignee_ids : form.assignee_ids,
      approved_by_id : form.approved_by_id,
      time_zone : form.time_zone,
      start_date : formattedStartDate,
      due_date : formattedDueDate,
      recurrence_type : recurrenceType,
      recurrence_type_id : recurrenceType,
      recurrence_setting_request : form.recurrence_setting_request,
      task_add_list : taskAddList,
      image_list : form.image_list, // Already URLs after MinIO upload
      file_list : form.file_list, // Already URLs after MinIO upload
      standard_list : form.standard_list
    }

    // Remove null/undefined values but keep required fields
    Object.keys( payload ).forEach( key => {
      if ( payload[key] === null || payload[key] === undefined ) {
        // Don't delete required fields, set defaults instead
        if ( ['category_ids', 'equipment_node_ids', 'task_add_list', 'recurrence_setting_request'].includes( key ) ) {
          if ( key === 'category_ids' || key === 'equipment_node_ids' ) {
            payload[key] = []
          } else if ( key === 'task_add_list' ) {
            // Already handled above
          } else if ( key === 'recurrence_setting_request' ) {
            payload[key] = { start_date_time : formattedStartDate }
          }
        } else {
          delete payload[key]
        }
      }
    } )

    console.log( 'Sending payload:', payload )

    // Call backend API
    const response = await createWorkOrder( payload )

    // Show success message
    ElMessage.success( 'Work order created successfully!' )

    // Emit the created work order (can be single or array)
    const createdWorkOrders = Array.isArray( response.data ) ? response.data : [response.data]

    createdWorkOrders.forEach( ( workOrder, index ) => {
      emit( 'work-order-created', workOrder )
    } )

    // Reset form after successful creation
    resetForm()
  } catch ( error ) {
    console.error( 'Failed to create work order:', error )
    const errorMessage = error.response?.data?.message || error.message || t( 'workOrder.messages.createFailed' )
    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
  }
}

defineOptions( {
  name : 'WorkOrderCreate'
} )
</script>

<style scoped lang="scss">
.work-order-create-enhanced {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 0px 24px 0px 24px;
  margin-top: 24px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.create-header {
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
    .create-title {
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

      .create-info {
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

// Form styling
.create-form {
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
    .image-uploader {
      margin-bottom: 20px;

      :deep(.el-upload--picture-card) {
        width: 148px;
        height: 148px;
        border: 2px dashed #cce0ff;
        border-radius: 4px;
        background: var(--el-fill-color-lighter);
      }
    }

    .file-uploader {
      :deep(.el-upload-list) {
        margin-top: 10px;
      }
    }
  }

  // Image preview dialog
  .image-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
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

  // Task action buttons
  .task-actions {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
  }

  // Task action buttons
  .standards-actions {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
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
    padding: 10px 24px;
    box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);

    .form-actions-content {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .create-button,
      .cancel-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        min-width: 120px;
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .work-order-create-enhanced {
    padding: 16px 16px 0px 16px; // Extra bottom padding for mobile
  }

  .create-header {
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

      .create-button,
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
