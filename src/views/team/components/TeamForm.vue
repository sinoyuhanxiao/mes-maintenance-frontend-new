<template>
  <div v-loading="isFormLoading" element-loading-background="rgba(255,255,255,0.8)">
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
            <div v-if="isChildTeam" style="width: 100%">
              <TeamTreeSelect v-model="internalTeam.parent_id" :disable-team-id="internalTeam.id" style="flex: 1" />
            </div>
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
                v-model="internalTeam.cascade_add_to_parents"
                class="mb-2"
                active-text="Show all users, selected users will also be added to all parent group"
                inactive-text="Show users from parent group"
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
                v-model="internalTeam.cascade_add_to_parents"
                class="mb-2"
                active-text="Show all users, selected user will also be added to all parent group"
                inactive-text="Show users from parent group"
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
                <el-button type="primary" size="small" @click="selectAllUserForMember">
                  {{ 'Select All' }}
                </el-button>

                <el-button type="warning" size="small" @click="removeAllSelectedMemberUser">
                  {{ 'Clear All' }}
                </el-button>
              </div>
              <el-divider style="margin: 4px 0" />
            </template>
          </el-select>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item :label="'Assigned Shift'" prop="shift_id">
          <el-select v-model="internalTeam.shift_id" filterable clearable :placeholder="'Select a shift'">
            <el-option v-for="s in props.shiftOptions" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>

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
        <el-form-item prop="equipment_node_ids" :label="t('team.assignedEquipment')" class="full-width">
          <EquipmentTreeSelect
            v-model="internalTeam.equipment_node_ids"
            :max-collapse-tags="5"
            :input-placeholder="'Select Equipment'"
          />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item prop="location_ids" :label="t('team.assignedLocation')" class="full-width">
          <LocationTreeSelect
            v-model="internalTeam.location_ids"
            :max-collapse-tags="5"
            :input-placeholder="'Select Locations'"
          />
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item class="full-width" :label="'Approval Flow Capability'" prop="type">
          <el-switch v-model="isDepartmentType" :active-text="'Enabled'" :inactive-text="'Disabled'" />

          <el-text v-if="isDepartmentType" style="margin-left: 20px">
            {{ "This group's will be able to utilize approval functionality" }}
          </el-text>

          <el-text v-else style="margin-left: 20px">
            {{ "This group's approval functionality is disabled" }}
          </el-text>
        </el-form-item>
      </div>
    </el-form>
    <div class="form-action-row">
      <el-button @click="emit('cancel')">
        {{ t('common.cancel') }}
      </el-button>

      <el-button type="warning" @click="handleResetForm(false)">
        {{ t('workOrder.actions.reset') }}
      </el-button>

      <el-button type="primary" :disabled="internalTeam.id && !isTeamEdited" @click="handleConfirmSubmit">
        {{ t('common.confirm') }}
      </el-button>
    </div>
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

defineExpose( {
  handleResetForm
} )

