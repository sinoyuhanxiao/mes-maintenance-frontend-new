<template>
  <el-form
    ref="formRef"
    :model="internalDepartment"
    :rules="departmentFormRules"
    label-width="160px"
    class="two-col-form"
  >
    <div class="form-row">
      <el-form-item prop="name" :label="t('common.name')">
        <el-input v-model="internalDepartment.name" />
      </el-form-item>

      <el-form-item prop="code" :label="t('common.code')">
        <el-input v-model="internalDepartment.code" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item class="full-width" prop="description" :label="t('common.description')">
        <el-input type="textarea" v-model="internalDepartment.description" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="role_list" :label="'Assigned Roles'">
        <el-select
          v-model="internalDepartment.role_list"
          multiple
          clearable
          collapse-tags
          collapse-tags-tooltip
          filterable
        >
          <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
      </el-form-item>

      <el-form-item prop="location_id" :label="t('team.assignedLocation')">
        <LocationTreeSelect v-model="internalDepartment.location_id" :multiple="false" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="manager_id" :label="'Manager'">
        <el-select
          v-model="internalDepartment.manager_id"
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          filterable
          :placeholder="t('team.placeholder.selectMembers')"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.first_name + ' ' + user.last_name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
    </div>
  </el-form>

  <div class="form-action-row">
    <el-button @click="emit('cancel')">
      {{ t('common.cancel') }}
    </el-button>

    <el-button type="warning" @click="handleResetForm">
      {{ t('workOrder.actions.reset') }}
    </el-button>

    <el-button type="primary" :disabled="internalDepartment.id && !isDepartmentEdited" @click="handleConfirmSubmit">
      {{ t('common.confirm') }}
    </el-button>
  </div>
</template>

<script setup>
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import { createDepartment, updateDepartment } from '@/api/department'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { searchRoles } from '@/api/rbac'

const prop = defineProps( {
  department : {
    type : Object,
    default : null
  },
  userOptions : {
    type : Array,
    default : () => []
  }
} )

const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )

const departmentFormRules = {
  name : [{ required : true, message : t( 'common.nameRequired' ), trigger : 'blur' }]
}

const formRef = ref()
const submitting = ref( false )
const internalDepartment = ref( createEmptyDepartment() )
const originalDepartmentSnapshot = ref( null )
const roleOptions = ref( [] )

function createEmptyDepartment() {
  return {
    id : null,
    name : '',
    code : '',
    description : '',
    parent_id : null,
    location_id : [],
    manager_id : null,
    role_list : []
  }
}

watch(
  () => prop.department,
  async department => {
    if ( department ) {
      const normalized = {
        ...createEmptyDepartment(),
        ...department,
        role_list : ( department.role_list || [] ).map( r => r.id ?? r ),
        location_id : [department.location_id]
      }
      internalDepartment.value = normalized
      originalDepartmentSnapshot.value = JSON.parse( JSON.stringify( normalized ) )
    } else {
      internalDepartment.value = createEmptyDepartment()
      originalDepartmentSnapshot.value = null
    }

    await nextTick()
    formRef.value?.clearValidate()
  },
  { immediate : true }
)

async function handleResetForm() {
  try {
    await ElMessageBox.confirm( t( 'common.confirmMessage' ), t( 'common.warning' ), {
      type : 'warning',
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      distinguishCancelAndClose : true
    } )

    if ( originalDepartmentSnapshot.value === null ) {
      internalDepartment.value = createEmptyDepartment()
    } else {
      internalDepartment.value = JSON.parse( JSON.stringify( originalDepartmentSnapshot.value ) )
    }

    formRef.value.clearValidate()
  } catch {}
}

// TODO: add role_list param later
const buildCreatePayload = entry => ( {
  name : entry.name,
  code : entry.code,
  description : entry.description,
  parent_id : entry.parent_id,
  location_id : entry.location_id.length > 0 ? entry.location_id[0] : null,
  manager_id : entry.manager_id,
  role_list : entry.role_list
} )

const buildUpdatePayload = ( entry, original ) => {
  const payload = {}
  if ( entry.name !== original.name ) payload.name = entry.name
  if ( entry.code !== original.code ) payload.code = entry.code
  if ( entry.description !== original.description ) payload.description = entry.description
  if ( entry.parent_id !== original.parent_id ) payload.parent_id = entry.parent_id
  if ( entry.location_id !== original.location_id ) {
    payload.location_id = entry.location_id.length > 0 ? entry.location_id[0] : null
  }
  if ( entry.role_list !== original.role_list ) payload.role_list = entry.role_list
  if ( entry.manager_id !== original.manager_id ) payload.manager_id = entry.manager_id
  return payload
}

const isDepartmentEdited = computed( () => {
  if ( !internalDepartment.value.id || !originalDepartmentSnapshot.value ) return true
  const payload = buildUpdatePayload( internalDepartment.value, originalDepartmentSnapshot.value )
  return Object.keys( payload ).length > 0
} )

async function handleConfirmSubmit() {
  const isValid = await formRef.value.validate()
  if ( !isValid ) {
    return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
  }

  submitting.value = true
  emit( 'update:loading', true )

  try {
    const payload = internalDepartment.value.id
      ? buildUpdatePayload( internalDepartment.value, originalDepartmentSnapshot.value )
      : buildCreatePayload( internalDepartment.value )

    if ( internalDepartment.value.id ) {
      await updateDepartment( internalDepartment.value.id, payload )
      ElMessage.success( t( 'department.message.updated' ) )
    } else {
      await createDepartment( payload )
      ElMessage.success( t( 'department.message.created' ) )
    }

    emit( 'confirm' )
  } catch ( err ) {
    console.error( 'Error submitting department form:', err )
    ElMessage.error( t( 'department.message.submitFailed' ) )
  } finally {
    submitting.value = false
    emit( 'update:loading', false )
  }
}

async function loadRoles() {
  const res = await searchRoles( {}, 1, 100, 'id', 'ASC' )
  roleOptions.value = res.data.content
}

onMounted( async() => {
  await loadRoles()
} )
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
</style>
