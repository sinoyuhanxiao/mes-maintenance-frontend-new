<template>
  <MesLayout :title="'Work Group Management'" :view-mode="'todo'">
    <template #viewMode> </template>

    <template #head>
      <!-- User local filters -->
      <div class="toolbar">
        <div class="filters-container">
          <div class="filter-item">
            <el-select
              v-model="localFilters.member_ids"
              :placeholder="t('common.filterByUserPlaceholder')"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              style="width: 300px"
              @change="refreshTeamsData"
            >
              <el-option v-for="user in userOptions" :key="user.id" :label="formatUserLabel(user)" :value="user.id">
                <template #default>
                  <div class="user-option-row">
                    <span class="user-name">{{ user.first_name }} {{ user.last_name }}</span>
                  </div>
                </template>
              </el-option>
            </el-select>
          </div>

          <!--          <div class="filter-item">-->
          <!--            <el-select-->
          <!--              v-model="localFilters.department_ids"-->
          <!--              :placeholder="t('common.filterByDepartmentPlaceholder')"-->
          <!--              clearable-->
          <!--              multiple-->
          <!--              collapse-tags-->
          <!--              collapse-tags-tooltip-->
          <!--              size="default"-->
          <!--              style="width: 200px"-->
          <!--              @change="handleFilterChange"-->
          <!--            >-->
          <!--              <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />-->
          <!--            </el-select>-->
          <!--          </div>-->

          <div class="filter-item">
            <LocationTreeSelect v-model="localFilters.location_ids" :max-collapse-tags="1" :width="'350px'" />
          </div>

          <div class="filter-item">
            <EquipmentTreeSelect v-model="localFilters.equipment_node_ids" :max-collapse-tags="1" :width="'350px'" />
          </div>
        </div>

        <div class="actions-row">
          <div class="actions-item">
            <el-input
              v-model="localFilters.keyword"
              :placeholder="'Search By Keyword'"
              clearable
              @input="refreshTeamsData"
              style="width: 200px"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>

          <div class="actions-item">
            <el-button :icon="EditPen" type="primary" @click="openCreateForm">
              {{ t('workOrder.actions.create') }}
            </el-button>
          </div>

          <div class="actions-item">
            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">
              {{ 'Clear Filters' }}
            </el-button>
          </div>

          <div class="actions-item">
            <el-button :icon="RefreshIcon" @click="refreshAllData">
              {{ 'Refresh' }}
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <el-table
        v-loading="loading"
        :data="teamsTableData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        style="width: 100%"
        fit
        highlight-current-row
        :row-class-name="getRowClassName"
        :height="tableHeight"
        :empty-text="t('common.noData')"
        :cell-style="indentCellStyle"
      >
        <el-table-column prop="name" :label="'Group Name'" show-overflow-tooltip width="300" fixed="left">
          <template #default="scope">
            <el-link @click="handleView(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="id" :label="'ID'" width="130" fixed="left" />

        <el-table-column prop="leader_id" :label="t('team.leader')" width="200">
          <template #default="scope">
            <template v-if="scope.row.leader_id">
              <UserTag v-if="userMap[scope.row.leader_id]" :user="userMap[scope.row.leader_id]" />
            </template>

            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <!-- Members count column -->
        <el-table-column prop="team_members_id" :label="t('team.members')" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.team_members_id?.length"
              type="info"
              size="small"
              plain
              @click="handleView(row, 'members')"
            >
              {{ row.team_members_id.length + ' members' }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Equipment count column -->
        <el-table-column prop="team_equipment_nodes_id" :label="t('team.assignedEquipment')" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.team_equipment_nodes_id?.length"
              type="info"
              size="small"
              plain
              @click="handleView(row, 'equipment')"
            >
              {{ row.team_equipment_nodes_id.length + ' equipments' }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Locations count column -->
        <el-table-column prop="team_locations_id" :label="t('team.assignedLocation')" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.team_locations_id?.length"
              type="info"
              size="small"
              plain
              @click="handleView(row, 'locations')"
            >
              {{ row.team_locations_id.length + ' locations' }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="shift_list" label="Assigned Shift" width="350">
          <template #default="{ row }">
            <el-text>
              {{
                row.shift_list?.length > 0
                  ? `${row.shift_list[0].name} ${row.shift_list[0].start_time} to ${row.shift_list[0].end_time}`
                  : '-'
              }}
            </el-text>
          </template>
        </el-table-column>

        <!--        <el-table-column :label="t('user.department')" prop="department" width="250" align="center">-->
        <!--          <template #default="scope">-->
        <!--            <template v-if="scope.row.department">-->
        <!--              <DepartmentTag :department="scope.row.department" />-->
        <!--            </template>-->
        <!--            <template v-else>-->
        <!--              <span>-</span>-->
        <!--            </template>-->
        <!--          </template>-->
        <!--        </el-table-column>-->

        <el-table-column prop="code" :label="t('team.code')" width="200">
          <template #default="scope">
            <el-text>
              {{ scope.row.code || '-' }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="description" :label="t('common.description')" width="400">
          <template #default="scope">
            <el-tooltip
              effect="dark"
              :content="scope.row.description"
              placement="top"
              :disabled="!scope.row.description"
            >
              <span class="ellipsis-text">
                {{ scope.row.description || '-' }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="type" :label="'Approval'" width="250">
          <template #default="scope">
            <el-text v-if="scope.row.type === 'department'">
              <el-icon :color="'green'">
                <CircleCheck />
              </el-icon>
              Enabled
            </el-text>

            <el-text v-else>
              <el-icon :color="'red'">
                <CircleClose />
              </el-icon>
              Disabled
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="Created At" width="250" show-overflow-tooltip>
          <template #default="scope">
            <el-text>
              {{ formatAsLocalDateTimeString(scope.row.created_at) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="Updated At" width="250" show-overflow-tooltip>
          <template #default="scope">
            <el-text>
              {{ formatAsLocalDateTimeString(scope.row.updated_at) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.actions')" fixed="right" align="left" header-align="center" width="400">
          <template #default="scope">
            <el-button :icon="View" type="success" size="small" @click="handleView(scope.row)">
              {{ t('common.view') }}
            </el-button>

            <el-button :icon="EditPen" type="primary" size="small" @click="handleNewChildTeam(scope.row)">{{
              t('team.newChildTeam')
            }}</el-button>

            <el-button :icon="Edit" type="info" size="small" @click="handleEdit(scope.row)">{{
              t('common.edit')
            }}</el-button>

            <el-button :icon="Delete" type="danger" size="small" @click="handleDelete(scope.row.id)">{{
              t('common.delete')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Team Detail Dialog -->
      <TeamDetail
        v-model="showTeamDetail"
        :key="selectedTeam?.id + '-' + selectedTeam?.updated_at"
        :team="selectedTeam"
        :initial-tab="initialTab"
        :user-map="userMap"
        :equipment-map="equipmentMap"
        :location-map="locationMap"
        :shift-map="shiftMap"
        :team-map="teamMap"
        @edit="handleEdit"
      />

      <el-dialog
        :title="currentEditingTeam ? t('team.editTeam') : t('team.newTeam')"
        v-model="isDialogVisible"
        top="10vh"
        width="50%"
        @close="handleFormClosed"
      >
        <div v-loading="isFormProcessing">
          <TeamForm
            ref="teamFormRef"
            :team="currentEditingTeam"
            :user-options="userOptions"
            :shift-options="shiftOptions"
            @confirm="handleTeamSubmitted"
            @cancel="handleFormClosed"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>
    </template>

    <!--    <template #foot>-->
    <!--      <el-pagination-->
    <!--        @current-change="handlePageChange"-->
    <!--        @size-change="handleSizeChange"-->
    <!--        :page-size="pageSize"-->
    <!--        :page-sizes="[10, 20, 50]"-->
    <!--        :total="teamsTableData.length"-->
    <!--        layout="total, sizes, prev, pager, next"-->
    <!--      />-->
    <!--    </template>-->
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MesLayout from 'src/components/MesLayout'
import {
  CircleCheck,
  CircleClose,
  Delete,
  Edit,
  EditPen,
  Refresh as RefreshIcon,
  Remove,
  Search,
  View
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchTeams, deactivateTeam, getAllTeamTree, getTeamTreeByIds } from '@/api/team.js'
import { searchUsers } from '@/api/user.js'
import { searchLocations } from '@/api/location'
import { searchEquipmentNodes } from '@/api/equipment'
// import LocationTag from '@/views/team/components/LocationTag.vue'
// import EquipmentTag from '@/views/team/components/EquipmentTag.vue'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import EquipmentTreeSelect from '@/views/team/components/EquipmentTreeSelect.vue'
import TeamForm from '@/views/team/components/TeamForm.vue'
import UserTag from '@/views/user/components/UserTag.vue'
// import TagPopover from '@/views/team/components/TagPopover.vue'
import { searchShifts } from '@/api/shift'
import TeamDetail from '@/views/team/components/TeamDetail.vue'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

// import { useRouter } from 'vue-router'

defineOptions( {
  name : 'WorkGroupManagement'
} )

const { t } = useI18n()
const loading = ref( false )
const isFormProcessing = ref( false )
const isDialogVisible = ref( false )
const teamsTableData = ref( [] )
const sortSettings = ref( { prop : 'id', order : 'descending' } )
// const currentPage = ref( 1 )
// const pageSize = ref( 20 )
const tableHeight = ref( window.innerHeight - 200 )
const userOptions = ref( [] )
const teamOptions = ref( [] )
const teamTree = ref( [] )
const teamMap = ref( {} )
const shiftOptions = ref( [] )
const locationMap = ref( {} )
const equipmentMap = ref( {} )
// const departmentOptions = ref( [] )
const currentEditingTeam = ref( null )
const initialFilters = {
  keyword : '',
  // department_ids : [],
  location_ids : [],
  equipment_node_ids : [],
  member_ids : [],
  status_ids : [1]
}

const localFilters = reactive( { ...initialFilters } )
const matchedTeamIds = ref( new Set() )

const userMap = computed( () => {
  return Object.fromEntries( userOptions.value.map( user => [user.id, user] ) )
} )

// Build a lookup map once — O(n) preprocessing instead of O(n × m) rendering
const shiftMap = computed( () => {
  const map = {}
  if ( shiftOptions.value && Array.isArray( shiftOptions ) ) {
    shiftOptions.value.forEach( s => {
      const start = s.start_time?.trim() ? s.start_time.slice( 0, 5 ) : '-'
      const end = s.end_time?.trim() ? s.end_time.slice( 0, 5 ) : '-'
      map[s.id] = {
        name : s.name,
        displayTime : `${start} to ${end}`
      }
    } )
  }
  return map
} )

// Dialog control
const showTeamDetail = ref( false )
const selectedTeam = ref( null )
const teamFormRef = ref()
const initialTab = ref( 'members' )

function openCreateForm() {
  currentEditingTeam.value = null
  isDialogVisible.value = true
}

function handleNewChildTeam( team ) {
  currentEditingTeam.value = {
    parent_id : team.id
  }

  isDialogVisible.value = true
}

function handleView( team, tab = 'members' ) {
  if ( !team ) {
    return
  }

  selectedTeam.value = team
  initialTab.value = tab
  showTeamDetail.value = true
}

function handleEdit( team ) {
  currentEditingTeam.value = team
  isDialogVisible.value = true
}

function filterTeams( teams, matchedSet ) {
  // Normalize member filter to a Set of strings
  const memberFilterSet = new Set( ( localFilters.member_ids || [] ).map( String ) )
  const locationFilterSet = new Set( ( localFilters.location_ids || [] ).map( String ) )
  const equipmentFilterSet = new Set( ( localFilters.equipment_node_ids || [] ).map( String ) )
  const keywordRaw = ( localFilters.keyword || '' ).toString().trim().toLowerCase()

  const activeFilters = {
    keyword : keywordRaw.length > 0,
    member : memberFilterSet.size > 0,
    location : locationFilterSet.size > 0,
    equipment : equipmentFilterSet.size > 0
  }

  for ( const team of teams ) {
    const idStr = String( team.id )
    const nameLower = ( team.name || '' ).toLowerCase()
    const codeLower = ( team.code || '' ).toLowerCase()

    // Keyword: match id, name, or code
    const matchKeyword =
      !activeFilters.keyword ||
      idStr.includes( keywordRaw ) ||
      nameLower.includes( keywordRaw ) ||
      codeLower.includes( keywordRaw )

    const teamMembers = Array.isArray( team.team_members_id ) ? team.team_members_id.map( String ) : []
    const teamMembersSet = new Set( teamMembers )

    const matchMember =
      !activeFilters.member ||
      [...memberFilterSet].some( m => teamMembersSet.has( m ) ) ||
      ( team.leader_id != null && memberFilterSet.has( String( team.leader_id ) ) )

    // Location match
    const matchLocation =
      !activeFilters.location ||
      ( Array.isArray( team.team_locations_id ) && team.team_locations_id.some( loc => locationFilterSet.has( String( loc ) ) ) )

    // Equipment match
    const matchEquipment =
      !activeFilters.equipment ||
      ( Array.isArray( team.team_equipment_nodes_id ) &&
        team.team_equipment_nodes_id.some( eq => equipmentFilterSet.has( String( eq ) ) ) )

    // must satisfy all active filters
    const isMatched = matchKeyword && matchMember && matchLocation && matchEquipment

    if ( isMatched ) {
      matchedSet.add( team.id )
    }

    // otherwise check children recursively; if any child matches, include this parent
    if ( Array.isArray( team.children ) && team.children.length > 0 ) {
      filterTeams( team.children, matchedSet )
    }
  }
}

async function handleTeamSubmitted() {
  isDialogVisible.value = false

  await refreshTeamsData()

  // Update selected team if exist
  if ( showTeamDetail.value && selectedTeam.value?.id ) {
    const updated = teamMap.value[selectedTeam.value?.id]
    if ( updated ) {
      // clone to force new reactive reference
      selectedTeam.value = { ...updated }
    }
  }
}

function handleFormClosed() {
  isDialogVisible.value = false
  teamFormRef.value?.handleResetForm( true )
}

async function filterFullTreeAndLoadPartialTreeAndSetTeamTable() {
  // Otherwise, search through existing tree
  const matchedIds = new Set()

  // Perform recursive search on team tree
  filterTeams( teamTree.value, matchedIds )

  matchedTeamIds.value = new Set( matchedIds )

  const resultIds = Array.from( matchedIds )

  try {
    if ( resultIds?.length > 0 ) {
      const res = await getTeamTreeByIds( { team_ids : resultIds } )
      const tree = res.data || []
      const partialMappedTeamTree = fillTeamTreeWithTeamMapAndLevel( tree )
      teamsTableData.value = partialMappedTeamTree
    } else {
      teamsTableData.value = []
    }
  } catch ( e ) {
    console.error( 'Error filtering team by local filter:', e )
    ElMessage.error( t( 'team.message.teamFetchFailed' ) )
  }
}

// function handlePageChange( val ) {
//   currentPage.value = val
//   refreshTeamsData()
// }
//
// function handleSizeChange( val ) {
//   pageSize.value = val
//   currentPage.value = 1
//   refreshTeamsData()
// }

function isFilterEmpty() {
  return (
    !localFilters.keyword &&
    localFilters.member_ids.length === 0 &&
    localFilters.location_ids.length === 0 &&
    localFilters.equipment_node_ids.length === 0
  )
}

// Recursively map team object and set up level (for indentation) to matching team tree node
function fillTeamTreeWithTeamMapAndLevel( treeNodes, level = 1 ) {
  return treeNodes.map( node => {
    const fullTeam = teamMap.value[node.id] || {}
    return {
      ...fullTeam,
      level,
      children : node.children?.length ? fillTeamTreeWithTeamMapAndLevel( node.children, level + 1 ) : []
    }
  } )
}

// Fetch all team list to build team list and team map, changed table data using tree and team map
async function loadFullTeamTree() {
  loading.value = true
  try {
    const treeRes = await getAllTeamTree()
    teamTree.value = treeRes.data || []
  } catch ( err ) {
    console.error( 'Failed to load full team tree:', err )
    ElMessage.error( t( 'team.message.fetchFailed' ) )
  } finally {
    loading.value = false
  }
}

async function loadTeamOptionsAndTeamMap() {
  function snakeToCamel( str ) {
    return str.replace( /_([a-z])/g, ( _, char ) => char.toUpperCase() )
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel( sortSettings.value.prop )

    // Fetch team tree and all teams list
    const listRes = await searchTeams( {}, 1, 1000, sortKey, sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC' )

    // store teams list
    teamOptions.value = listRes.data?.content || []

    // store all teams as map
    teamMap.value = Object.fromEntries(
      teamOptions.value.map( team => {
        const activeLeaders = team.team_member_list?.filter( m => m.is_leader && m.status === 1 ) || []
        const leaderId = activeLeaders.length > 0 ? activeLeaders[0].id : null

        return [
          team.id,
          {
            id : team.id || null,
            name : team.name || null,
            code : team.code || null,
            type : team.type || null,
            parent_id : team.parent_team_id || null,
            children : team.children_team_ids,
            description : team.description,
            leader_id : leaderId,
            created_at : team.created_at,
            updated_at : team.updated_at,
            shift_list : team.shift_list || [],
            team_members_id : ( team.team_member_list || [] ).filter( m => !m.is_leader && m.status === 1 ).map( m => m.id ),
            team_locations_id : ( team.team_location_list || [] ).filter( l => l.status === 1 ).map( l => l.id ),
            team_equipment_nodes_id : ( team.team_equipment_node_list || [] ).filter( e => e.status === 1 ).map( e => e.id )
          }
        ]
      } )
    )
  } catch ( err ) {
    console.error( 'Failed to load team options and map:', err )
    ElMessage.error( t( 'team.message.fetchFailed' ) )
  } finally {
    loading.value = false
  }
}

async function refreshTeamsData() {
  await loadTeamOptionsAndTeamMap()
  await loadFullTeamTree()
  teamTree.value = fillTeamTreeWithTeamMapAndLevel( teamTree.value )
  matchedTeamIds.value.clear()

  if ( isFilterEmpty() ) {
    teamsTableData.value = teamTree.value
  } else {
    // Apply filtering on full tree
    await filterFullTreeAndLoadPartialTreeAndSetTeamTable()
  }
}

async function clearLocalFilters() {
  Object.assign( localFilters, initialFilters )
  matchedTeamIds.value.clear()

  await refreshTeamsData()
}

async function loadUsers() {
  // Fetch fixed number of users assuming all user count are less than 1000.
  try {
    const response = await searchUsers( { status_ids : [1] }, 1, 1000 )
    userOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
  }
}

async function loadShifts() {
  try {
    const response = await searchShifts( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    shiftOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load shifts:', err )
    ElMessage.error( 'Error loading shift data' )
  }
}

async function loadLocations() {
  // Fetch fixed number of locations assuming all location count are less than 1000.
  try {
    const response = await searchLocations( { status_ids : [1] }, 1, 1000 )
    const locations = response?.data?.content || []

    locationMap.value = Object.fromEntries( locations.map( location => [String( location.id ), location] ) )
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
  }
}

async function loadEquipments() {
  try {
    const response = await searchEquipmentNodes( { status_ids : [1] }, 1, 1000 )
    const equipments = response?.data?.content || []

    equipmentMap.value = Object.fromEntries( equipments.map( e => [String( e.id ), { ...e }] ) )
  } catch ( err ) {
    console.error( 'Failed to load equipments:', err )
    ElMessage.error( t( 'common.message.errorLoadingEquipmentData' ) )
  }
}

async function refreshAllData() {
  try {
    loading.value = true

    await loadShifts()
    await loadLocations()
    await loadEquipments()
    await loadUsers()
    await refreshTeamsData()
  } catch ( e ) {
  } finally {
    loading.value = false
  }
}

async function handleDelete( id ) {
  try {
    await ElMessageBox.confirm( t( 'common.confirmMessage' ), t( 'common.warning' ), {
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      type : 'warning',
      distinguishCancelAndClose : true
    } )

    await deactivateTeam( id )
    await refreshTeamsData()
    ElMessage.success( t( 'teamDeletedSuccess' ) )
  } catch ( err ) {
    if ( err === 'cancel' || err === 'close' ) {
      return
    }

    console.error( err )
    ElMessage.error( t( 'teamDeletedFailed' ) )
  }
}

function indentCellStyle( { column, row } ) {
  if ( column.property === 'actions' || column.label === t( 'common.actions' ) ) {
    return {}
  }
  const depth = ( row.level || 1 ) - 1
  return { paddingLeft : `${depth * 16}px` }
}

function getRowClassName( { row } ) {
  return matchedTeamIds.value.has( row.id ) ? 'matched-row' : ''
}

// User select label formatter
const formatUserLabel = user => {
  // const roles = user.role_list?.map( r => r.name ).join( ' | ' ) || '-'
  // return `${user.first_name} ${user.last_name} ${roles}`
  return `${user.first_name} ${user.last_name}`
}

// Watch for changes in location or equipment filters and reload
watch(
  () => [localFilters.location_ids, localFilters.equipment_node_ids],
  () => {
    refreshTeamsData()
  },
  { deep : true }
)

onMounted( async() => {
  await refreshAllData()
} )
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  .filters-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-item {
    display: flex;
    align-items: center;
  }

  .actions-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.ellipsis-text {
  display: inline-block;
  max-width: 360px; /* slightly smaller than column width */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

:deep(.el-table__row.matched-row) {
  background-color: #ecf5ff !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 14px !important;
}

:deep(.el-scrollbar__thumb.is-horizontal) {
  height: 14px !important;
}
</style>
