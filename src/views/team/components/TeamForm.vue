<template>
  <el-form ref="formRef" :model="internalTeam" :rules="teamFormRules" label-width="180px" class="two-col-form">
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
      <el-form-item :label="'Parent Group'" class="full-width">
        <div class="parent-team-row">
          <el-switch v-model="isChildTeam" active-text="Assign under another group" />
          <TeamTreeSelect
            v-if="isChildTeam"
            v-model="internalTeam.parent_id"
            :multiple="false"
            :disable-team-id="internalTeam.id"
            style="flex: 1"
          />
        </div>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="leader_id" :label="t('team.leader')" class="full-width">
        <el-select
          v-model="internalTeam.leader_id"
          :placeholder="t('team.placeholder.selectLeader')"
          clearable
          filterable
          :filter-method="filterUserOptions"
        >
          <template #header>
            <el-switch
              v-model="showAllUser"
              class="mb-2"
              active-text="Show All Users"
              inactive-text="Show Available Users"
            />
          </template>

          <el-option
            v-for="user in filteredUserOptions"
            :key="user.id"
            :value="user.id"
            :label="formatUserLabel(user)"
            :disabled="isChildTeam && (user.id === parentTeamLeaderId || user.disabled)"
          >
            <template #default>
              <div class="user-option-row">
                <span class="user-name">{{ user.first_name }} {{ user.last_name }}</span>
                <span class="user-roles">
                  {{ user.role_list?.map(r => r.name).join(' | ') || '-' }}
                </span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="team_members_id" :label="t('team.members')" class="full-width">
        <el-select
          v-model="internalTeam.team_members_id"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="10"
          filterable
          clearable
          :filter-method="filterUserOptions"
          :placeholder="t('team.placeholder.selectMembers')"
        >
          <template #header>
            <el-switch
              v-model="showAllUser"
              class="mb-2"
              active-text="Show All Users"
              inactive-text="Show Available Users"
            />
          </template>

          <!-- Custom header slot -->
          <el-option
            v-for="user in filteredUserOptions"
            :key="user.id"
            :value="user.id"
            :label="formatUserLabel(user)"
            :disabled="
              user.id === internalTeam.leader_id || (isChildTeam && (user.id === parentTeamLeaderId || user.disabled))
            "
          >
            <template #default>
              <div class="user-option-row">
                <span class="user-name">{{ user.first_name }} {{ user.last_name }}</span>
                <span class="user-roles">
                  {{ user.role_list?.map(r => r.name).join(' | ') || '-' }}
                </span>
              </div>
            </template>
          </el-option>

          <template #footer>
            <div class="select-header">
              <el-button type="primary" size="small" @click="checkAllMembers">
                {{ 'Select All' }}
              </el-button>

              <el-button type="warning" size="small" @click="uncheckAllMembers">
                {{ 'Clear All' }}
              </el-button>
            </div>
            <el-divider style="margin: 4px 0" />
          </template>
        </el-select>
      </el-form-item>
    </div>

    <div class="form-row">
      <!-- Commented for now as backend not supported -->
      <!--      <el-form-item :label="'Working Shift'" prop="shift_id">-->
      <!--        <el-select v-model="internalTeam.shift_id" filterable clearable :placeholder="'Select a shift'">-->
      <!--          <el-option v-for="s in props.shiftOptions" :key="s.id" :label="s.name" :value="s.id" />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->

      <!-- Right column: Read-only start & end times -->
      <el-form-item label="Working Hours" v-if="selectedShift">
        <div class="shift-time-row">
          <el-time-picker
            :model-value="selectedShiftStart"
            readonly
            disabled
            format="HH:mm"
            value-format="HH:mm:ss"
            style="width: 120px"
          />
          <span> to </span>
          <el-time-picker
            :model-value="selectedShiftEnd"
            readonly
            disabled
            format="HH:mm"
            value-format="HH:mm:ss"
            style="width: 120px"
          />
        </div>
      </el-form-item>
    </div>

    <div class="form-row">
      <!--      <el-form-item prop="department_id" :label="t('user.department')">-->
      <!--        <el-select v-model="internalTeam.department_id" clearable>-->
      <!--          <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->

      <el-form-item prop="equipment_node_ids" :label="t('team.assignedEquipment')" class="full-width">
        <EquipmentTreeSelect v-model="internalTeam.equipment_node_ids" :max-collapse-tags="5" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="location_ids" :label="t('team.assignedLocation')" class="full-width">
        <LocationTreeSelect v-model="internalTeam.location_ids" :max-collapse-tags="5" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item class="full-width" :label="'Approval Flow Capability'" prop="type">
        <el-switch v-model="isDepartmentType" :active-text="'Enabled'" :inactive-text="'Disabled'" />

        <el-alert
          v-if="isDepartmentType"
          title="This group will be able to create approval flows."
          type="success"
          show-icon
          description="Approval steps will be limited to members of this group."
        />

        <el-alert
          v-else
          title="Approval flow creation is disabled."
          type="info"
          show-icon
          description="Enable this option if this group needs to manage approvals."
        />
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
import { createTeam, getTeamById, updateTeam } from '@/api/team'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TeamTreeSelect from '@/views/team/components/TeamTreeSelect.vue'

