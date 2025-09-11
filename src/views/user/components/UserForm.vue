<template>
  <el-form
    ref="formRef"
    :model="internalUser"
    :rules="userFormValidationRules"
    label-width="140"
    class="two-col-form"
    :validate-on-rule-change="false"
  >
    <div class="form-row">
      <el-form-item :label="t('user.firstName')" prop="first_name">
        <el-input v-model="internalUser.first_name" />
      </el-form-item>

      <el-form-item :label="t('user.lastName')" prop="last_name">
        <el-input v-model="internalUser.last_name" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item :label="t('user.department')" prop="department_id">
        <el-select
          v-model="internalUser.department_id"
          :placeholder="t('user.form.selectDepartmentPlaceHolder')"
          filterable
        >
          <el-option
            v-for="department in prop.departmentOptions"
            :key="department.id"
            :label="department.name"
            :value="department.id"
          >
            <el-tag :type="department.el_tag_type">{{ department.name }}</el-tag>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="t('user.form.role')" prop="role_list">
        <el-select
          v-model="internalUser.role_list"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          :placeholder="t('user.form.selectRolePlaceHolder')"
          filterable
        >
          <el-option v-for="role in prop.roleOptions" :key="role.id" :label="role.name" :value="role.id">
            <el-tag :type="role.el_tag_type">{{ role.name }}</el-tag>
          </el-option>
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <!--            <el-form-item :label="t('user.form.username')" prop="username">-->
      <!--              <el-input v-model="internalUser.username" />-->
      <!--            </el-form-item>-->
      <el-form-item :label="t('user.employeeNumber')" prop="employee_number">
        <el-input v-model="internalUser.employee_number" />
      </el-form-item>

      <el-form-item :label="t('user.form.status')" prop="enabled">
        <el-select v-model="internalUser.enabled" :placeholder="t('user.form.status')">
          <el-option :label="t('user.status.active')" :value="true" />
          <el-option :label="t('user.status.inactive')" :value="false" />
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item :label="t('user.form.email')" prop="email">
        <el-input v-model="internalUser.email" />
      </el-form-item>

      <!--            <el-form-item :label="t('user.form.phoneNumber')" prop="phone_number">-->
      <!--              <el-input-->
      <!--                  v-model="internalUser.phone_number"-->
      <!--                  placeholder="+15551234567"-->
      <!--                  clearable-->
      <!--              >-->
      <!--                <template #prepend>+</template>-->
      <!--              </el-input>-->
      <!--            </el-form-item>-->

      <el-form-item :label="t('user.form.phoneNumber')" prop="phone_number">
        <vue-tel-input
          v-model="internalUser.phone_number"
          :placeholder="t('user.form.phoneNumber')"
          :mode="'international'"
          :default-country="'CA'"
          :valid-character-only="true"
          :input-options="{ showDialCode: true, maxlength: 20 }"
        />
      </el-form-item>
    </div>

    <!-- Commented for now as this is not supported in user service yet  -->
    <!--          <el-divider>-->
    <!--            {{ t('team.team') }}-->
    <!--          </el-divider>-->

    <!--          <el-form-item :label="t('user.assignedTeam')" prop="teams">-->
    <!--            <associated-team-select v-model="internalUser.teams" />-->
    <!--          </el-form-item>-->

    <!--          <el-divider>-->
    <!--            {{ t('user.certificate') }}-->
    <!--          </el-divider>-->

    <el-form-item :label="t('user.certificate')" prop="certificates">
      <certificate-list
        :certificates="internalUser.certificates"
        @edit="handleEditCert"
        @delete="handleDeleteCert"
        @add="handleAddCert"
      />
    </el-form-item>

    <div class="form-row">
      <FileUploadMultiple
        ref="userFormImageUploadRef"
        :image-label="t('user.table.profileImage')"
        @update:imageList="handleFileUpdate('toBeUploadImageList', $event)"
        @update:removedExistingImages="handleFileUpdate('toBeRemoveImageList', $event)"
        upload-type="images"
        :max-images="1"
        :existingImageList="internalUser.image ? [internalUser.image] : []"
        :title-label-position="'right'"
      />
    </div>

    <!-- Show only for new user -->
    <template v-if="internalUser.id == null">
      <div class="form-row">
        <el-form-item :label="t('user.form.newPassword')" prop="newPassword">
          <el-input v-model="internalUser.newPassword" type="password" show-password />
        </el-form-item>

        <el-form-item :label="t('user.form.confirmPassword')" prop="confirmPassword">
          <el-input v-model="internalUser.confirmPassword" type="password" show-password />
        </el-form-item>
      </div>
    </template>

    <!-- Show only for editing existing user -->
    <template v-else>
      <div class="form-row">
        <el-form-item>
          <el-checkbox v-model="changePassword">
            {{ t('user.form.changePassword') }}
          </el-checkbox>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item v-if="changePassword" :label="t('user.form.newPassword')" prop="newPassword">
          <el-input v-model="internalUser.newPassword" type="password" show-password />
        </el-form-item>

        <el-form-item v-if="changePassword" :label="t('user.form.confirmPassword')" prop="confirmPassword">
          <el-input v-model="internalUser.confirmPassword" type="password" show-password />
        </el-form-item>
      </div>
    </template>
  </el-form>

  <div class="form-action-row">
    <el-button @click="emit('cancel')">
      {{ t('user.form.cancelButton') }}
    </el-button>

    <el-button type="warning" @click="handleResetForm">
      {{ t('workOrder.actions.reset') }}
    </el-button>

    <el-button type="primary" :disabled="internalUser.id && !isUserEdited" @click="handleConfirm">
      {{ t('user.form.confirmButton') }}
    </el-button>
  </div>

  <!-- Certificate Form Dialog -->
  <certificate-form-dialog
    :visible="showCertForm"
    :certificate="editingCert"
    @save="handleCertFormSave"
    @close="showCertForm = false"
  />
