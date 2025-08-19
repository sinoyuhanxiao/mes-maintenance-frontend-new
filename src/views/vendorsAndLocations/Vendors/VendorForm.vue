<template>
  <el-form ref="formRef" :model="localForm" :rules="rules" label-width="150px" class="location-form">
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

    <el-form-item label="Address">
      <el-input v-model="localForm.address" placeholder="Enter address" clearable />
    </el-form-item>

    <el-form-item label="Description">
      <el-input type="textarea" v-model="localForm.description" placeholder="Enter description" clearable />
    </el-form-item>

    <!--    <UploadEditor v-model:image-list="localForm.image_list" :showFileUpload="true" />-->
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
// import UploadEditor from '@/views/workOrder/components/upload.vue'

const props = defineProps( {
  modelValue : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['update:modelValue'] )

const formRef = ref()

// Reactive local form based on modelValue
const localForm = reactive( { ...props.modelValue } )

// Sync from parent to local
watch(
  () => props.modelValue,
  newVal => {
    Object.assign( localForm, newVal )
  },
  { deep : true }
)

// Sync from local to parent
watch(
  localForm,
  newVal => {
    emit( 'update:modelValue', { ...newVal } )
  },
  { deep : true }
)

// Validation rules including email and website
const rules = {
  name : [{ required : true, message : 'Name is required', trigger : 'blur' }],
  code : [{ required : true, message : 'Code is required', trigger : 'blur' }],
  phone_number : [
    { required : true, message : 'Phone number is required', trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        // E.164 format: starts with +, followed by 8 to 15 digits, no spaces/dashes/etc.
        const e164Pattern = /^\+[1-9]\d{7,14}$/

        if ( !value ) {
          callback( new Error( 'Phone number is required' ) )
        } else if ( !e164Pattern.test( value ) ) {
          callback( new Error( 'Must start with + followed by country code, then phone number.' ) )
        } else {
          callback()
        }
      },
      trigger : ['blur', 'change']
    }
  ],
  email : [
    { required : true, message : 'Email is required', trigger : 'blur' },
    { type : 'email', message : 'Please enter a valid email address', trigger : ['blur', 'change'] }
  ],
  website : [
    { required : true, message : 'Website is required', trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        if ( !value ) {
          // empty website allowed
          callback()
          return
        }
        // Simple URL pattern (adjust if needed)
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
        if ( !urlPattern.test( value ) ) {
          callback( new Error( 'Please enter a valid website URL' ) )
        } else {
          callback()
        }
      },
      trigger : ['blur', 'change']
    }
  ]
}

defineExpose( {
  validate : () => formRef.value?.validate(),
  getFormData : () => ( { ...localForm } ),
  resetFields : () => {
    formRef.value?.resetFields?.()
  }
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
