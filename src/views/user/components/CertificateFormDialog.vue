<template>
  <el-dialog
    :model-value="visible"
    @close="$emit('close')"
    :title="isCertificateEdited ? t('user.editCertificate') : t('user.addCertificate')"
    width="50%"
    top="10vh"
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
          {{ isCertificateEdited ? t('user.editCertificate') : t('user.addCertificate') }}
        </span>
      </div>
    </template>

    <el-form :model="internalCertificate" label-width="150px" ref="formRef" :rules="rules">
      <el-form-item :label="t('user.certificateName')" prop="name">
        <el-input v-model="internalCertificate.name" />
      </el-form-item>

      <el-form-item :label="t('user.certificateNumber')" prop="certificate_number">
        <el-input v-model="internalCertificate.certificate_number" />
      </el-form-item>

      <div class="form-row">
        <el-form-item :label="t('user.issueDate')" prop="issue_date">
          <el-date-picker v-model="internalCertificate.issue_date" type="date" />
        </el-form-item>

        <el-form-item :label="t('user.expiryDate')" prop="expiration_date">
          <el-date-picker v-model="internalCertificate.expiration_date" type="date" />
          <div v-if="isExpired" style="color: var(--el-color-danger); font-size: 12px; margin-top: 4px">
            {{ 'This certificate has already expired' }}
          </div>
        </el-form-item>
      </div>

      <div class="image-container">
        <FileUploadMultiple
          ref="certificateFormImageUploadRef"
          :image-label="t('common.imageUpload')"
          @update:imageList="handleUpdate('imageList', $event)"
          @update:removedExistingImages="handleUpdate('removeImage', $event)"
          upload-type="images"
          :max-images="5"
          :existingImageList="internalCertificate.file_list"
          :title-label-position="'right'"
        />
      </div>
    </el-form>

    <template #footer>
      <el-button @click="$emit('close')">{{ t('common.cancel') }}</el-button>

      <el-button type="warning" @click="handleResetForm">
        {{ t('workOrder.actions.reset') }}
      </el-button>

      <el-button type="primary" @click="handleConfirm">
        {{ t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { ArrowLeftBold } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteObjectList, uploadMultipleToMinio } from '@/api/minio'

const props = defineProps( {
  visible : {
    type : Boolean,
    required : true
  },
  certificate : {
    type : Object,
    default : null
  }
} )
const emit = defineEmits( ['confirm', 'close'] )
const { t } = useI18n()
const isCertificateEdited = computed( () => {
  if ( !originalCertificateSnapshot.value ) {
    return false
  }

  const payload = buildUpdateCertificatePayload( internalCertificate.value, originalCertificateSnapshot.value )

  return Object.keys( payload ).length > 0
} )
const rules = ref( {
  name : [{ required : true, message : 'Certificate name is required', trigger : 'blur' }],
  certificate_number : [{ required : true, message : 'Certificate number is required', trigger : 'blur' }],
  issue_date : [{ required : true, message : 'Issue date is required', trigger : 'change' }]
} )
const certificateFormImageUploadRef = ref( null )
const formRef = ref( null )
const newImages = ref( [] )
const removedImages = ref( [] )
const internalCertificate = ref( createEmptyCertificate() )
const originalCertificateSnapshot = ref( null )

// When dialog opens, initialize form based on whether we're editing or creating
watch(
  () => props.visible,
  isVisible => {
    if ( !isVisible ) {
      return
    }

    if ( props.certificate ) {
      const clonedCertificate = { ...props.certificate }
      internalCertificate.value = clonedCertificate
      originalCertificateSnapshot.value = JSON.parse( JSON.stringify( clonedCertificate ) )
    } else {
      internalCertificate.value = createEmptyCertificate()
      originalCertificateSnapshot.value = null
    }

    newImages.value = []
    removedImages.value = []

    // clear previous validation state when reopened
    formRef.value?.clearValidate?.()
  }
)

const handleUpdate = ( type, data ) => {
  switch ( type ) {
    case 'imageList':
      newImages.value = data
      break

    case 'removeImage':
      // Record url to delete in minio later
      removedImages.value = data
      break

    default:
      break
  }
}

const buildUpdateCertificatePayload = ( entry, original ) => {
  const payload = {}
  if ( entry.id ) {
    payload.id = entry.id
  }

  if ( entry.name !== original.name ) {
    payload.name = entry.name
  }

  if ( entry.certificate_number !== original.certificate_number ) {
    payload.certificate_number = entry.certificate_number
  }

  if ( entry.issue_date !== original.issue_date ) {
    payload.issue_date = entry.issue_date
  }

  if ( entry.expiration_date !== original.expiration_date ) {
    payload.expiration_date = entry.expiration_date
  }

  if ( entry.review_date !== original.review_date ) {
    payload.review_date = entry.review_date
  }

  if ( entry.reviewer_id !== original.reviewer_id ) {
    payload.reviewer_id = entry.reviewer_id
  }

  if ( entry.external_reviewer_name !== original.external_reviewer_name ) {
    payload.external_reviewer_name = entry.external_reviewer_name
  }

  if ( entry.note !== original.note ) {
    payload.note = entry.note
  }

  if ( JSON.stringify( entry.file_list || [] ) !== JSON.stringify( original.file_list || [] ) ) {
    payload.file_list = entry.file_list
  }

  return payload
}

const handleConfirm = async() => {
  try {
    const isValid = await formRef.value.validate()

    if ( !isValid ) {
      return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
    }

    // Upload images to minio
    try {
      if ( newImages.value.length > 0 ) {
        const imageRes = await uploadMultipleToMinio( newImages.value )
        // Add every new uploaded image url to file list
        imageRes.data.uploadedFiles?.map( file => internalCertificate.value.file_list.push( file.url ) )
      }
    } catch ( err ) {
      // TODO: replace with translated key
      ElMessage.error( 'Image file upload failed' )
    }

    // Delete removed file in Minio
    try {
      if ( removedImages.value?.length > 0 ) {
        // Update file list by clearing removed image url
        internalCertificate.value.file_list = internalCertificate.value.file_list.filter(
          f => !removedImages.value.includes( f )
        )

        const deleteResponse = await deleteObjectList( {
          bucketName : 'sv-file-bucket',
          objectUrls : removedImages.value
        } )

        if ( deleteResponse.status === 0 ) {
          ElMessage.success( 'Old files deleted successfully!' )
        }
      }
    } catch ( err ) {
      // TODO: replace with translated key
      console.log( err )
      ElMessage.error( 'Image file cleanup failed' )
    }

    // Clear FileUploadMultiple component internal imageList
    certificateFormImageUploadRef.value?.resetNewFileLists()

    emit( 'confirm', internalCertificate.value )
  } catch ( e ) {
    // validation failed; Element Plus already shows messages
  }
}

function createEmptyCertificate() {
  return {
    name : null,
    certificate_number : null,
    issue_date : null,
    expiration_date : null,
    review_date : null,
    external_reviewer_name : null,
    reviewer_id : null,
    note : null,
    file_list : []
  }
}

async function handleResetForm() {
  try {
    await ElMessageBox.confirm(
      t(
        'common.confirmMessage',
        t( 'common.warning' ), // title
        {
          type : 'warning',
          confirmButtonText : t( 'common.confirm' ),
          cancelButtonText : t( 'common.cancel' ),
          distinguishCancelAndClose : true
        }
      )
    )

    if ( originalCertificateSnapshot.value === null ) {
      internalCertificate.value = createEmptyCertificate()
    } else {
      internalCertificate.value = JSON.parse( JSON.stringify( originalCertificateSnapshot.value ) )
    }

    // Reset file upload component
    certificateFormImageUploadRef.value?.resetNewFileLists()

    formRef.value.clearValidate()
  } catch {}
}

const isExpired = computed( () => {
  const exp = internalCertificate.value.expiration_date
  if ( !exp ) return false

  const expDate = new Date( exp )
  const today = new Date()
  today.setHours( 0, 0, 0, 0 ) // normalize

  return expDate < today
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