</template>

<script setup>
import CertificateFormDialog from '@/views/user/components/CertificateFormDialog.vue'
import CertificateList from '@/views/user/components/CertificateList.vue'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { VueTelInput } from 'vue-tel-input'
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createUser, updateUserByAdmin } from '@/api/user'
import { deleteObjectList, uploadMultipleToMinio } from '@/api/minio'
import { useI18n } from 'vue-i18n'
import 'vue-tel-input/vue-tel-input.css'

const prop = defineProps( {
  user : {
    type : Object,
    default : null
  },
  roleOptions : {
    type : Array,
    default : () => []
  },
  departmentOptions : {
    type : Array,
    default : () => []
  }
} )
const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )
const formRef = ref()
const userFormImageUploadRef = ref()
const showCertForm = ref( false )
const editingCert = ref( null )
const toBeUploadImageList = ref()
const toBeRemoveImageList = ref()
const changePassword = ref( false )
const submitting = ref( false )
const internalUser = ref( createEmptyUser() )
const originalUserSnapshot = ref( null ) // stores original userEntry on edit

watch(
  () => prop.user,
  async user => {
    if ( user ) {
      const clonedUser = transformIncomingUser( user )
      internalUser.value = clonedUser
      originalUserSnapshot.value = JSON.parse( JSON.stringify( clonedUser ) )
    } else {
      internalUser.value = createEmptyUser()
      originalUserSnapshot.value = null
    }

    await nextTick()
    if ( formRef.value ) {
      formRef.value.clearValidate()
    }
  },
  { immediate : true }
)

watch( changePassword, async() => {
  await nextTick()
  formRef.value?.clearValidate( ['newPassword', 'confirmPassword'] )
} )

function createEmptyUser() {
  return {
    id : null,
    first_name : '',
    last_name : '',
    department_id : null,
    role_list : [],
    email : '',
    phone_number : '+1',
    enabled : true,
    employee_number : '',
    image : null,
    certificates : [],
    teams : [],
    newPassword : '',
    confirmPassword : ''
  }
}