const props = defineProps( {
  team : {
    type : Object,
    default : null
  },
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
// const isLoading = ref( false )
const internalTeam = ref( createEmptyTeam() )
const originalTeamSnapshot = ref( null )
const parentTeam = ref( null )
const parentTeamMembers = ref( [] ) // All eligible members for child team
const parentTeamLeaderId = ref( null )
const buildCreateTeamPayload = entry => ( {
  name : entry.name,
  code : entry.code,
  description : entry.description,
  member_requests : entry.member_requests,
  location_ids : entry.location_ids,
  equipment_node_ids : entry.equipment_node_ids,
  parent_id : isChildTeam.value === true ? entry.parent_id : null,
  shift_ids : entry.shift_id ? [entry.shift_id] : [],
  type : entry.type,
  cascade_add_to_parents : entry.cascade_add_to_parents
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

  if ( entry.member_requests !== original.member_requests ) {
    payload.member_requests = entry.member_requests
  }

  if ( entry.location_ids !== original.location_ids ) {
    payload.location_ids = entry.location_ids
  }

  if ( entry.equipment_node_ids !== original.equipment_node_ids ) {
    payload.equipment_node_ids = entry.equipment_node_ids
  }

  if ( isChildTeam.value === true && entry.parent_id !== original.parent_id ) {
    payload.parent_id = entry.parent_id
  } else if ( isChildTeam.value === false && original.parent_id !== null ) {
    // when a team is changed and no longer a child team, its parent id will be removed
    payload.parent_id = null
  }

  if ( entry.shift_id !== original.shift_id ) {
    payload.shift_ids = [entry.shift_id]
  }

  if ( entry.cascade_add_to_parents !== original.cascade_add_to_parents ) {
    payload.cascade_add_to_parents = entry.cascade_add_to_parents
  }

  return payload
}

const isFormLoading = ref( false )

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

  // Only show members from parent team members if cascade add to parent not enabled
  if ( isChildTeam.value && parentTeamMembers.value && !internalTeam.value.cascade_add_to_parents ) {
    baseList = baseList.map( u => ( {
      ...u,
      disabled : !parentTeamMembers.value.includes( u.id )
    } ) )

    // Hide disabled users
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
    isFormLoading.value = true

    console.log( 'detect changed in team prop by watch' )

    try {
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
    } finally {
      isFormLoading.value = false
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

    console.log( 'detect changed in leader_id by watch' )
    // Remove leader_id if it exists in team_members_id to prevent duplicate selection
    const index = internalTeam.value.team_members_id.indexOf( newLeaderId )
    if ( index !== -1 ) {
      console.log( 'trim away invalid member in selected member due to existing as a selected leader' )
      internalTeam.value.team_members_id.splice( index, 1 )
    }
  }
)

// Fetch Parent Team info when Parent Team id is changed
watch(
  () => internalTeam.value.parent_id,
  async newPid => {
    console.log( 'detect changed in parent_id by watch' )
    await handleParentTeamChange( newPid )
  }
)

// Cleanup leader and member when cascade add is changed to false
watch(
  () => internalTeam.value.cascade_add_to_parents,
  newVal => {
    console.log( 'detect changed in cascade_add_to_parents by watch' )

    if ( newVal === false && internalTeam.value.parent_id !== null ) {
      // IDs of parent team members
      const parentIds = parentTeamMembers.value || []

      // Clean up not allowed selected users by filter away user with id not included in parentTeamMembers
      internalTeam.value.team_members_id = internalTeam.value.team_members_id?.filter( id => parentIds.includes( id ) )

      if ( !parentIds.includes( internalTeam.value.leader_id ) ) {
        internalTeam.value.leader_id = null
      }
    }
  }
)

function createEmptyTeam() {
  isChildTeam.value = false

  return {
    id : null,
    name : '',
    code : '',
    description : '',
    leader_id : null,
    member_requests : [],
    location_ids : [],
    equipment_node_ids : [],
    team_members_id : [],
    parent_id : null,
    type : null,
    shift_id : null,
    cascade_add_to_parents : false
  }
}

function transformIncomingTeam( team ) {
  return {
    ...createEmptyTeam(),
    ...team,
    leader_id : team.leader_id || null,
    location_ids : team.team_locations_id,
    equipment_node_ids : team.team_equipment_nodes_id,
    shift_id : team.shift_list?.length > 0 ? team.shift_list[0]?.id : null
  }
}

async function handleResetForm( skipConfirmation ) {
  try {
    if ( !skipConfirmation ) {
      await ElMessageBox.confirm( 'This will reset all fields to their original values. Continue?', 'Warning', {
        type : 'warning',
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        distinguishCancelAndClose : true
      } )
    }

    if ( originalTeamSnapshot.value === null ) {
      internalTeam.value = createEmptyTeam()
    } else {
      internalTeam.value = JSON.parse( JSON.stringify( originalTeamSnapshot.value ) )
      isChildTeam.value = internalTeam.value.parent_id !== null
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

function selectAllUserForMember() {
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

function removeAllSelectedMemberUser() {
  internalTeam.value.team_members_id = []
}

// Reload parent team users, and clear current team's leader/user if not included in parent team users
async function handleParentTeamChange( newPid ) {
  if ( !newPid ) {
    parentTeam.value = null
    parentTeamMembers.value = []
    parentTeamLeaderId.value = null
    return
  }

  try {
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
