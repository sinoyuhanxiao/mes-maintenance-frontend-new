<template>
  <div class="add-new-spare-part">
    <div class="general-information">
      <el-form ref="formRef" :model="formData" :rules="rules" :label-position="labelPosition" label-width="auto">
        <!-- Part Name (full width, label top / input bottom) -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
              label="Part Name"
              prop="name"
              :rules="[
                { required: true, message: 'Part name is required' },
                { type: 'string', message: 'Part name must be a string' },
              ]"
            >
              <el-input v-model="formData.name" clearable placeholder="Enter Part Name" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Material Code + Inventory Code -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Part Code" prop="code" :rules="[{ required: true, message: 'Part Code is required' }]">
              <el-input v-model="formData.code" clearable placeholder="Enter Part Code" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="Inventory Code"
              prop="universal_code"
              :rules="[{ required: true, message: 'Inventory Code is required' }]"
            >
              <el-input v-model="formData.universal_code" clearable placeholder="Enter Inventory Code" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Category + Manufacturer -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="spare_parts_class_id">
              <el-select
                v-model="formData.spare_parts_class_id"
                filterable
                clearable
                placeholder="Select Category"
                style="width: 100%"
              >
                <el-option v-for="c in sparePartClasses" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Manufacturer" prop="manufacturer_id">
              <el-select
                v-model="formData.manufacturer_id"
                filterable
                clearable
                placeholder="Select Manufacturer"
                style="width: 100%"
              >
                <el-option v-for="m in manufacturers" :key="m.id" :label="m.name" :value="m.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Inventory numbers -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Min Stock"
              prop="minimum_stock_level"
              :rules="[
                { type: 'number', transform: v => toNumberOrNull(v), message: 'Min Stock must be a number' },
                { validator: validateNonNegativeInteger, trigger: 'blur' },
              ]"
            >
              <el-input-number
                v-model="formData.minimum_stock_level"
                :min="0"
                :precision="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="Max Stock"
              prop="maximum_stock_level"
              :rules="[
                { type: 'number', transform: v => toNumberOrNull(v), message: 'Max Stock must be a number' },
                { validator: validateMaxGteMin, trigger: 'blur' },
                { validator: validateNonNegativeInteger, trigger: 'blur' },
              ]"
            >
              <el-input-number
                v-model="formData.maximum_stock_level"
                :min="formData.minimum_stock_level || 0"
                :precision="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Current Stock"
              prop="current_stock"
              :rules="[
                { type: 'number', transform: v => toNumberOrNull(v), message: 'Current Stock must be a number' },
                { validator: validateNonNegativeInteger, trigger: 'blur' },
              ]"
            >
              <el-input-number v-model="formData.current_stock" :min="0" :precision="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="Reorder Point"
              prop="reorder_point"
              :rules="[
                { type: 'number', transform: v => toNumberOrNull(v), message: 'Reorder Point must be a number' },
                { validator: validateReorderWithinRange, trigger: 'blur' },
                { validator: validateNonNegativeInteger, trigger: 'blur' },
              ]"
            >
              <el-input-number
                v-model="formData.reorder_point"
                :min="formData.minimum_stock_level || 0"
                :max="formData.maximum_stock_level || undefined"
                :precision="0"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Description (full width) BEFORE uploads -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="Describe the spare part"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Uploads -->
      <div class="file-upload">
        <FileUploadMultiple
          @update:imageList="handleImageListUpdate"
          @update:fileList="handleFilesListUpdate"
          upload-type="both"
          :max-images="5"
          :max-files="5"
        />
      </div>

      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading">
          {{ props.mode === 'edit' ? 'Save' : 'Create' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllSparePartClasses, createSparePart, updateSparePart } from '@/api/resources'
import { uploadMultipleToMinio } from '@/api/minio'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'

const props = defineProps( {
  mode : { type : String, default : 'create' }, // 'create' | 'edit'
  initialData : { type : Object, default : null }
} )
const emit = defineEmits( ['close', 'cancel', 'success'] )

const formRef = ref( null )
const labelPosition = ref( 'top' )
const submitLoading = ref( false )

const sparePartClasses = ref( [] )
const manufacturers = ref( [{ id : 1, name : 'FPS' }] )

const uploadedImages = ref( [] )
const uploadedFiles = ref( [] )

const formData = reactive( {
  id : null,
  name : '',
  spare_parts_class_id : null,
  description : '',
  code : '',
  priority : null,
  image_list : [],
  file_list : [],
  reorder_point : 0,
  maximum_stock_level : 1,
  minimum_stock_level : 0,
  current_stock : 0,
  universal_code : '',
  status : 1,
  inventory_requests : [],
  manufacturer_id : null
} )

/* ---------- validators ---------- */
const toNumberOrNull = v => ( v === '' || v === null || v === undefined ? null : Number( v ) )
const validateNonNegativeInteger = ( rule, value, callback ) => {
  if ( value === '' || value === null || value === undefined ) return callback()
  if ( !Number.isInteger( Number( value ) ) || Number( value ) < 0 ) {
    return callback( new Error( 'Value must be a non-negative integer' ) )
  }
  callback()
}
const validateMaxGteMin = ( rule, value, callback ) => {
  const min = Number( formData.minimum_stock_level ?? 0 )
  const max = Number( value ?? 0 )
  if ( max < min ) return callback( new Error( 'Max Stock must be ≥ Min Stock' ) )
  callback()
}
const validateReorderWithinRange = ( rule, value, callback ) => {
  const min = Number( formData.minimum_stock_level ?? 0 )
  const max = Number( formData.maximum_stock_level ?? Number.MAX_SAFE_INTEGER )
  const rp = Number( value ?? 0 )
  if ( rp < min ) return callback( new Error( 'Reorder Point must be ≥ Min Stock' ) )
  if ( Number.isFinite( max ) && rp > max ) return callback( new Error( 'Reorder Point must be ≤ Max Stock' ) )
  callback()
}
const rules = reactive( {
  name : [{ required : true, message : 'Please input Part Name', trigger : 'blur' }],
  code : [{ required : true, message : 'Please enter Material Code', trigger : 'blur' }],
  universal_code : [{ required : true, message : 'Please enter Inventory Code', trigger : 'blur' }]
} )

/* ---------- prefill on edit ---------- */
const prefill = src => {
  if ( !src ) return
  const m = {
    id : src.id ?? null,
    name : src.name ?? '',
    spare_parts_class_id : src.spare_parts_class_id ?? src.spare_parts_class?.id ?? null,
    description : src.description ?? '',
    code : src.code ?? '',
    priority : src.priority ?? null,
    image_list : Array.isArray( src.image_list ) ? [...src.image_list] : [],
    file_list : Array.isArray( src.file_list ) ? [...src.file_list] : [],
    reorder_point : src.reorder_point ?? 0,
    maximum_stock_level : src.maximum_stock_level ?? 1,
    minimum_stock_level : src.minimum_stock_level ?? 0,
    current_stock : src.current_stock ?? 0,
    universal_code : src.universal_code ?? '',
    status : src.status ?? 1,
    inventory_requests : src.inventory_requests ?? [],
    manufacturer_id : src.manufacturer_id ?? src.manufacturer?.id ?? null
  }
  Object.assign( formData, m )
}

watch(
  () => props.initialData,
  v => {
    if ( props.mode === 'edit' && v ) prefill( v )
  },
  { immediate : true }
)

/* ---------- uploads ---------- */
const handleImageListUpdate = images => {
  uploadedImages.value = images
  formData.image_list = images
}
const handleFilesListUpdate = files => {
  uploadedFiles.value = files
  formData.file_list = files
}
const needsUpload = arr => Array.isArray( arr ) && arr.some( it => typeof it !== 'string' )

const uploadFilesToServer = async() => {
  try {
    if ( needsUpload( formData.image_list ) ) {
      const imageRes = await uploadMultipleToMinio( formData.image_list )
      const imgs = imageRes.data?.uploadedFiles || []
      formData.image_list = imgs.map( f => f.url )
    }
    if ( needsUpload( formData.file_list ) ) {
      const fileRes = await uploadMultipleToMinio( formData.file_list )
      const fls = fileRes.data?.uploadedFiles || []
      formData.file_list = fls.map( f => f.url )
    }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

/* ---------- actions ---------- */
const handleConfirm = async() => {
  if ( !formRef.value ) return
  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true
  try {
    if ( needsUpload( formData.image_list ) || needsUpload( formData.file_list ) ) {
      await uploadFilesToServer()
    }

    let res
    if ( props.mode === 'edit' ) {
      res = await updateSparePart( formData.id, { ...formData } )
      ElMessage.success( 'Spare part updated successfully!' )
    } else {
      res = await createSparePart( { ...formData } )
      ElMessage.success( 'Spare part created successfully!' )
    }

    emit( 'success', res?.data || { ...formData } )
    emit( 'close' )
    resetForm()
  } catch ( err ) {
    ElMessage.error(
      `Failed to ${props.mode === 'edit' ? 'update' : 'create'} spare part: ${err?.message || 'Unknown error'}`
    )
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  emit( 'cancel' )
  emit( 'close' )
}

const resetForm = () => {
  if ( formRef.value ) formRef.value.resetFields()
  Object.assign( formData, {
    id : null,
    name : '',
    spare_parts_class_id : null,
    description : '',
    code : '',
    priority : null,
    image_list : [],
    file_list : [],
    reorder_point : 0,
    maximum_stock_level : 1,
    minimum_stock_level : 0,
    current_stock : 0,
    universal_code : '',
    status : 1,
    inventory_requests : [],
    manufacturer_id : null
  } )
}

/* ---------- init ---------- */
const getAllData = async() => {
  const spcRes = await getAllSparePartClasses()
  sparePartClasses.value = spcRes?.data || []
}
onMounted( () => {
  getAllData()
} )
</script>

<style scoped>
.add-new-spare-part {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.general-information {
  margin-top: 16px;
}

.file-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
}

.dialog-footer {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-form-item) {
  width: 100%;
}
</style>