function transformIncomingUser( user ) {
  changePassword.value = false

  return {
    ...createEmptyUser(),
    ...user,
    role_list : user.roles?.map( r => r.id ) || []
  }
}

const handleEditCert = cert => {
  editingCert.value = { ...cert }
  showCertForm.value = true
}

const handleAddCert = () => {
  editingCert.value = null
  showCertForm.value = true
}

const handleDeleteCert = cert => {
  internalUser.value.certificates = internalUser.value.certificates.filter( c => c.id !== cert.id )
}

const handleCertFormSave = certData => {
  if ( certData.id ) {
    // Replace target certificate with new data
    const index = internalUser.value.certificates.findIndex( c => c.id === certData.id )

    if ( index !== -1 ) {
      internalUser.value.certificates[index] = certData
    }
  } else {
    // TODO: remove later when connected to backend
    certData.id = Date.now() // mock id
    internalUser.value.certificates.push( certData )
  }
  showCertForm.value = false
}

const userFormValidationRules = computed( () => {
  const rules = {
    first_name : [
      { required : true, message : t( 'user.validation.nameRequired' ), trigger : 'blur' },
      {
        validator : ( rule, value, callback ) => {
          const errors = []
          if ( !/^[\p{Script=Han}A-Za-z]+$/u.test( value ) ) {
            if ( /\d/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoNumbers' ) )
            }
            if ( /[^A-Za-z\d\u4e00-\u9fa5]/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoSpecialChars' ) )
            }
            if ( /\s/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoSpaces' ) )
            }
          }
          if ( errors.length > 0 ) {
            callback( new Error( errors.join( ' ' ) ) )
          } else {
            callback()
          }
        },
        trigger : 'blur'
      }
    ],
    last_name : [
      { required : true, message : t( 'user.validation.nameRequired' ), trigger : 'blur' },
      {
        validator : ( rule, value, callback ) => {
          const errors = []
          if ( !/^[\p{Script=Han}A-Za-z]+$/u.test( value ) ) {
            if ( /\d/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoNumbers' ) )
            }
            if ( /[^A-Za-z\d\u4e00-\u9fa5]/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoSpecialChars' ) )
            }
            if ( /\s/.test( value ) ) {
              errors.push( t( 'user.validation.nameNoSpaces' ) )
            }
          }
          if ( errors.length > 0 ) {
            callback( new Error( errors.join( ' ' ) ) )
          } else {
            callback()
          }
        },
        trigger : 'blur'
      }
    ],
    department_id : [{ required : true, message : t( 'user.validation.departmentRequired' ), trigger : 'blur' }],
    role_list : [{ required : true, message : t( 'user.validation.roleRequired' ), trigger : 'blur' }],
    enabled : [{ required : true, message : t( 'user.validation.statusRequired' ), trigger : 'blur' }],
    phone_number : [
      {
        required : true,
        message : t( 'user.validation.phoneNumberRequired' ),
        trigger : 'blur'
      },
      {
        validator : ( rule, value, callback ) => {
          if ( !value ) return callback()

          const e164 = toE164( value ) || ''

          // Check for + prefix and 10–15 digits
          if ( !/^\+\d{10,15}$/.test( e164 ) ) {
            return callback( new Error( t( 'user.validation.phoneNumberFormat' ) ) )
          }

          return callback()
        },
        trigger : 'blur'
      }
    ],
    email : [
      { required : true, message : t( 'user.validation.emailRequired' ), trigger : 'blur' },
      { type : 'email', message : t( 'user.validation.emailInvalid' ), trigger : 'blur' }
    ],
    employee_number : [
      {
        required : false,
        validator : ( rule, value, callback ) => {
          if ( value && !/^[A-Za-z0-9_-]+$/.test( value ) ) {
            return callback( new Error( t( 'user.validation.employeeNumberFormat' ) ) )
          }
          callback()
        },
        trigger : 'blur'
      }
    ]
  }

  const passwordRules = [
    { required : true, message : t( 'user.validation.passwordRequired' ), trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        const errors = []

        if ( value.length < 8 ) {
          errors.push( t( 'user.validation.passwordMinLength' ) )
        }
        if ( !/[A-Z]/.test( value ) ) {
          errors.push( t( 'user.validation.passwordUppercase' ) )
        }
        if ( !/[a-z]/.test( value ) ) {
          errors.push( t( 'user.validation.passwordLowercase' ) )
        }
        if ( !/[0-9]/.test( value ) ) {
          errors.push( t( 'user.validation.passwordNumber' ) )
        }
        if ( !/[^A-Za-z0-9]/.test( value ) ) {
          errors.push( t( 'user.validation.passwordSpecialChar' ) )
        }
        callback( errors.length > 0 ? new Error( errors.join( ' ' ) ) : undefined )
      },
      trigger : 'blur'
    }
  ]

  const confirmRules = [
    { required : true, message : t( 'user.validation.confirmPasswordRequired' ), trigger : 'blur' },
    {
      validator : ( rule, value, callback ) => {
        if ( value !== internalUser.value.newPassword ) {
          callback( new Error( t( 'user.validation.passwordMismatch' ) ) )
        } else {
          callback()
        }
      },
      trigger : 'blur'
    }
  ]

  // New user
  if ( !internalUser.value.id ) {
    rules.newPassword = passwordRules
    rules.confirmPassword = confirmRules
  }

  // Existing user changing password
  if ( internalUser.value.id && changePassword.value ) {
    rules.newPassword = passwordRules
    rules.confirmPassword = confirmRules
  }

  return rules
} )

