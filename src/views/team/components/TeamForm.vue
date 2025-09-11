<template>
  <el-form ref="formRef" :model="internalTeam" :rules="teamFormRules" label-width="160px" class="two-col-form">
    <div class="form-row">
      <el-form-item prop="name" :label="t('team.name')">
        <el-input v-model="internalTeam.name" />
      </el-form-item>

      <el-form-item prop="code" :label="t('team.code')">
        <el-input v-model="internalTeam.code" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item class="full-width" prop="description" :label="t('common.description')">
        <el-input type="textarea" v-model="internalTeam.description" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="leader_id" :label="t('team.leader')">
        <el-select
          v-model="internalTeam.leader_id"
          :placeholder="t('team.placeholder.selectLeader')"
          clearable
          filterable
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.first_name + ' ' + user.last_name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="team_members_id" :label="t('team.members')">
        <el-select
          v-model="internalTeam.team_members_id"
          multiple
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
            :disabled="user.id === internalTeam.leader_id"
          />
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="department_id" :label="t('user.department')">
        <el-select v-model="internalTeam.department_id" clearable>
          <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
      </el-form-item>

      <el-form-item prop="location_ids" :label="t('team.assignedLocation')">
        <LocationTreeSelect v-model="internalTeam.location_ids" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="equipment_node_ids" :label="t('team.assignedEquipment')">
        <EquipmentTreeSelect v-model="internalTeam.equipment_node_ids" />
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

    <el-button type="primary" :disabled="internalTeam.id && !isTeamEdited" @click="handleConfirmSubmit">
      {{ t('common.confirm') }}
    </el-button>
  </div>
</template>

<script setup>
import EquipmentTreeSelect from '@/views/team/components/EquipmentTreeSelect.vue'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import { createTeam, updateTeam } from '@/api/team'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const prop = defineProps( {
  team : {
    type : Object,
    default : null
  },
  departmentOptions : {
    type : Array,
    default : () => []
  },
  userOptions : {
    type : Array,
    default : () => []
  }
} )

const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )

const teamFormRules = {
  name : [{ required : true, message : t( 'team.validation.nameRequired' ), trigger : 'blur' }],
  code : [{ required : true, message : t( 'team.validation.codeRequired' ), trigger : 'blur' }]
}
const formRef = ref()
const submitting = ref( false )

const internalTeam = ref( createEmptyTeam() )

function createEmptyTeam() {
  return {
    id : null,
    name : '',
    code : '',
    description : '',
    department_id : null,
    leader_id : null,
    member_requests : [],
    location_ids : [],
    equipment_node_ids : [],
    team_members_id : []
  }
}

function transformIncomingTeam( team ) {
  return {
    ...createEmptyTeam(),
    ...team,
    location_ids : team.team_locations_id,
    equipment_node_ids : team.team_equipment_nodes_id
  }
}
const originalTeamSnapshot = ref( null )

watch(
  () => prop.team,
  async team => {
    if ( team ) {
      const clonedTeam = transformIncomingTeam( team )
      internalTeam.value = clonedTeam
      originalTeamSnapshot.value = JSON.parse( JSON.stringify( clonedTeam ) )
    } else {
      internalTeam.value = createEmptyTeam()
      originalTeamSnapshot.value = null
    }

    await nextTick()

    if ( formRef.value ) {
      formRef.value.clearValidate()
    }
  },
  { immediate : true }
)

watch(
  () => internalTeam.value.leader_id,
  ( newLeaderId, oldLeaderId ) => {
    if ( !newLeaderId ) return

    // Remove leader_id if it exists in team_members_id to prevent duplicate selection
    const index = internalTeam.value.team_members_id.indexOf( newLeaderId )
    if ( index !== -1 ) {
      internalTeam.value.team_members_id.splice( index, 1 )
    }
  }
)

async function handleResetForm() {
  try {
    await ElMessageBox.confirm(
      t( 'common.confirmMessage', t( 'common.warning' ), {
        type : 'warning',
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        distinguishCancelAndClose : true
      } )
    )

    if ( originalTeamSnapshot.value === null ) {
      internalTeam.value = createEmptyTeam()
    } else {
      internalTeam.value = JSON.parse( JSON.stringify( originalTeamSnapshot.value ) )
    }

    formRef.value.clearValidate()
  } catch {}
}

const buildCreateTeamPayload = entry => ( {
  name : entry.name,
  code : entry.code,
  description : entry.description,
  department_id : entry.department_id,
  member_requests : entry.member_requests,
  team_location_ids : entry.location_ids,
  team_equipment_node_ids : entry.equipment_node_ids
} )

const buildUpdateTeamPayload = ( entry, original ) => {
  const payload = {}
  if ( entry.name !== original.name ) {
    payload.name = entry.name
  }

  if ( entry.code !== original.code ) {
    payload.code = entry.code
  }
  if ( entry.description !== original.description ) {
    payload.description = entry.description
  }

  if ( entry.department_id !== original.department_id ) {
    payload.department_id = entry.department_id
  }

  if ( entry.member_requests !== original.member_requests ) {
    payload.member_requests = entry.member_requests
  }

  if ( entry.location_ids !== original.location_ids ) {
    payload.team_locations_id = entry.location_ids
  }

  if ( entry.equipment_node_ids !== original.equipment_node_ids ) {
    payload.team_equipment_nodes_id = entry.equipment_node_ids
  }

  return payload
}

const isTeamEdited = computed( () => {
  if ( !internalTeam.value.id || !originalTeamSnapshot.value ) return true

  const payload = buildUpdateTeamPayload( internalTeam.value, originalTeamSnapshot.value )

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
    internalTeam.value.member_requests = buildMemberRequests(
      internalTeam.value.leader_id,
      internalTeam.value.team_members_id
    )

    const payload = internalTeam.value.id
      ? buildUpdateTeamPayload( internalTeam.value, originalTeamSnapshot.value )
      : buildCreateTeamPayload( internalTeam.value )

    if ( internalTeam.value.id ) {
      await updateTeam( internalTeam.value.id, payload )
      ElMessage.success( t( 'team.message.updated' ) )
    } else {
      await createTeam( payload )
      ElMessage.success( t( 'team.message.created' ) )
    }

    emit( 'confirm' )
  } catch ( err ) {
    console.error( 'Error submitting team form:', err )
    ElMessage.error( t( 'team.message.teamUpdatedFailed' ) )
  } finally {
    submitting.value = false
    emit( 'update:loading', false )
  }
}

function buildMemberRequests( leaderId, memberIds ) {
  const requests = []

  if ( leaderId ) {
    requests.push( { userId : leaderId, isLeader : true } )
  }

  for ( const id of memberIds ) {
    // Skip if member is also leader
    if ( id !== leaderId ) {
      requests.push( { userId : id, isLeader : false } )
    }
  }

  return requests
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
</style>
