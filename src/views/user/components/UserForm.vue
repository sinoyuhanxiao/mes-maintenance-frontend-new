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
      <!--      <el-form-item :label="t('user.department')" prop="department_list">-->
      <!--        <el-select-->
      <!--          v-model="internalUser.department_list"-->
      <!--          :placeholder="t('user.form.selectDepartmentPlaceHolder')"-->
      <!--          filterable-->
      <!--          multiple-->
      <!--          clearable-->
      <!--        >-->
      <!--          <el-option-->
      <!--            v-for="department in prop.departmentOptions"-->
      <!--            :key="department.id"-->
      <!--            :label="department.name"-->
      <!--            :value="department.id"-->
      <!--          >-->
      <!--            <el-tag>{{ department.name }}</el-tag>-->
      <!--          </el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->

      <el-form-item :label="t('user.form.role')" prop="role_id">
        <el-select
          v-model="internalUser.role_id"
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="3"
          placeholder="Select a role"
          filterable
          clearable
          style="width: 100%"
        >
          <template #label="{ label, value }">
            <span>{{ label }}</span>
            <el-text> – {{ getRoleModule(value) }} </el-text>
          </template>

          <!-- Header filter section -->
          <template #header>
            <div class="role-filter-header">
              <div class="filter-title">Filter By Module</div>
              <el-checkbox-group v-model="selectedModules" @change="filterRolesByModule">
                <el-checkbox label="maintenance">Maintenance</el-checkbox>
                <el-checkbox label="quality control">Quality Control</el-checkbox>
                <el-checkbox label="production">Production</el-checkbox>
                <el-checkbox label="inventory">Inventory</el-checkbox>
              </el-checkbox-group>
            </div>
          </template>

          <!-- Filtered Role Options -->
          <el-option v-for="role in filteredRoleOptions" :key="role.id" :label="role.name" :value="role.id">
            <div class="role-option-item">
              <span>{{ role.name }}</span>
              <el-text type="info" style="margin-left: auto; font-size: 12px">
                Module: {{ role.module ? capitalize(role.module) : '-' }}
              </el-text>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="t('user.employeeNumber')" prop="employee_number">
        <el-input v-model="internalUser.employee_number" @input="val => (internalUser.employee_number = val || null)" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item :label="t('user.form.email')" prop="email">
        <el-input v-model="internalUser.email" />
      </el-form-item>

      <el-form-item :label="t('user.form.phoneNumber')" prop="phone_number">
        <vue-tel-input
          v-model="internalUser.phone_number"
          :placeholder="t('user.form.phoneNumber')"
          :mode="'international'"
          :default-country="'CA'"
          :valid-character-only="true"
          :input-options="{ showDialCode: true, maxlength: 20 }"
          @blur="handlePhoneBlur"
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

    <el-form-item :label="t('user.certificate')" prop="user_certificates">
      <certificate-list
        :certificates="internalUser.user_certificates"
        @edit="handleEditCertificate"
        @delete="handleDeleteCertificate"
        @add="handleAddCertificate"
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
      <!-- Custom username radio group -->
      <div class="form-row">
        <el-form-item :label="t('user.form.username')">
          <el-radio-group v-model="useCustomUsername">
            <el-radio :label="false">{{ t('user.form.autoGenerate') }}</el-radio>
            <el-radio :label="true">{{ t('user.form.customUsername') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Show input only if custom username is chosen -->
        <el-form-item v-if="useCustomUsername" prop="username">
          <el-input
            v-model="internalUser.username"
            :placeholder="t('user.form.enterCustomUsername')"
            @blur="checkUsername"
            clearable
          />
        </el-form-item>

        <!-- Show info text if auto-generate is chosen -->
        <div v-if="!useCustomUsername" class="hint">
          {{ t('user.form.usernameAutoHint') }}
        </div>
      </div>

      <el-alert center type="info" show-icon :closable="false">
        <p>{{ t('user.form.usernameHintNoUpdate') }}</p>
      </el-alert>

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

    <el-button type="warning" @click="handleResetForm(false)">
      {{ t('workOrder.actions.reset') }}
    </el-button>

    <el-button type="primary" :disabled="internalUser.id && !isUserEdited" @click="handleConfirm">
      {{ t('user.form.confirmButton') }}
    </el-button>
  </div>

  <!-- Certificate Form Dialog -->
  <certificate-form-dialog
    :visible="showCertForm"
    :certificate="selectedCertificate"
    @confirm="handleConfirmCertificateForm"
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
import { createUser, isUsernameExist, updateUserByAdmin } from '@/api/user'
import { deleteObjectList, uploadMultipleToMinio } from '@/api/minio'
import { useI18n } from 'vue-i18n'
import 'vue-tel-input/vue-tel-input.css'
import { useUserStore } from '@/store'
import { emitter } from '@/utils/mitt'

defineExpose({
  handleResetForm,
})

const prop = defineProps({
  user: {
    type: Object,
    default: null,
  },
  roleOptions: {
    type: Array,
    default: () => [],
  },
  departmentOptions: {
    type: Array,
    default: () => [],
  },
})
const { t } = useI18n()
const emit = defineEmits(['confirm', 'cancel', 'update:loading'])
const formRef = ref()
const userFormImageUploadRef = ref()
const showCertForm = ref(false)
const selectedCertificate = ref(null)
const selectedCertificateIndex = ref(null)
const toBeUploadImageList = ref()
const toBeRemoveImageList = ref()
const changePassword = ref(false)
const submitting = ref(false)
const internalUser = ref(createEmptyUser())
const originalUserSnapshot = ref(null) // stores original userEntry on edit
const useCustomUsername = ref(false)

watch(
  () => prop.user,
  async user => {
    if (user) {
      const clonedUser = transformIncomingUser(user)
      internalUser.value = clonedUser
      originalUserSnapshot.value = JSON.parse(JSON.stringify(clonedUser))
    } else {
      internalUser.value = createEmptyUser()
      originalUserSnapshot.value = null
    }

    await nextTick()
    if (formRef.value) {
      formRef.value.clearValidate()
    }

    selectedModules.value = []
  },
  { immediate: true }
)

watch(changePassword, async () => {
  await nextTick()
  formRef.value?.clearValidate(['newPassword', 'confirmPassword'])
})

function createEmptyUser() {
  return {
    id: null,
    first_name: '',
    last_name: '',
    // department_list : [],
    role_id: null,
    email: '',
    phone_number: '+1',
    enabled: true,
    employee_number: null,
    image: null,
    user_certificates: [],
    teams: [],
    newPassword: '',
    confirmPassword: '',
    username: null, // Initialize as null, keep null for auto generation
  }
}

function transformIncomingUser(user) {
  function transformIncomingCertificate(cert) {
    return {
      id: cert.id,
      name: cert.name,
      certificate_number: cert.certificate_number,
      issue_date: cert.issue_date,
      expiration_date: cert.expiration_date,
      review_date: cert.review_date,
      external_reviewer_name: cert.external_reviewer_name,
      reviewer_id: cert.reviewer_id,
      note: cert.note,
      file_list: cert.file_list ? [...cert.file_list] : [],
    }
  }

  changePassword.value = false

  return {
    ...createEmptyUser(),
    ...user,
    user_certificates: (user.certificate_list || []).map(c => transformIncomingCertificate(c)),
    // department_list : user.department_ids || [],
    role_id: user.role_list[0]?.id || null,
  }
}

const handleEditCertificate = (cert, index) => {
  selectedCertificateIndex.value = index
  selectedCertificate.value = { ...cert }
  showCertForm.value = true
}

const handleAddCertificate = () => {
  selectedCertificate.value = null
  selectedCertificateIndex.value = null

  showCertForm.value = true
}

const handleDeleteCertificate = (cert, index) => {
  console.log('delete certificate index', index)

  if (index !== null && index >= 0 && index < internalUser.value.user_certificates.length) {
    internalUser.value.user_certificates.splice(index, 1)
  }
}

const handleConfirmCertificateForm = updatedCertificate => {
  console.log('updatedCertificate emit from certificate form:', updatedCertificate)
  // Update certificate in internal_user.certificates using index if it exists
  if (
    selectedCertificateIndex.value !== null &&
    selectedCertificateIndex.value >= 0 &&
    selectedCertificateIndex.value < internalUser.value.user_certificates.length
  ) {
    // Replace the certificate at the specific index
    internalUser.value.user_certificates[selectedCertificateIndex.value] = updatedCertificate
  } else {
    // Add new certificate
    internalUser.value.user_certificates.push(updatedCertificate)
  }

  showCertForm.value = false

  // Reset selection state
  selectedCertificateIndex.value = null
  selectedCertificate.value = null
}

const userFormValidationRules = computed(() => {
  const rules = {
    first_name: [
      { required: true, message: t('user.validation.nameRequired'), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          const errors = []
          if (!/^[\p{Script=Han}A-Za-z]+$/u.test(value)) {
            if (/\d/.test(value)) {
              errors.push(t('user.validation.nameNoNumbers'))
            }
            if (/[^A-Za-z\d\u4e00-\u9fa5]/.test(value)) {
              errors.push(t('user.validation.nameNoSpecialChars'))
            }
            if (/\s/.test(value)) {
              errors.push(t('user.validation.nameNoSpaces'))
            }
          }
          if (errors.length > 0) {
            callback(new Error(errors.join(' ')))
          } else {
            callback()
          }
        },
        trigger: 'blur',
      },
    ],
    last_name: [
      { required: true, message: t('user.validation.nameRequired'), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          const errors = []
          if (!/^[\p{Script=Han}A-Za-z]+$/u.test(value)) {
            if (/\d/.test(value)) {
              errors.push(t('user.validation.nameNoNumbers'))
            }
            if (/[^A-Za-z\d\u4e00-\u9fa5]/.test(value)) {
              errors.push(t('user.validation.nameNoSpecialChars'))
            }
            if (/\s/.test(value)) {
              errors.push(t('user.validation.nameNoSpaces'))
            }
          }
          if (errors.length > 0) {
            callback(new Error(errors.join(' ')))
          } else {
            callback()
          }
        },
        trigger: 'blur',
      },
    ],
    // department_list : [{ required : false, message : t( 'user.validation.departmentRequired' ), trigger : 'blur' }],
    role_id: [{ required: true, message: t('user.validation.roleRequired'), trigger: 'blur' }],
    phone_number: [
      {
        required: true,
        message: t('user.validation.phoneNumberRequired'),
        trigger: 'blur',
      },
      {
        validator: (rule, value, callback) => {
          if (!value) return callback()

          const e164 = toE164(value) || ''

          // Check for + prefix and 10–15 digits
          if (!/^\+\d{10,15}$/.test(e164)) {
            return callback(new Error(t('user.validation.phoneNumberFormat')))
          }

          return callback()
        },
        trigger: 'blur',
      },
    ],
    email: [
      { required: true, message: t('user.validation.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('user.validation.emailInvalid'), trigger: 'blur' },
    ],
    employee_number: [
      {
        required: false,
        validator: (rule, value, callback) => {
          if (value && !/^[A-Za-z0-9_-]+$/.test(value)) {
            return callback(new Error(t('user.validation.employeeNumberFormat')))
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  }

  const passwordRules = [
    { required: true, message: t('user.validation.passwordRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const errors = []

        if (value.length < 8) {
          errors.push(t('user.validation.passwordMinLength'))
        }
        if (!/[A-Z]/.test(value)) {
          errors.push(t('user.validation.passwordUppercase'))
        }
        if (!/[a-z]/.test(value)) {
          errors.push(t('user.validation.passwordLowercase'))
        }
        if (!/[0-9]/.test(value)) {
          errors.push(t('user.validation.passwordNumber'))
        }
        if (!/[^A-Za-z0-9]/.test(value)) {
          errors.push(t('user.validation.passwordSpecialChar'))
        }
        callback(errors.length > 0 ? new Error(errors.join(' ')) : undefined)
      },
      trigger: 'blur',
    },
  ]

  const confirmRules = [
    { required: true, message: t('user.validation.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== internalUser.value.newPassword) {
          callback(new Error(t('user.validation.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ]

  // New user
  if (!internalUser.value.id) {
    rules.newPassword = passwordRules
    rules.confirmPassword = confirmRules
  }

  // Existing user changing password
  if (internalUser.value.id && changePassword.value) {
    rules.newPassword = passwordRules
    rules.confirmPassword = confirmRules
  }

  // Rule when using custom username
  if (!internalUser.value.id && useCustomUsername.value) {
    rules.username = [
      {
        required: true,
        message: t('user.validation.usernameRequired'),
        trigger: 'blur',
      },
      {
        min: 1,
        max: 25,
        message: t('user.validation.usernameMaxLength'),
        trigger: 'blur',
      },
      {
        async validator(rule, value, callback) {
          if (!value) return callback()

          if (value.length > 25) {
            return callback(new Error(t('user.validation.usernameMaxLength')))
          }

          try {
            const res = await isUsernameExist(value)
            if (res.data) {
              callback(new Error(t('user.validation.usernameExists')))
            } else {
              callback()
            }
          } catch (e) {
            callback(new Error(t('user.validation.usernameCheckFailed')))
          }
        },
        trigger: 'blur',
      },
    ]
  }

  return rules
})

function handlePhoneBlur() {
  // Manually trigger validation of phone_number
  if (formRef.value) {
    formRef.value.validateField('phone_number')
  }
}

function handleFileUpdate(type, data) {
  switch (type) {
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
  if (!value) return value
  const digits = String(value).replace(/\D/g, '') // keep digits only
  return digits ? `+${digits}` : null // prefix a single +
}

const buildCreateUserPayload = entry => {
  return {
    first_name: entry.first_name,
    last_name: entry.last_name,
    username: useCustomUsername.value ? entry.username : null,
    email: entry.email,
    phone_number: toE164(entry.phone_number),
    password: entry.confirmPassword,
    employee_number: entry.employee_number,
    // department_list : entry.department_list,
    role_list: [entry.role_id],
    enabled: entry.enabled,
    image: entry.image,
    user_certificates: entry.user_certificates,
  }
}

const buildUpdateUserPayload = (entry, original) => {
  const payload = {}
  if (entry.first_name !== original.first_name) {
    payload.first_name = entry.first_name
  }

  if (entry.last_name !== original.last_name) {
    payload.last_name = entry.last_name
  }

  if (entry.email !== original.email) {
    payload.email = entry.email
  }

  const curPhone = toE164(entry.phone_number) || ''
  const origPhone = toE164(original.phone_number) || ''

  if (curPhone !== origPhone) {
    payload.phone_number = curPhone
  }

  if (entry.confirmPassword) {
    payload.password = entry.confirmPassword // Always include if changing password
  }

  if (entry.employee_number !== original.employee_number) {
    payload.employee_number = entry.employee_number
  }

  // const departmentChanged = JSON.stringify( entry.department_list ) !== JSON.stringify( original.department_list )
  // if ( departmentChanged ) {
  //   payload.department_list = entry.department_list
  // }

  const rolesChanged = JSON.stringify(entry.role_id) !== JSON.stringify(original.role_id)
  if (rolesChanged) {
    payload.role_list = [entry.role_id]
  }

  const certificateChanged =
    JSON.stringify(entry.user_certificates || []) !== JSON.stringify(original.user_certificates || [])
  if (certificateChanged) {
    payload.user_certificates = entry.user_certificates
  }

  if (entry.enabled !== original.enabled) {
    payload.enabled = entry.enabled
  }

  if (entry.image !== original.image) {
    payload.image = entry.image
  }

  return payload
}

async function handleConfirm() {
  const isValid = await formRef.value.validate()
  let username = null
  if (!isValid) {
    return ElMessage.error(t('user.message.pleaseCorrectErrors'))
  }

  submitting.value = true
  emit('update:loading', true)

  // Create
  try {
    // Upload images to minio
    try {
      if (toBeUploadImageList.value.length > 0) {
        const imageRes = await uploadMultipleToMinio(toBeUploadImageList.value)
        const images = imageRes.data.uploadedFiles?.map(file => file.url) || []

        // Expects user can only upload one image so replace as first image
        internalUser.value.image = images[0]
      }

      if (toBeRemoveImageList.value.length > 0 && toBeUploadImageList.value.length === 0) {
        // Expects user removing the only image and did not upload new image
        internalUser.value.image = null
      }
    } catch (err) {
      // TODO: replace with translated key
      ElMessage.error('Image file upload failed')
    }

    // Build payload
    const payload =
      internalUser.value.id != null
        ? buildUpdateUserPayload(internalUser.value, originalUserSnapshot.value)
        : buildCreateUserPayload(internalUser.value)

    // Submit API
    if (internalUser.value.id != null) {
      await updateUserByAdmin(internalUser.value.id, payload)

      emitter.emit('user:updated', internalUser.value.id)
    } else {
      const res = await createUser(payload)
      username = res?.data?.username
    }

    // Delete removed file in Minio
    try {
      if (toBeRemoveImageList.value?.length > 0) {
        const deleteResponse = await deleteObjectList({
          bucketName: 'sv-file-bucket',
          objectUrls: toBeRemoveImageList.value,
        })

        if (deleteResponse.status === 0) {
          ElMessage.success('Old files deleted successfully!')
        }
      }
    } catch (err) {
      // TODO: replace with translated key
      console.log(err)
      ElMessage.error('Image file delete failed')
    }

    // If updated user is the logged-in user, refresh the store
    if (internalUser.value.id) {
      const userStore = useUserStore()
      if (internalUser.value.id === userStore.uid) {
        try {
          await userStore.GET_USER_INFO()
        } catch (err) {
          console.error('[UserForm] Failed to refresh self userStore:', err)
        }
      }
    }

    // Clear local state
    internalUser.value.image = null
    internalUser.value.user_certificates = []
    clearFileUploadComponent()
    formRef.value.resetFields()

    if (username) {
      emit('confirm', username) // Pass the username to parent
    } else {
      ElMessage.success(t('user.message.userUpdatedSuccess'))
      emit('confirm')
    }
  } catch (err) {
    console.error('Error submitting user form:', err)
    ElMessage.error(t('user.message.userUpdatedFailed'))
  } finally {
    submitting.value = false
    emit('update:loading', false)
  }
}

async function handleResetForm(skipConfirmation) {
  try {
    if (!skipConfirmation) {
      await ElMessageBox.confirm('This will reset all fields to their original values. Continue?', 'Warning', {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        distinguishCancelAndClose: true,
      })
    }

    if (originalUserSnapshot.value === null) {
      internalUser.value = createEmptyUser()
    } else {
      internalUser.value = JSON.parse(JSON.stringify(originalUserSnapshot.value))
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

const isUserEdited = computed(() => {
  if (!internalUser.value.id || !originalUserSnapshot.value) return true

  const payload = buildUpdateUserPayload(internalUser.value, originalUserSnapshot.value)

  // Also check if there are any update on file upload
  if (toBeUploadImageList.value?.length > 0 || toBeRemoveImageList.value?.length > 0) {
    return true
  }

  return Object.keys(payload).length > 0
})

async function checkUsername() {
  if (!internalUser.value.username) return
  try {
    await isUsernameExist(internalUser.value.username)
  } catch (err) {
    console.error(err)
    ElMessage.error(t('user.validation.usernameCheckFailed'))
  }
}

// Restrict role selection based on selected department
// const departmentRoleMap = computed( () => {
//   const map = {}
//   prop.departmentOptions.forEach( dep => {
//     map[dep.id] = dep.role_list || []
//   } )
//   return map
// } )

const selectedModules = ref([])

function filterRolesByModule() {
  // No explicit logic needed since computed handles it
}

const filteredRoleOptions = computed(() => {
  if (selectedModules.value.length === 0) return prop.roleOptions
  return prop.roleOptions.filter(role => role.module && selectedModules.value.includes(role.module.toLowerCase()))
})

function getRoleModule(id) {
  const role = prop.roleOptions.find(r => r.id === id)
  return role?.module ? capitalize(role.module) : '-'
}

function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Watch department selection → clear invalid roles
// watch(
//   () => internalUser.value.department_list,
//   newDepartments => {
//     const validRoleIds = newDepartments.flatMap( depId => ( departmentRoleMap.value[depId] || [] ).map( r => r.id ) )
//     internalUser.value.role_list = internalUser.value.role_list.filter( rid => validRoleIds.includes( rid ) )
//   }
// )
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

.role-filter-header {
  padding: 4px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .filter-title {
    font-weight: 500;
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
}

.role-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