const props = defineProps( {
  team : {
    type : Object,
    default : null
  },
  // departmentOptions : {
  //   type : Array,
  //   default : () => []
  // },
  userOptions : {
    type : Array,
    default : () => []
  },
  shiftOptions : {
    type : Array,
    default : () => []
  }
} )

const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )

const teamFormRules = {
  name : [{ required : true, message : t( 'common.nameRequired' ), trigger : 'blur' }]
}
const formRef = ref()
const submitting = ref( false )
const isChildTeam = ref( false )
const internalTeam = ref( createEmptyTeam() )
const originalTeamSnapshot = ref( null )
const parentTeam = ref( null )
const parentTeamMembers = ref( [] ) // All eligible members for child team
const parentTeamLeaderId = ref( null )
const showAllUser = ref( false )
const buildCreateTeamPayload = entry => ( {
  name : entry.name,
  code : entry.code,
  description : entry.description,
  // department_id : entry.department_id,
  member_requests : entry.member_requests,
  location_ids : entry.location_ids,
  equipment_node_ids : entry.equipment_node_ids,
  parent_id : entry.parent_id,
  // shift_id : entry.shift_id
  type : entry.type
} )

const buildUpdateTeamPayload = ( entry, original ) => {
  const payload = {}
  if ( entry.name !== original.name ) {
    payload.name = entry.name
  }

  if ( entry.code !== original.code ) {
    payload.code = entry.code
  }

  if ( entry.type !== original.type ) {
    payload.type = entry.type
  }

  if ( entry.description !== original.description ) {
    payload.description = entry.description
  }

  // if ( entry.department_id !== original.department_id ) {
  //   payload.department_id = entry.department_id
  // }

  if ( entry.member_requests !== original.member_requests ) {
    payload.member_requests = entry.member_requests
  }

  if ( entry.location_ids !== original.location_ids ) {
    payload.location_ids = entry.location_ids
  }

  if ( entry.equipment_node_ids !== original.equipment_node_ids ) {
    payload.equipment_node_ids = entry.equipment_node_ids
  }

  if ( entry.parent_id !== original.parent_id ) {
    payload.parent_id = entry.parent_id
  }

  // if ( entry.shift_id !== original.shift_id ) {
  //   payload.shift_id = entry.shift_id
  // }

  return payload
}

const isDepartmentType = computed( {
  get : () => internalTeam.value.type === 'department',
  set : val => {
    internalTeam.value.type = val ? 'department' : 'team'
  }
} )

const isTeamEdited = computed( () => {
  if ( !internalTeam.value.id || !originalTeamSnapshot.value ) return true

  const payload = buildUpdateTeamPayload( internalTeam.value, originalTeamSnapshot.value )

  return Object.keys( payload ).length > 0
} )

const searchQuery = ref( '' )

// Custom filter
const filterUserOptions = query => {
  searchQuery.value = query
}

// User select label formatter
const formatUserLabel = user => {
  // const roles = user.role_list?.map( r => r.name ).join( ' | ' ) || '-'
  // return `${user.first_name} ${user.last_name} ${roles}`
  return `${user.first_name} ${user.last_name}`
}

// Disables user options and keep only parent team member if they exist
const filteredUserOptions = computed( () => {
  let baseList = props.userOptions

  if ( isChildTeam.value && parentTeamMembers.value ) {
    // Only include parent team members; disable others
    baseList = baseList.map( u => ( {
      ...u,
      disabled : !parentTeamMembers.value.includes( u.id )
    } ) )
  }

  // Hide disabled users if checkbox is on
  if ( !showAllUser.value ) {
    baseList = baseList.filter( u => !u.disabled )
  }

  // Apply search
  if ( searchQuery.value ) {
    return baseList.filter( user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
      const roles = user.role_list?.map( r => r.name.toLowerCase() ).join( ' ' ) || ''
      return fullName.includes( searchQuery.value.toLowerCase() ) || roles.includes( searchQuery.value.toLowerCase() )
    } )
  }

  return baseList
} )

const selectedShift = computed( () => props.shiftOptions.find( s => s.id === internalTeam.value.shift_id ) )

const selectedShiftStart = computed( () => selectedShift.value?.start_time || null )
const selectedShiftEnd = computed( () => selectedShift.value?.end_time || null )

