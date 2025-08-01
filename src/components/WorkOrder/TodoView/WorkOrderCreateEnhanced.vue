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
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="create-form" v-loading="loading">
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
            type="date"
            :placeholder="$t('workOrder.create.dueDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </div>

      <!-- Start Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.startDate')" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            :placeholder="$t('workOrder.create.startDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
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
                  :key="priority.value"
                  :label="priority.label"
                  :value="priority.value"
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
              value-format="YYYY-MM-DD HH:mm:ss"
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
              value-format="YYYY-MM-DD HH:mm:ss"
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

      <!-- Image and File Upload Section -->
      <div class="form-section">
        <div class="upload-section">
          <!-- Image Upload -->
          <el-form-item :label="$t('workOrder.create.imageUpload')" prop="pictures">
            <el-upload
              v-model:file-list="form.pictures"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="5"
              accept="image/*"
              class="image-uploader"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleImageRemove"
              :on-change="handleImageChange"
            >
              <el-icon><Plus /></el-icon>

              <!-- File Item Template -->
              <template #file="{ file }">
                <div>
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                  <span class="el-upload-list__item-actions">
                    <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                      <el-icon><ZoomIn /></el-icon>
                    </span>
                    <span class="el-upload-list__item-delete" @click="handleImageDownload(file)">
                      <el-icon><Download /></el-icon>
                    </span>
                    <span class="el-upload-list__item-delete" @click="handleImageRemove(file)">
                      <el-icon><Delete /></el-icon>
                    </span>
                  </span>
                </div>
              </template>
            </el-upload>

            <!-- Image Preview Dialog -->
            <el-dialog v-model="imageDialogVisible" fullscreen append-to-body>
              <div class="image-wrapper">
                <img :src="dialogImageUrl" alt="Preview Image" />
              </div>
            </el-dialog>
          </el-form-item>

          <!-- File Upload -->
          <el-form-item :label="$t('workOrder.create.fileUpload')" prop="files">
            <el-upload
              v-model:file-list="form.files"
              action="#"
              list-type="text"
              :auto-upload="false"
              :limit="10"
              multiple
              class="file-uploader"
              :on-remove="handleFileRemove"
              :on-change="handleFileChange"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
            >
              <el-button size="small" type="success">{{ $t('workOrder.create.clickToUpload') }}</el-button>
            </el-upload>
          </el-form-item>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <el-button type="primary" size="large" @click="submitForm" :loading="loading" class="create-button">
          {{ $t('workOrder.actions.create') }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, RefreshLeft, Document, Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

// Props
// const props = defineProps({
//   // No props needed for now
// })

// Emits
const emit = defineEmits(['back-to-detail', 'work-order-created'])

const { t } = useI18n()

// State
const formRef = ref(null)
const loading = ref(false)

// Upload dialog state
const imageDialogVisible = ref(false)
const dialogImageUrl = ref('')

// Form data
const form = reactive({
  taskTitle: '',
  pictures: [],
  description: '',
  location: null,
  asset: null,
  procedure: null,
  assignee: null,
  estimatedHours: 1,
  estimatedMinutes: 0,
  dueDate: null,
  startDate: null,
  recurrence: 'none',
  workType: 'reactive',
  priority: 'none',
  files: [],
  categories: [],
  vendors: [],
  recurrenceSettings: {
    repeatInterval: 1,
    selectedDays: [],
    monthlyRepeatInterval: 1,
    monthlyDate: 1,
    yearlyRepeatInterval: 1,
    yearlyMonth: 1,
    yearlyDay: 1,
    startDate: null,
    endDate: null,
  },
})

// Validation rules
const rules = reactive({
  taskTitle: [{ required: true, message: t('workOrder.validation.taskTitleRequired'), trigger: 'blur' }],
  location: [{ required: true, message: t('workOrder.validation.locationRequired'), trigger: 'change' }],
  asset: [{ required: true, message: t('workOrder.validation.assetRequired'), trigger: 'change' }],
})

// Tree props for tree selects
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id',
}

