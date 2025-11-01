<template>
  <el-form ref="formRef" :model="localForm" :rules="rules" label-width="150px" class="vendor-form" label-position="top">
    <!-- Two-column group (everything before Description) -->
    <div class="grid-2">
      <el-form-item label="Name" prop="name">
        <el-input v-model="localForm.name" placeholder="Enter vendor name" clearable />
      </el-form-item>

      <el-form-item label="Code" prop="code">
        <el-input v-model="localForm.code" placeholder="Enter unique vendor code" clearable />
      </el-form-item>

      <el-form-item label="Phone Number" prop="phone_number">
        <el-input v-model="localForm.phone_number" placeholder="Enter phone number" clearable />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input v-model="localForm.email" placeholder="Enter email" clearable />
      </el-form-item>

      <el-form-item label="Website" prop="website">
        <el-input v-model="localForm.website" placeholder="Enter website" clearable />
      </el-form-item>
    </div>

    <!-- Full-width Address -->
    <el-form-item label="Address" class="full-span">
      <el-input v-model="localForm.address" placeholder="Enter address" clearable />
    </el-form-item>

    <!-- Full-width Description -->
    <el-form-item label="Description" class="full-span">
      <el-input type="textarea" v-model="localForm.description" placeholder="Enter description" :rows="4" clearable />
    </el-form-item>

    <!-- Full-width Attachments -->
    <el-form-item label="Attachments" class="full-span">
      <FileUploadMultiple
        :key="uploaderKey"
        upload-type="both"
        :max-images="5"
        :max-files="10"
        :existing-image-list="existingImageUrls"
        :existing-file-list="existingFileUrls"
        image-label=""
        file-label=""
        @update:imageList="onNewImages"
        @update:filesList="onNewFiles"
        @update:removedExistingImages="onRemovedExistingImages"
        @update:removedExistingFiles="onRemovedExistingFiles"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])
const formRef = ref(null)

/** Force a clean remount of FileUploadMultiple on fresh-create forms */
const uploaderKey = ref(0)

/**
 * MODEL SHAPE (child + parent contract)
 * - image_list: string[] (existing image URLs)
 * - image_files: File[]   (new image Files to upload)
 * - removed_existing_images: string[] (image URLs deleted this session)
 * - file_list: string[]   (existing file URLs)  <-- NOTE singular: file_list
 * - file_files: File[]    (new file Files to upload)
 * - removed_existing_files: string[] (file URLs deleted this session)
 */
const localForm = reactive({
  name: '',
  code: '',
  phone_number: '',
  email: '',
  website: '',
  address: '',
  description: '',

  image_list: [], // URLs (server)
  image_files: [], // Files (new)
  removed_existing_images: [], // URLs

  file_list: [], // URLs (server)  // singular
  file_files: [], // Files (new)
  removed_existing_files: [], // URLs
})

let applyingFromParent = false
let lastIsNewForm = false

const isNewForm = v => {
  const noImgs = !Array.isArray(v?.image_list) || v.image_list.length === 0
  const noFiles = !Array.isArray(v?.file_list) || v.file_list.length === 0
  const blankish = !v?.name && !v?.code && noImgs && noFiles
  return blankish && v?.id == null
}

/** helpers */
const mapToUrls = arr =>
  Array.isArray(arr) ? arr.map(x => (typeof x === 'string' ? x : x?.url ?? '')).filter(Boolean) : []

// Element-Plus UploadFile → File
const toRealFiles = arr =>
  Array.isArray(arr)
    ? arr.map(x => (x instanceof File ? x : x?.raw instanceof File ? x.raw : null)).filter(Boolean)
    : []

/** existing URLs for preview */
const existingImageUrls = computed(() => mapToUrls(props.modelValue?.image_list))
const existingFileUrls = computed(() => mapToUrls(props.modelValue?.file_list))

/** child → new picks (Files only) */
const onNewImages = files => {
  localForm.image_files = toRealFiles(files)
}
const onNewFiles = files => {
  localForm.file_files = toRealFiles(files)
}

