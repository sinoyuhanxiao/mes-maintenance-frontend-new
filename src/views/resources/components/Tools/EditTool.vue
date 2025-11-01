<template>
  <div class="edit-tool">
    <div class="general-information">
      <el-form ref="formRef" :model="localForm" :rules="rules" :label-position="labelPosition" label-width="auto">
        <!-- Row 1: Tool Name + Tool Code -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Tool Name"
              prop="name"
              :rules="[
                { required: true, message: 'Tool Name is required' },
                { type: 'string', message: 'Tool Name must be a string' },
              ]"
            >
              <el-input v-model="localForm.name" clearable placeholder="Please input Tool Name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Code" prop="code" :rules="[{ required: true, message: 'Please input Tool Code' }]">
              <el-input v-model="localForm.code" clearable placeholder="Please input Tool Code" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: Category + Manufacturer -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="tool_class_id">
              <el-select
                v-model="localForm.tool_class_id"
                filterable
                clearable
                placeholder="Select Tool Category"
                style="width: 100%"
              >
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Manufacturer" prop="manufacturer">
              <el-input v-model="localForm.manufacturer" clearable placeholder="Enter Manufacturer" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: Description -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="localForm.description"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="Please Describe Tool"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Upload Section -->
      <div class="file-upload">
        <FileUploadMultiple
          :key="`tool-up-${uploaderKey}`"
          upload-type="images"
          :max-images="1"
          :existing-image-list="localForm.image_list"
          image-label="Upload Image"
          file-label=""
          @update:imageList="onNewImages"
          @update:removedExistingImages="onRemovedExistingImages"
        />
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <el-button
          @click="
            () => {
              emit('cancel')
              emit('close')
            }
          "
          >Cancel</el-button
        >
        <el-button type="primary" @click="onSubmit" :loading="submitLoading">Update</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllToolClasses } from '@/api/resources'
import { uploadMultipleToMinio } from '@/api/minio'
import FileUploadMultiple from '../../../../components/FileUpload/FileUploadMultiple.vue'

const props = defineProps({ data: Object })

const formRef = ref(null)
const labelPosition = ref('top')
const submitLoading = ref(false)

const toolClasses = ref([])
// inside <script setup>
const emit = defineEmits(['editTool', 'close', 'cancel'])

/**
 * LOCAL FORM (mirrors Location/Vendor pattern):
 * - image_list: string[] (existing URLs to preview/keep)
 * - image_files: File[]  (new picks this session)
 * - removed_existing_images: string[] (URLs the user deleted)
 */
const localForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  tool_class_id: null,
  manufacturer: '',
  image_list: [], // URLs from server (previewed)
  image_files: [], // new Files selected this session
  removed_existing_images: [], // URLs to remove
})

/** Force a clean remount of uploader when switching records / fresh-create */
const uploaderKey = ref(0)
let lastSeedId = null

/** Utilities */
const mapToUrls = arr =>
  Array.isArray(arr) ? arr.map(x => (typeof x === 'string' ? x : x?.url ?? '')).filter(Boolean) : []

const toRealFiles = arr =>
  Array.isArray(arr)
    ? arr.map(x => (x instanceof File ? x : x?.raw instanceof File ? x.raw : null)).filter(Boolean)
    : []

const extractUploadedUrls = resp => {
  const list = resp?.uploadedFiles ?? resp?.data?.uploadedFiles ?? resp?.data?.data?.uploadedFiles ?? resp?.files ?? []
  return (Array.isArray(list) ? list : []).map(f => f?.url || f?.fileUrl || f?.location || f?.path).filter(Boolean)
}

// /** Existing URLs for preview (comes from localForm.image_list so we can mutate and see instant changes) */
// const existingImageUrls = computed( () => mapToUrls( localForm.image_list ) )

/** Child → track newly picked files (do NOT overwrite image_list) */
const onNewImages = files => {
  localForm.image_files = toRealFiles(files)
}

/** Child → when an existing URL is removed, hide it immediately + track it */
// Child → when an existing URL is removed, hide it immediately + track it
const onRemovedExistingImages = urls => {
  const removed = Array.isArray(urls) ? urls : []

  // 1) Track for save
  const set = new Set([...(localForm.removed_existing_images || []), ...removed])
  localForm.removed_existing_images = Array.from(set)

  // 2) Immediately mutate the live list bound to the uploader
  const asSet = new Set(removed)
  localForm.image_list = (localForm.image_list || []).filter(u => !asSet.has(typeof u === 'string' ? u : u?.url))

  // 3) Nudge a lightweight re-mount to guarantee the thumbnails refresh
  uploaderKey.value += 1
}

// (optional) If you prefer not to bump the key inside the handler, you can instead do:
// watch(() => localForm.image_list.length, () => { uploaderKey.value += 1 })

/** Prefill from props.data (same style as Location/Vendor) */
watch(
  () => props.data,
  async v => {
    if (!v) return

    localForm.id = v.id ?? null
    localForm.name = v.name ?? ''
    localForm.code = v.code ?? ''
    localForm.description = v.description ?? ''
    localForm.tool_class_id = v.tool_class_id ?? v.tool_class?.id ?? null
    localForm.manufacturer = v.manufacturer ?? ''

    // keep URLs; clear per-session state
    localForm.image_list = mapToUrls(v.image_list)
    localForm.image_files = []
    localForm.removed_existing_images = []

    const newId = v?.id ?? null
    if (newId !== lastSeedId) {
      uploaderKey.value += 1
      lastSeedId = newId
    }

    await nextTick()
  },
  { immediate: true, deep: true }
)

/** Validation */
const rules = reactive({
  name: [{ required: true, message: 'Please input Name', trigger: 'blur' }],
  code: [{ required: true, message: 'Please enter Code', trigger: 'blur' }],
  tool_class_id: [{ required: true, message: 'Please select Tool Class', trigger: 'change' }],
})

/** Data sources */
async function getToolClasses() {
  try {
    const res = await getAllToolClasses()
    toolClasses.value = res?.data || []
  } catch {
    toolClasses.value = []
  }
}
getToolClasses()

/** Build final image_list: kept existing + newly uploaded file URLs */
const buildFinalImageList = async () => {
  const originalUrls = mapToUrls(props.data?.image_list)
  const removedSet = new Set(localForm.removed_existing_images || [])
  const keptExisting = originalUrls.filter(u => !removedSet.has(u))

  const newFiles = toRealFiles(localForm.image_files)
  let uploadedUrls = []
  if (newFiles.length) {
    const resp = await uploadMultipleToMinio(newFiles)
    uploadedUrls = extractUploadedUrls(resp)
  }
  return Array.from(new Set([...keptExisting, ...uploadedUrls]))
}

/** Submit */
const onSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const finalImages = await buildFinalImageList()
    const payload = {
      id: localForm.id,
      name: localForm.name,
      code: localForm.code,
      description: localForm.description,
      tool_class_id: localForm.tool_class_id,
      manufacturer: localForm.manufacturer,
      image_list: finalImages,
    }
    emit('editTool', payload)
  } catch (e) {
    ElMessage.error(`Failed to update: ${e?.message || 'Unknown error'}`)
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.edit-tool {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.general-information {
  margin-top: 16px;
}

.file-upload {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-form-item) {
  width: 100%;
}
</style>