// Mock data options
const priorityOptions = [
  { value: 'none', label: t('workOrder.priority.none') },
  { value: 'low', label: t('workOrder.priority.low') },
  { value: 'medium', label: t('workOrder.priority.medium') },
  { value: 'high', label: t('workOrder.priority.high') },
]

// const recurrenceOptions = [
//   { value : 'does-not-repeat', label : t( 'workOrder.recurrence.doesNotRepeat' ) },
//   { value : 'daily', label : t( 'workOrder.recurrence.daily' ) },
//   { value : 'weekly', label : t( 'workOrder.recurrence.weekly' ) },
//   { value : 'monthly', label : t( 'workOrder.recurrence.monthly' ) }
// ]

const workTypeOptions = ref([
  { id: 1, name: 'Preventative' },
  { id: 2, name: 'Reactive' },
  { id: 3, name: 'Follow-up' },
  { id: 4, name: 'Other' },
])

const assigneeOptions = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Wilson' },
])

const categoryOptions = ref([
  { id: 1, name: 'Mechanical' },
  { id: 2, name: 'Electrical' },
  { id: 3, name: 'Hydraulic' },
  { id: 4, name: 'Pneumatic' },
  { id: 5, name: 'Safety' },
])

const vendorOptions = ref([
  { id: 1, name: 'ABC Maintenance Co.' },
  { id: 2, name: 'XYZ Equipment Services' },
  { id: 3, name: 'TechFix Solutions' },
])

// Location tree data (reusing from WorkOrderDetail)
const locationTreeData = ref([
  {
    id: 'building-a',
    name: 'Manufacturing Building A',
    children: [
      {
        id: 'floor-1',
        name: 'Ground Floor',
        children: [
          { id: 'room-101', name: 'Production Area 101' },
          { id: 'room-102', name: 'Storage Room 102' },
          { id: 'room-103', name: 'Quality Control Lab 103' },
        ],
      },
      {
        id: 'floor-2',
        name: 'Second Floor',
        children: [
          { id: 'room-201', name: 'Processing Area 201' },
          { id: 'room-202', name: 'Packaging Area 202' },
        ],
      },
    ],
  },
  {
    id: 'building-b',
    name: 'Manufacturing Building B',
    children: [
      {
        id: 'floor-b1',
        name: 'Ground Floor',
        children: [
          { id: 'room-b101', name: 'Assembly Line 1' },
          { id: 'room-b102', name: 'Assembly Line 2' },
        ],
      },
    ],
  },
])

// Asset tree data (equipment hierarchy)
const assetTreeData = ref([
  {
    id: 'line-a',
    name: 'Food Processing Line A',
    children: [
      {
        id: 'steam-equipment',
        name: 'Steam Processing Equipment',
        children: [
          { id: 'steam-peeler', name: 'Steam Peeler' },
          { id: 'steam-blancher', name: 'Steam Blancher' },
        ],
      },
      {
        id: 'conveyor-systems',
        name: 'Conveyor Systems',
        children: [
          { id: 'main-conveyor', name: 'Main Conveyor Belt' },
          { id: 'sorting-conveyor', name: 'Sorting Conveyor' },
        ],
      },
    ],
  },
  {
    id: 'line-b',
    name: 'Food Processing Line B',
    children: [
      {
        id: 'packaging-equipment',
        name: 'Packaging Equipment',
        children: [
          { id: 'sealing-machine', name: 'Sealing Machine' },
          { id: 'labeling-machine', name: 'Labeling Machine' },
        ],
      },
    ],
  },
])

const handleAddProcedure = () => {
  // TODO: Implement procedure picker modal
  ElMessage.info(t('workOrder.messages.procedurePickerNotImplemented'))
}

// Image upload handlers
const handlePictureCardPreview = file => {
  if (file.url) {
    dialogImageUrl.value = file.url
    imageDialogVisible.value = true
  } else {
    console.error('Invalid image URL. Please check the file object:', file)
  }
}