function handleFileUpdate( type, data ) {
  switch ( type ) {
    case 'toBeUploadImageList':
      toBeUploadImageList.value = [...data]
      break

    case 'toBeRemoveImageList':
      toBeRemoveImageList.value = [...data]
      break

    default:
      break
  }
}

// Convert phone number to E164
const toE164 = value => {
  if ( !value ) return value
  const digits = String( value ).replace( /\D/g, '' ) // keep digits only
  return digits ? `+${digits}` : null // prefix a single +
}

const buildCreateUserPayload = entry => ( {
  first_name : entry.first_name,
  last_name : entry.last_name,
  email : entry.email,
  phone_number : toE164( entry.phone_number ),
  password : entry.confirmPassword,
  employee_number : entry.employee_number,
  department_id : entry.department_id,
  role_list : entry.role_list,
  enabled : entry.enabled,
  image : entry.image
  // team : entry.teams
  // certificate_list : entry.certificates
} )

const buildUpdateUserPayload = ( entry, original ) => {
  const payload = {}
  if ( entry.first_name !== original.first_name ) {
    payload.first_name = entry.first_name
  }

  if ( entry.last_name !== original.last_name ) {
    payload.last_name = entry.last_name
  }

  if ( entry.email !== original.email ) {
    payload.email = entry.email
  }

  const curPhone = toE164( entry.phone_number ) || ''
  const origPhone = toE164( original.phone_number ) || ''

  if ( curPhone !== origPhone ) {
    payload.phone_number = curPhone
  }

  if ( entry.confirmPassword ) {
    payload.password = entry.confirmPassword // Always include if changing password
  }

  if ( entry.employee_number !== original.employee_number ) {
    payload.employee_number = entry.employee_number
  }

  if ( entry.department_id !== original.department_id ) {
    payload.department_id = entry.department_id
  }

  const rolesChanged = JSON.stringify( entry.role_list || [] ) !== JSON.stringify( ( original.roles || [] ).map( r => r.id ) )
  if ( rolesChanged ) {
    payload.role_list = entry.role_list
  }

  if ( entry.enabled !== original.enabled ) {
    payload.enabled = entry.enabled
  }

  if ( entry.image !== original.image ) {
    payload.image = entry.image
  }

  return payload
}

