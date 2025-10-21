<template>
  <el-form ref="formRef" :model="internalRole" :rules="roleFormRules" label-width="160px" class="two-col-form">
    <div class="form-row">
      <el-form-item prop="name" :label="'Name'">
        <el-input v-model="internalRole.name" />
      </el-form-item>

      <el-form-item prop="module" :label="'Module'">
        <el-select v-model="internalRole.module" clearable filterable :placeholder="'Select a module for the role'">
          <el-option v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="code" :label="'Code'">
        <el-input v-model="internalRole.code" @input="val => (internalRole.code = val.toUpperCase())" />

        <template #error="{ error }">
          <div v-if="error" style="color: var(--el-color-danger); font-size: 12px">{{ error }}</div>
        </template>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item class="full-width" prop="description" :label="t('common.description')">
        <el-input type="textarea" v-model="internalRole.description" />
      </el-form-item>
    </div>

    <!--    <div class="form-row">-->
    <!--      <el-form-item class="full-width" prop="permission_list" :label="'permission_list'">-->
    <!--&lt;!&ndash;        <PermissionMatrix :permission_list @change="handlePermissionMatrixChange"/>&ndash;&gt;-->
    <!--        <el-select-->
    <!--            v-model="internalRole.permission_list"-->
    <!--            multiple-->
    <!--            collapse-tags-->
    <!--            collapse-tags-tooltip-->
    <!--            :max-collapse-tags="5"-->
    <!--            filterable-->
    <!--            clearable-->
    <!--        >-->
    <!--          <el-option-->
    <!--            v-for="permission in permissionOptions"-->
    <!--            :key="permission.id"-->
    <!--            :value="permission.id"-->
    <!--            :label="permission.name + permission.code"-->

    <!--          />-->
    <!--        </el-select>-->
    <!--      </el-form-item>-->
    <!--    </div>-->
  </el-form>
  <div class="form-action-row">
    <el-button @click="emit('cancel')">
      {{ t('common.cancel') }}
    </el-button>

    <el-button type="warning" @click="handleResetForm">
      {{ t('workOrder.actions.reset') }}
    </el-button>

    <el-button type="primary" :disabled="internalRole.id && !isRoleEdited" @click="handleConfirm">
      {{ t('common.confirm') }}
    </el-button>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createRole, updateRole } from '@/api/rbac'

const prop = defineProps( {
  role : {
    type : Object,
    default : null
  }
  // permissionOptions : {
  //   type : Array,
  //   default : () => []
  // }
} )

const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )

const roleFormRules = {
  name : [{ required : true, message : t( 'common.nameRequired' ), trigger : 'blur' }],
  code : [
    { required : true, message : 'Code is required', trigger : 'blur' },
    {
      pattern : /^[A-Z_]+$/,
      message : 'Code must contain only uppercase letters (A–Z) or underscores (_)',
      trigger : ['blur', 'change']
    }
  ]
}
const formRef = ref()
const submitting = ref( false )

const internalRole = ref( createEmptyRole() )

const moduleOptions = [
  {
    label : 'Maintenance',
    value : 'Maintenance'
  },
  {
    label : 'Quality Control',
    value : 'Quality Control'
  },
  {
    label : 'Production',
    value : 'Production'
  },
  {
    label : 'Inventory',
    value : 'Inventory'
  }
]

function createEmptyRole() {
  return {
    id : null,
    name : '',
    code : null,
    description : '',
    permission_list : [],
    module : null
  }
}

function transformIncomingRole( role ) {
  return {
    ...createEmptyRole(),
    ...role
  }
}
const originalRoleSnapshot = ref( null )

watch(
  () => prop.role,
  async role => {
    if ( role ) {
      const clonedRole = transformIncomingRole( role )
      internalRole.value = clonedRole
      originalRoleSnapshot.value = JSON.parse( JSON.stringify( clonedRole ) )
    } else {
      internalRole.value = createEmptyRole()
      originalRoleSnapshot.value = null
    }

    await nextTick()

    if ( formRef.value ) {
      formRef.value.clearValidate()
    }
  },
  { immediate : true }
)

async function handleResetForm() {
  try {
    await ElMessageBox.confirm( 'This will reset all fields to their original values. Continue?', 'Warning', {
      type : 'warning',
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      distinguishCancelAndClose : true
    } )

    if ( originalRoleSnapshot.value === null ) {
      internalRole.value = createEmptyRole()
    } else {
      internalRole.value = JSON.parse( JSON.stringify( originalRoleSnapshot.value ) )
    }

    formRef.value.clearValidate()
  } catch {}
}

const buildCreateRolePayload = entry => ( {
  name : entry.name,
  description : entry.description,
  permission_list : entry.permission_list,
  code : entry.code,
  module : entry.module || null
} )

const buildUpdateRolePayload = ( entry, original ) => {
  const payload = {}
  if ( entry.name !== original.name ) {
    payload.name = entry.name
  }

  if ( entry.description !== original.description ) {
    payload.description = entry.description
  }

  if ( entry.permission_list !== original.permission_list ) {
    payload.permission_list = entry.permission_list
  }

  if ( entry.code !== original.code ) {
    payload.code = entry.code
  }

  if ( entry.module !== original.module ) {
    payload.module = entry.module || null
  }

  return payload
}

const isRoleEdited = computed( () => {
  if ( !internalRole.value.id || !originalRoleSnapshot.value ) return true

  const payload = buildUpdateRolePayload( internalRole.value, originalRoleSnapshot.value )

  return Object.keys( payload ).length > 0
} )

async function handleConfirm() {
  const isValid = await formRef.value.validate()
  if ( !isValid ) {
    return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
  }

  submitting.value = true
  emit( 'update:loading', true )

  try {
    const payload = internalRole.value.id
      ? buildUpdateRolePayload( internalRole.value, originalRoleSnapshot.value )
      : buildCreateRolePayload( internalRole.value )

    if ( internalRole.value.id ) {
      await updateRole( internalRole.value.id, payload )
      ElMessage.success( 'Role update successfully' )
    } else {
      await createRole( payload )
      ElMessage.success( 'Role create successfully' )
    }

    emit( 'confirm' )
  } catch ( err ) {
    console.error( 'Error submitting role form:', err )
  } finally {
    submitting.value = false
    emit( 'update:loading', false )
  }
}
</script>

<style scoped lang="scss">
.two-col-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.two-col-form .form-row .full-width {
  grid-column: span 2;
}

.form-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.user-option-label {
  display: inline-block;
  max-width: 240px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