/** child → mark existing URLs removed (images/files) */
const onRemovedExistingImages = urls => {
  const removed = Array.isArray(urls) ? urls : []
  const set = new Set([...(localForm.removed_existing_images || []), ...removed])
  localForm.removed_existing_images = Array.from(set)
  const asSet = new Set(removed)
  localForm.image_list = (localForm.image_list || []).filter(u => !asSet.has(typeof u === 'string' ? u : u?.url))
}
const onRemovedExistingFiles = urls => {
  const removed = Array.isArray(urls) ? urls : []
  const set = new Set([...(localForm.removed_existing_files || []), ...removed])
  localForm.removed_existing_files = Array.from(set)
  const asSet = new Set(removed)
  localForm.file_list = (localForm.file_list || []).filter(u => !asSet.has(typeof u === 'string' ? u : u?.url))
}

/** Parent -> Local */
watch(
  () => props.modelValue,
  (v = {}) => {
    applyingFromParent = true

    // primitives
    localForm.name = v.name || ''
    localForm.code = v.code || ''
    localForm.phone_number = v.phone_number || ''
    localForm.email = v.email || ''
    localForm.website = v.website || ''
    localForm.address = v.address || ''
    localForm.description = v.description || ''

    // keep URL lists from parent as URLs
    localForm.image_list = mapToUrls(v.image_list)
    localForm.file_list = mapToUrls(v.file_list) // singular

    // new files live separately
    localForm.image_files = toRealFiles(v.image_files)
    localForm.file_files = toRealFiles(v.file_files)

    // removed URL trackers
    localForm.removed_existing_images = Array.isArray(v.removed_existing_images) ? v.removed_existing_images : []
    localForm.removed_existing_files = Array.isArray(v.removed_existing_files) ? v.removed_existing_files : []

    // reset uploader for fresh create
    const nowNew = isNewForm(v)
    if (nowNew && !lastIsNewForm) uploaderKey.value += 1
    lastIsNewForm = nowNew

    nextTick(() => (applyingFromParent = false))
  },
  { immediate: true, deep: true }
)

/** Local -> Parent */
watch(
  localForm,
  val => {
    if (applyingFromParent) return
    emit('update:modelValue', {
      ...val,
      image_list: Array.isArray(val.image_list) ? val.image_list : [],
      image_files: Array.isArray(val.image_files) ? val.image_files : [],
      removed_existing_images: Array.isArray(val.removed_existing_images) ? val.removed_existing_images : [],

      file_list: Array.isArray(val.file_list) ? val.file_list : [], // singular
      file_files: Array.isArray(val.file_files) ? val.file_files : [],
      removed_existing_files: Array.isArray(val.removed_existing_files) ? val.removed_existing_files : [],
    })
  },
  { deep: true }
)

/** Validation */
const rules = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  code: [{ required: true, message: 'Code is required', trigger: 'blur' }],
  phone_number: [
    { required: true, message: 'Phone number is required', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        const e164 = /^\+[1-9]\d{7,14}$/
        if (!value) cb(new Error('Phone number is required'))
        else if (!e164.test(value)) cb(new Error('Must start with + followed by country code, then phone number.'))
        else cb()
      },
      trigger: ['blur', 'change'],
    },
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: ['blur', 'change'] },
  ],
  website: [
    { required: true, message: 'Website is required', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        if (!value) return cb()
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/
        if (!urlPattern.test(value)) cb(new Error('Please enter a valid website URL'))
        else cb()
      },
      trigger: ['blur', 'change'],
    },
  ],
}

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields?.(),
  getFormData: () => ({ ...localForm }),
})
</script>

<style scoped lang="scss">
.vendor-form {
  /* widen to comfortably fit two columns, but keep a max for readability */
  max-width: 960px;
  margin: 0 auto;

  .el-input,
  .el-select,
  textarea {
    width: 100%;
  }
}

/* Two-column layout for the first group of fields */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px 24px; /* row gap / column gap */

  /* Ensure each form-item fills its grid cell nicely */
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

/* Make certain items full width (Description + Attachments) */
.full-span {
  grid-column: 1 / -1; /* in case it sits inside a grid parent someday */
}

/* Responsive: collapse to one column on small screens */
@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
