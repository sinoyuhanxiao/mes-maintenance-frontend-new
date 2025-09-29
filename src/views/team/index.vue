<template>
  <MesLayout :title="t('team.teamManagement')" :view-mode="'table'">
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
              :max-collapse-tags="2"
              filterable
              size="default"
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.first_name + ' ' + user.last_name"
                :value="user.id"
              />
            </el-select>
          </div>

          <div class="filter-item">
            <el-select
              v-model="localFilters.department_ids"
              :placeholder="t('common.filterByDepartmentPlaceholder')"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="default"
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option v-for="d in departmentOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <LocationTreeSelect v-model="localFilters.location_ids" />
          </div>

          <div class="filter-item">
            <EquipmentTreeSelect v-model="localFilters.equipment_node_ids" />
          </div>

          <div class="filter-item">
            <el-button :icon="Remove" type="warning" plain @click="clearLocalFilters">
              {{ t('workOrder.filters.clearAll') }}
            </el-button>
          </div>
        </div>

        <div class="actions-row">
          <div class="actions-item">
            <el-input
              v-model="localFilters.keyword"
              :placeholder="t('user.searchByName')"
              clearable
              @input="handleFilterChange"
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
        </div>
      </div>
    </template>

    <template #body>
      <el-table
        v-loading="loading"
        :data="teamsTableData"
        style="width: 100%"
        border
        fit
        highlight-current-row
        :height="tableHeight"
        :empty-text="t('common.noData')"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" :label="'ID'" width="100" sortable="custom" align="center" fixed="left" />

        <el-table-column prop="name" :label="t('team.name')" width="220" sortable="custom" align="center" fixed="left">
          <template #default="scope">
            <el-text tag="b">{{ scope.row.name }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="leader_id" :label="t('team.leader')" width="180" align="center">
          <template #default="scope">
            <template v-if="scope.row.leader_id?.length > 0">
              <UserTag
                v-if="userMap[scope.row.leader_id]"
                :user="userMap[scope.row.leader_id]"
                :department-options="departmentOptions"
                style="margin: 2px"
              />
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="team_members_id" :label="t('team.members')" align="center" width="200">
          <template #default="scope">
            <template v-if="scope.row.team_members_id && scope.row.team_members_id.length">
              <!--              <el-popover trigger="click" placement="top" width="300">-->
              <!--                <template #reference>-->
              <!--                  <el-button :type="'info'" plain :size="'small'">-->
              <!--                    {{ scope.row.team_members_id.length }}-->
              <!--                    {{ scope.row.team_members_id.length === 1 ? 'member' : 'members' }}-->
              <!--                  </el-button>-->
              <!--                </template>-->

              <!--                <div class="tag-list">-->
              <!--                  <UserTag v-for="id in scope.row.team_members_id" :key="id" :user="userMap[id]" :department-options="departmentOptions" />-->
              <!--                </div>-->
              <!--              </el-popover>-->

              <TagPopover
                :items="scope.row.team_members_id"
                singular-label="member"
                plural-label="members"
                :search-key="userId => (userMap[userId]?.first_name || '') + ' ' + (userMap[userId]?.last_name || '')"
                :item-key="m => m"
              >
                <template #default="{ item }">
                  <UserTag :user="userMap[item]" :department-options="departmentOptions" />
                </template>
              </TagPopover>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="team_locations_id" :label="t('team.assignedLocation')" align="center" width="200">
          <template #default="scope">
            <template v-if="scope.row.team_locations_id && scope.row.team_locations_id.length">
              <TagPopover
                :items="scope.row.team_locations_id"
                singular-label="location"
                plural-label="locations"
                :search-key="lid => locationMap[String(lid)]?.name || ''"
                :item-key="lid => lid"
              >
                <template #default="{ item }">
                  <LocationTag :location="locationMap[String(item)] || null" />
                </template>
              </TagPopover>
              <!--              <el-popover trigger="click" placement="top" width="300">-->
              <!--                <template #reference>-->
              <!--                  <el-button :type="'info'" plain :size="'small'">-->
              <!--                    {{ scope.row.team_locations_id.length }}-->
              <!--                    {{ scope.row.team_locations_id.length === 1 ? 'location' : 'locations' }}-->
              <!--                  </el-button>-->
              <!--                </template>-->

              <!--                <div class="tag-list">-->
              <!--                  <LocationTag-->
              <!--                    v-for="id in scope.row.team_locations_id"-->
              <!--                    :key="id"-->
              <!--                    :location="locationMap[String(id)] || null"-->
              <!--                  />-->
              <!--                </div>-->
              <!--              </el-popover>-->
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="team_equipment_nodes_id" :label="t('team.assignedEquipment')" align="center" width="200">
          <template #default="scope">
            <template v-if="scope.row.team_equipment_nodes_id && scope.row.team_equipment_nodes_id.length">
              <TagPopover
                :items="scope.row.team_equipment_nodes_id"
                singular-label="equipment"
                plural-label="equipments"
                :search-key="eid => equipmentMap[String(eid)]?.name || ''"
                :item-key="eid => eid"
              >
                <template #default="{ item }">
                  <EquipmentTag :equipment="equipmentMap[String(item)] || null" />
                </template>
              </TagPopover>

              <!--              <el-popover trigger="click" placement="top" width="300">-->
              <!--                <template #reference>-->
              <!--                  <el-button :type="'info'" plain :size="'small'">-->
              <!--                    {{ scope.row.team_equipment_nodes_id.length }}-->
              <!--                    {{ scope.row.team_equipment_nodes_id.length === 1 ? 'equipment' : 'equipments' }}-->
              <!--                  </el-button>-->
              <!--                </template>-->

              <!--                <div class="tag-list">-->
              <!--                  <EquipmentTag-->
              <!--                    v-for="id in scope.row.team_equipment_nodes_id"-->
              <!--                    :key="id"-->
              <!--                    :equipment="equipmentMap[String(id)] || null"-->
              <!--                  />-->
              <!--                </div>-->
              <!--              </el-popover>-->
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column :label="t('user.department')" prop="department" width="250" align="center">
          <template #default="scope">
            <template v-if="scope.row.department">
              <DepartmentTag :department="scope.row.department" />
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="code" :label="t('team.code')" width="150" sortable="custom" align="center" />

        <el-table-column
          prop="description"
          :label="t('common.description')"
          width="400"
          sortable="custom"
          align="center"
        />

        <el-table-column :label="t('common.actions')" fixed="right" align="center" header-align="center" width="200">
          <template #default="scope">
            <el-button :icon="Edit" type="primary" size="small" @click="handleEdit(scope.row)">{{
              t('common.edit')
            }}</el-button>
            <el-button :icon="Delete" type="danger" size="small" @click="handleDelete(scope.row.id)">{{
              t('common.delete')
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="currentEditingTeam ? t('team.editTeam') : t('team.newTeam')"
        v-model="isDialogVisible"
        top="10vh"
        width="50%"
      >
        <div v-loading="isFormProcessing">
          <TeamForm
            :team="currentEditingTeam"
            :department-options="departmentOptions"
            :user-options="userOptions"
            @confirm="handleTeamSubmitted"
            @cancel="() => (isDialogVisible = false)"
            @update:loading="isFormProcessing = $event"
          />
        </div>
      </el-dialog>
    </template>

    <template #foot>
      <el-pagination
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="totalElements"
      />
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MesLayout from 'src/components/MesLayout'
import { Delete, Edit, EditPen, Remove, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchTeams, deactivateTeam } from '@/api/team.js'
import { searchUsers } from '@/api/user.js'
import { searchLocations } from '@/api/location'
import { searchEquipmentNodes } from '@/api/equipment'
import { searchDepartments } from '@/api/department'
import LocationTag from '@/views/team/components/LocationTag.vue'
import EquipmentTag from '@/views/team/components/EquipmentTag.vue'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import EquipmentTreeSelect from '@/views/team/components/EquipmentTreeSelect.vue'
import TeamForm from '@/views/team/components/TeamForm.vue'
import UserTag from '@/views/user/components/UserTag.vue'
import DepartmentTag from '@/views/department/components/DepartmentTag.vue'
import TagPopover from '@/views/team/components/TagPopover.vue'

const { t } = useI18n()
const loading = ref( false )
const isFormProcessing = ref( false )
const isDialogVisible = ref( false )
const teamsTableData = ref( [] )
const sortSettings = ref( { prop : 'id', order : 'descending' } )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const totalElements = ref( 0 )
const totalPages = ref( 0 )
const tableHeight = ref( window.innerHeight - 250 )
const userOptions = ref( [] )
const locationMap = ref( {} )
const equipmentMap = ref( {} )
const departmentOptions = ref( [] )
const currentEditingTeam = ref( null )
const initialFilters = {
  keyword : '',
  department_ids : [],
  location_ids : [],
  equipment_node_ids : [],
  member_ids : []
}

const localFilters = reactive( { ...initialFilters } )

const userMap = computed( () => {
  return Object.fromEntries( userOptions.value.map( user => [user.id, user] ) )
} )

function openCreateForm() {
  currentEditingTeam.value = null
  isDialogVisible.value = true
}

function handleEdit( team ) {
  currentEditingTeam.value = team
  isDialogVisible.value = true
}

function handleTeamSubmitted() {
  isDialogVisible.value = false
  loadTeams()
}

function handleFilterChange() {
  try {
    currentPage.value = 1

    loadTeams()
  } catch ( e ) {
    ElMessage.error( t( 'team.message.teamFetchFailed' ) )
  }
}

function clearLocalFilters() {
  Object.assign( localFilters, initialFilters )
  handleFilterChange()
}

function handlePageChange( val ) {
  currentPage.value = val
  loadTeams()
}

function handleSizeChange( val ) {
  pageSize.value = val
  currentPage.value = 1
  loadTeams()
}

function handleSortChange( { prop, order } ) {
  sortSettings.value = { prop, order }
  loadTeams()
}

async function loadTeams() {
  function snakeToCamel( str ) {
    return str.replace( /_([a-z])/g, ( _, char ) => char.toUpperCase() )
  }

  loading.value = true
  try {
    const sortKey = snakeToCamel( sortSettings.value.prop )

    const response = await searchTeams(
      localFilters,
      currentPage.value,
      pageSize.value,
      sortKey,
      sortSettings.value.order === 'ascending' ? 'ASC' : 'DESC'
    )

    const data = response.data
    const rawTeam = data.content || []

    // Clean location & equipment ids: only keep if they're still in the corresponding map (status 1)
    teamsTableData.value = rawTeam.map( team => {
      return {
        ...team,
        leader_id : team.team_member_list
          .filter( member => member.is_leader && member.status === 1 )
          .map( member => member.id ),
        team_members_id : team.team_member_list
          .filter( member => !member.is_leader && member.status === 1 )
          .map( member => member.id ),
        team_locations_id : ( team.team_location_list || [] )
          .filter( location => location.status === 1 )
          .map( location => location.id ),
        team_equipment_nodes_id : ( team.team_equipment_node_list || [] )
          .filter( equipment => equipment.status === 1 )
          .map( equipment => equipment.id )
      }
    } )

    totalPages.value = data.totalPages
    totalElements.value = data.totalElements
  } catch ( err ) {
    console.error( 'Failed to load teams:', err )
    ElMessage.error( t( 'team.message.fetchFailed' ) )
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
    await loadTeams()
    ElMessage.success( t( 'teamDeletedSuccess' ) )
  } catch ( err ) {
    if ( err === 'cancel' || err === 'close' ) {
      // User canceled — do nothing
      return
    }
    console.error( err )
    ElMessage.error( t( 'teamDeletedFailed' ) )
  }
}

async function loadUsers() {
  // Fetch fixed number of users assuming all user count are less than 1000.
  // TODO: Refactor later on, we could include user data in teams dto, or allow api to fetch all users
  try {
    const response = await searchUsers( { status_ids : [1] }, 1, 1000 )
    userOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load users:', err )
    ElMessage.error( t( 'user.message.errorLoadingUsersData' ) )
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

async function loadDepartments() {
  try {
    const response = await searchDepartments( {}, 1, 1000 )
    departmentOptions.value = response.data.content
  } catch ( e ) {
    ElMessage.error( e )
  }
}

// Watch for changes in location or equipment filters and reload
watch(
  () => [localFilters.location_ids, localFilters.equipment_node_ids],
  () => {
    handleFilterChange()
  },
  { deep : true }
)

onMounted( async() => {
  try {
    loading.value = true
    await loadDepartments()
    await loadLocations()
    await loadEquipments()
    await loadUsers()
    await loadTeams()
  } finally {
    loading.value = false
  }
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