watch(
  () => props.team,
  async team => {
    if ( team ) {
      const clonedTeam = transformIncomingTeam( team )
      internalTeam.value = clonedTeam
      originalTeamSnapshot.value = JSON.parse( JSON.stringify( clonedTeam ) )
      if ( internalTeam.value.parent_id ) {
        isChildTeam.value = true

        await handleParentTeamChange( internalTeam.value.parent_id )
      }
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

// When leader is selected, trim away its if it is also selected in member list
watch(
  () => internalTeam.value.leader_id,
  newLeaderId => {
    if ( !newLeaderId ) {
      return
    }

    console.log( 'new leader id detected on watch' )
    // Remove leader_id if it exists in team_members_id to prevent duplicate selection
    const index = internalTeam.value.team_members_id.indexOf( newLeaderId )
    if ( index !== -1 ) {
      console.log( 'trim away invalid member in selected member due to existing as a selected leader' )
      internalTeam.value.team_members_id.splice( index, 1 )
    }
  }
) // ensure this API exists or use searchTeams({id}) if needed

// Fetch Parent Team info when Parent Team id is changed
watch(
  () => internalTeam.value.parent_id,
  async newPid => {
    await handleParentTeamChange( newPid )
  }
)

function createEmptyTeam() {
  isChildTeam.value = false

  return {
    id : null,
    name : '',
    code : '',
    description : '',
    // department_id : null,
    leader_id : null,
    member_requests : [],
    location_ids : [],
    equipment_node_ids : [],
    team_members_id : [],
    parent_id : null,
    type : null
    // shift_id : null
  }
}

function transformIncomingTeam( team ) {
  return {
    ...createEmptyTeam(),
    ...team,
    // department_id : team.department?.id || null,
    leader_id : team.leader_id || null,
    location_ids : team.team_locations_id,
    equipment_node_ids : team.team_equipment_nodes_id
  }
}

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
      ElMessage.success( t( 'team.message.teamUpdatedSuccess' ) )
    } else {
      await createTeam( payload )
      ElMessage.success( t( 'team.message.teamAddedSuccess' ) )
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

function checkAllMembers() {
  // Select all users that are not disabled
  internalTeam.value.team_members_id = filteredUserOptions.value
    .filter(
      u =>
        !(
          u.id === internalTeam.value.leader_id ||
          ( isChildTeam.value && ( u.id === parentTeamLeaderId.value || u.disabled ) )
        )
    )
    .map( u => u.id )
}

function uncheckAllMembers() {
  internalTeam.value.team_members_id = []
}

async function handleParentTeamChange( newPid ) {
  if ( !newPid ) {
    parentTeam.value = null
    parentTeamMembers.value = []
    parentTeamLeaderId.value = null
    return
  }

  try {
    console.log( 'fetching Parent Team info...' )
    const res = await getTeamById( newPid )
    const data = res.data || {}

    parentTeam.value = data
    parentTeamLeaderId.value = data.team_member_list?.find( m => m.is_leader )?.id || null
    parentTeamMembers.value = data.team_member_list?.filter( m => m.status === 1 )?.map( m => m.id ) || []

    // trim invalid selections
    const leaderId = internalTeam.value.leader_id
    if ( leaderId && ( !parentTeamMembers.value.includes( leaderId ) || leaderId === parentTeamLeaderId.value ) ) {
      internalTeam.value.leader_id = null
    }

    internalTeam.value.team_members_id = internalTeam.value.team_members_id.filter(
      id => parentTeamMembers.value.includes( id ) && id !== parentTeamLeaderId.value
    )
  } catch ( err ) {
    console.error( 'Failed to fetch Parent Team:', err )
    parentTeam.value = null
    parentTeamMembers.value = []
    parentTeamLeaderId.value = null
  }

  // if ( newPid ) {
  //   try {
  //     console.log( 'new parent id detected on watch' )
  //     const res = await getTeamById( newPid )
  //     const data = res.data || {}
  //
  //     parentTeam.value = data
  //     parentTeamLeaderId.value = data.team_member_list?.find( m => m.is_leader )?.id || null
  //     parentTeamMembers.value = data.team_member_list?.filter( m => m.status === 1 )?.map( m => m.id ) || []
  //
  //     // Trim team's existing leader/member based on Parent Team
  //     if ( !parentTeamMembers.value.length ) {
  //       return
  //     }
  //
  //     console.log( 'running trim on invalid leader for internal team' )
  //     // Trim away invalid leader (selected leader is not part of Parent Team or selected leader is also Parent Team's leader)
  //     const leaderId = internalTeam.value.leader_id
  //     if ( leaderId && ( !parentTeamMembers.value.includes( leaderId ) || leaderId === parentTeamLeaderId.value ) ) {
  //       internalTeam.value.leader_id = null
  //     }
  //
  //     console.log( 'running trim on invalid members for internal team' )
  //     // Trim invalid selected members (keep only id from Parent Team and not leader of Parent Team)
  //     internalTeam.value.team_members_id = internalTeam.value.team_members_id.filter(
  //         id => parentTeamMembers.value.includes( id ) && id !== parentTeamLeaderId.value
  //     )
  //   } catch ( err ) {
  //     console.error( 'Failed to fetch Parent Team:', err )
  //     parentTeam.value = null
  //     parentTeamMembers.value = []
  //     parentTeamLeaderId.value = null
  //   }
  // } else {
  //   console.log( 'null/undefined pid detected on watch' )
  //
  //   parentTeam.value = null
  //   parentTeamMembers.value = []
  //   parentTeamLeaderId.value = null
  // }
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

.parent-team-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.parent-team-item .el-form-item__content {
  display: flex;
  align-items: center;
}

.user-option-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  white-space: nowrap;
}

.user-name {
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.user-roles {
  color: #909399; // gray text
  font-size: 13px;
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}
</style>
