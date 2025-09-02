<template>
  <el-dialog
    :model-value="visible"
    @close="$emit('close')"
    :title="isEdit ? t('user.editCertificate') : t('user.addCertificate')"
    width="50%"
    :show-close="false"
  >
    <template #header>
      <div class="header-container">
        <el-button link @click="$emit('close')" class="back-button">
          <el-icon :size="25">
            <ArrowLeftBold />
          </el-icon>
        </el-button>

        <span class="dialog-title">
          {{ isEdit ? t('user.editCertificate') : t('user.addCertificate') }}
        </span>
      </div>
    </template>

    <el-form :model="certificateForm" label-width="150px" ref="formRef" :rules="rules">
      <el-form-item :label="t('user.certificateName')" prop="certificate_name">
        <el-input v-model="certificateForm.certificate_name" />
      </el-form-item>
      <el-form-item :label="t('user.certificateNumber')" prop="certificate_number">
        <el-input v-model="certificateForm.certificate_number" />
      </el-form-item>
      <el-form-item :label="t('user.issueDate')" prop="issue_date">
        <el-date-picker v-model="certificateForm.issue_date" type="date" />
      </el-form-item>
      <el-form-item :label="t('user.expiryDate')" prop="expiration_date">
        <el-date-picker v-model="certificateForm.expiration_date" type="date" />
      </el-form-item>
      <div class="image-container">
        <FileUploadMultiple
          :image-label="t('common.imageUpload')"
          @update:imageList="handleUpdate('imageList', $event)"
          @update:removedExistingImages="handleUpdate('removeImage', $event)"
          upload-type="images"
          :max-images="5"
          :existingImageList="certificateForm.image_list"
          :title-label-position="'right'"
        />
      </div>
    </el-form>

    <template #footer>
      <el-button @click="$emit('close')">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="submitForm">
        {{ t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { ArrowLeftBold } from '@element-plus/icons-vue'

const props = defineProps( {
  visible : Boolean,
  certificate : Object
} )
const emit = defineEmits( ['save', 'close'] )

const { t } = useI18n()
const isEdit = computed( () => !!certificateForm?.id )

const rules = ref( {
  certificate_name : [
    { required : true, message : 'Certificate name is required', trigger : 'blur' }
    // or: { required: true, message: t('user.validation.certificateNameRequired'), trigger: 'blur' }
  ],
  issue_date : [
    { required : true, message : 'Issue date is required', trigger : 'change' }
    // or: { required: true, message: t('user.validation.issueDateRequired'), trigger: 'change' }
  ]
} )

const certificateForm = reactive( {
  id : null,
  certificate_name : '',
  certificate_number : '',
  issue_date : null,
  expiration_date : null,
  image_list : [],
  new_image_list : [],
  removed_image_list : []
} )

const newImages = ref( [] )
const removedImages = ref( [] )

const handleUpdate = ( type, data ) => {
  switch ( type ) {
    case 'imageList':
      newImages.value = data
      break

    case 'removeImage':
      removedImages.value = data
      break

    default:
      break
  }
}

function resetCertificateForm() {
  certificateForm.id = null
  certificateForm.certificate_name = ''
  certificateForm.certificate_number = ''
  certificateForm.issue_date = ''
  certificateForm.expiration_date = ''
  certificateForm.image_list = []
  certificateForm.new_image_list = []
  certificateForm.removed_image_list = []
  newImages.value = []
  removedImages.value = []
}

// When dialog opens, initialize form based on whether we're editing or creating
watch(
  () => props.visible,
  open => {
    if ( !open ) {
      return
    }

    if ( props.certificate ) {
      resetCertificateForm()
      Object.assign( certificateForm, props.certificate )
    } else {
      resetCertificateForm()
    }

    // clear previous validation state when reopened
    formRef.value?.clearValidate?.()
  }
)

watch(
  () => props.certificate,
  val => {
    if ( !props.visible || !val ) {
      return
    }

    Object.assign( certificateForm, val )
  },
  { immediate : true }
)

const formRef = ref( null )

const submitForm = async() => {
  try {
    await formRef.value.validate()

    emit( 'save', {
      ...certificateForm,
      new_image_list : newImages.value,
      removed_image_list : removedImages.value
    } )

    resetCertificateForm()
  } catch ( e ) {
    // validation failed; Element Plus already shows messages
  }
}

onMounted( () => {
  resetCertificateForm()
} )
</script>

<style scoped>
.image-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.dialog-title {
  font-size: 18px;
  color: black;
  align-items: center;
}
</style>