async function handleConfirm() {
  const isValid = await formRef.value.validate()
  let username = null
  if ( !isValid ) {
    return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
  }

  submitting.value = true
  emit( 'update:loading', true )

  try {
    // Upload images to minio
    try {
      if ( toBeUploadImageList.value.length > 0 ) {
        const imageRes = await uploadMultipleToMinio( toBeUploadImageList.value )
        const images = imageRes.data.uploadedFiles?.map( file => file.url ) || []
        // TODO: refactor later, now hard code first
        internalUser.value.image = images[0] || null
      } else {
        // No image is attached
        internalUser.value.image = null
      }
    } catch ( err ) {
      // TODO: replace with translated key
      ElMessage.error( 'Image file upload failed' )
    }

    // Build payload
    const payload =
      internalUser.value.id != null
        ? buildUpdateUserPayload( internalUser.value, originalUserSnapshot.value )
        : buildCreateUserPayload( internalUser.value )

    // Submit API
    if ( internalUser.value.id != null ) {
      await updateUserByAdmin( internalUser.value.id, payload )
    } else {
      const res = await createUser( payload )
      username = res?.data?.username
    }

    // Delete removed file in Minio
    try {
      if ( toBeRemoveImageList.value?.length > 0 ) {
        const deleteResponse = await deleteObjectList( {
          bucketName : 'sv-file-bucket',
          objectUrls : toBeRemoveImageList.value
        } )

        if ( deleteResponse.status === 0 ) {
          ElMessage.success( 'Old files deleted successfully!' )
        }
      }
    } catch ( err ) {
      // TODO: replace with translated key
      console.log( err )
      ElMessage.error( 'Image file delete failed' )
    }

    // File upload cleanup
    clearFileUploadComponent()

    if ( username ) {
      emit( 'confirm', username ) // Pass the username to parent
    } else {
      ElMessage.success( t( 'user.message.userUpdatedSuccess' ) )
      emit( 'confirm' )
    }
  } catch ( err ) {
    console.error( 'Error submitting user form:', err )
    ElMessage.error( t( 'user.message.userUpdatedFailed' ) )
  } finally {
    submitting.value = false
    emit( 'update:loading', false )
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

    if ( originalUserSnapshot.value === null ) {
      internalUser.value = createEmptyUser()
    } else {
      internalUser.value = JSON.parse( JSON.stringify( originalUserSnapshot.value ) )
      // internalUser.value = originalUserSnapshot.value
    }

    // Reset file upload component
    clearFileUploadComponent()

    formRef.value.clearValidate()
  } catch {
    // user canceled/closed — do nothing
  }
}

function clearFileUploadComponent() {
  toBeUploadImageList.value = []
  toBeRemoveImageList.value = []
  userFormImageUploadRef.value.clearExistingFromNewLists()
  userFormImageUploadRef.value.resetNewFileLists()
}

const isUserEdited = computed( () => {
  if ( !internalUser.value.id || !originalUserSnapshot.value ) return true

  const payload = buildUpdateUserPayload( internalUser.value, originalUserSnapshot.value )

  // Also check if there are any update on file upload
  if ( toBeUploadImageList.value?.length > 0 || toBeRemoveImageList.value?.length > 0 ) {
    return true
  }

  return Object.keys( payload ).length > 0
} )
</script>

<style scoped lang="scss">
.two-col-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

::v-deep(.vue-tel-input) {
  width: 100%;
  border-radius: 5px;
  display: flex;
  border: 1px solid var(--el-border-color);
  text-align: left;
  transition: border-color var(--el-transition-duration);
}

::v-deep(.vti) {
  flex: 1;
  width: 100%;
}

::v-deep(.vti__input) {
  flex: 1;
  width: 100%;
}

::v-deep(.vti__input:focus) {
  box-shadow: none;
  border-color: var(--el-color-primary);
}

::v-deep(.vti__dropdown) {
  border-radius: 4px;
  border-color: var(--el-border-color);
  padding: 0px;
}

::v-deep(.vti__dropdown--open) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border: 1px solid var(--el-border-color);
}

/* match Element Plus validation states */
:deep(.el-form-item.is-error .vue-tel-input) {
  border-color: var(--el-color-danger) !important;
}

//:deep(.el-form-item.is-success .vue-tel-input) {
//  border-color: var(--el-color-success) !important;
//}
</style>