const handleImageRemove = file => {
  const index = form.pictures.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    form.pictures.splice(index, 1)
  } else {
    console.error('File not found in pictures list.')
  }
}

const handleImageChange = (file, uploadFileList) => {
  const readerPromises = uploadFileList.map(uploadedFile => {
    return new Promise(resolve => {
      if (!uploadedFile.uid) {
        uploadedFile.uid = Date.now().toString()
      }

      if (!uploadedFile.raw) {
        resolve(uploadedFile)
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        uploadedFile.url = e.target.result
        resolve(uploadedFile)
      }
      reader.readAsDataURL(uploadedFile.raw)
    })
  })

  Promise.all(readerPromises).then(resolvedList => {
    form.pictures = resolvedList
  })
}

const handleImageDownload = file => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name || 'downloaded_image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    console.error('File URL not available for download.')
  }
}

// File upload handlers
const handleFileRemove = file => {
  const index = form.files.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    form.files.splice(index, 1)
  } else {
    console.error('File not found in files list.')
  }
}

const handleFileChange = (file, newFileList) => {
  const readerPromises = newFileList.map(uploadedFile => {
    return new Promise(resolve => {
      if (!uploadedFile.uid) {
        uploadedFile.uid = Date.now().toString()
      }

      if (!uploadedFile.raw) {
        resolve(uploadedFile)
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        uploadedFile.url = e.target.result
        resolve(uploadedFile)
      }
      reader.readAsDataURL(uploadedFile.raw)
    })
  })

  Promise.all(readerPromises).then(resolvedList => {
    form.files = resolvedList
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  // Reset form to initial values
  Object.assign(form, {
    taskTitle: '',
    pictures: [],
    description: '',
    location: null,
    asset: null,
    procedure: null,
    assignee: null,
    estimatedHours: 1,
    estimatedMinutes: 0,
    dueDate: null,
    startDate: null,
    recurrence: 'none',
    workType: 'reactive',
    priority: 'none',
    files: [],
    categories: [],
    vendors: [],
    recurrenceSettings: {
      repeatInterval: 1,
      selectedDays: [],
      monthlyRepeatInterval: 1,
      monthlyDate: 1,
      yearlyRepeatInterval: 1,
      yearlyMonth: 1,
      yearlyDay: 1,
      startDate: null,
      endDate: null,
    },
  })

  ElMessage.success(t('workOrder.messages.formReset'))
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      ElMessage.error(t('workOrder.messages.validationFailed'))
      return
    }

    loading.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock successful creation
    const mockWorkOrder = {
      id: Date.now(),
      name: form.taskTitle,
      description: form.description,
      estimated_minutes: form.estimatedHours * 60 + form.estimatedMinutes,
      due_date: form.dueDate,
      start_date: form.startDate,
      priority: { name: priorityOptions.find(p => p.value === form.priority)?.label || 'None' },
      work_type: workTypeOptions.value.find(wt => wt.id === form.workType),
      categories: form.categories,
      created_at: new Date().toISOString(),
      state: { name: 'Ready' },
      assigned_to: form.assignee,
      location_id: form.location,
      asset_id: form.asset,
    }

    ElMessage.success(t('workOrder.messages.createSuccess'))

    // Emit the created work order
    emit('work-order-created', mockWorkOrder)

    // Reset form after successful creation
    resetForm()
  } catch (error) {
    console.error('Failed to create work order:', error)
    ElMessage.error(t('workOrder.messages.createFailed'))
  } finally {
    loading.value = false
  }
}

defineOptions({
  name: 'WorkOrderCreateEnhanced',
})
</script>

<style scoped lang="scss">
.work-order-create-enhanced {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

// Header styling (consistent with WorkOrderDetail)
.create-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);

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

  // Form actions
  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-light);
    margin-top: 32px;

    .create-button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .work-order-create-enhanced {
    padding: 16px;
  }

  .create-header {
    .header-actions {
      flex-direction: column;
      gap: 4px;
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
}
</style>
