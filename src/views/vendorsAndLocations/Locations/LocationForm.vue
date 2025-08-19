<template>
  <el-form ref="formRef" :model="localForm" :rules="rules" label-width="150px" class="location-form">
    <el-form-item label="Name" prop="name">
      <el-input v-model="localForm.name" placeholder="Enter location name" clearable />
    </el-form-item>

    <el-form-item label="Code" prop="code">
      <el-input v-model="localForm.code" placeholder="Enter unique location code" clearable />
    </el-form-item>

    <el-form-item label="Location Type">
      <el-select v-model="localForm.location_type_id" placeholder="Select location type" clearable>
        <el-option v-for="type in locationTypes" :key="type.id" :label="type.name" :value="type.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="Capacity" prop="capacity">
      <el-input-number v-model="localForm.capacity" :min="0" clearable />
    </el-form-item>

    <el-form-item label="Address">
      <el-input v-model="localForm.address" placeholder="Enter address" clearable />
    </el-form-item>

    <el-form-item label="Description">
      <el-input type="textarea" v-model="localForm.description" placeholder="Enter description" clearable />
    </el-form-item>

    <!--    <UploadEditor v-model:image-list="localForm.image_list" :showFileUpload="false" />-->
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
// import UploadEditor from '@/views/workOrder/components/upload.vue'

const props = defineProps( {
  modelValue : {
    type : Object,
    required : true
  },
  locationTypes : {
    type : Array,
    required : true
  }
} )

const emit = defineEmits( ['update:modelValue'] )

const formRef = ref()

// Fully reactive form data
const localForm = reactive( {
  name : '',
  code : '',
  location_type_id : null,
  capacity : '',
  address : '',
  description : '',
  image_list : [],
  files_list : [],
  parent_id : null
} )

// Watch for modelValue updates (when newLocation is reset in parent)
watch(
  () => props.modelValue,
  newVal => {
    localForm.name = newVal.name || ''
    localForm.code = newVal.code || ''
    localForm.location_type_id = newVal.location_type?.id || null
    localForm.capacity = newVal.capacity || ''
    localForm.address = newVal.address || ''
    localForm.description = newVal.description || ''
    localForm.image_list = newVal.image_list || []
    localForm.files_list = newVal.files_list || []
    localForm.parent_id = newVal.parent_id ?? null
  },
  { immediate : true, deep : true }
)

// Sync back to parent
watch(
  localForm,
  newVal => {
    const location_type = props.locationTypes.find( type => type.id === newVal.location_type_id ) || null
    emit( 'update:modelValue', {
      ...newVal,
      location_type
    } )
  },
  { deep : true }
)

const rules = {
  name : [{ required : true, message : 'Name is required', trigger : 'blur' }],
  code : [{ required : true, message : 'Code is required', trigger : 'blur' }]
}

defineExpose( {
  validate : () => formRef.value?.validate(),
  resetFields : () => formRef.value?.resetFields?.(),
  getFormData : () => ( { ...localForm } )
} )
</script>

<style scoped lang="scss">
.location-form {
  max-width: 600px;
  margin: 0 auto;

  .el-input,
  .el-select,
  textarea {
    max-width: 500px;
    width: 100%;
  }
}
</style>
