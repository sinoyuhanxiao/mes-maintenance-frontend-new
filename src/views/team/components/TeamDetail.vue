<template>
  <el-dialog v-model="visible" width="50%" top="10vh" destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">
          <span class="team-name">{{ team?.name }}</span>
          <span v-if="team?.id" class="team-id">#{{ team.id }}</span>
        </div>

        <el-button :icon="Edit" type="info" @click="emit('edit', team)"> Edit </el-button>
      </div>
    </template>

    <!-- Basic Info -->
    <!--    <el-descriptions :column="3" direction="vertical" size="default" class="general-details-descriptions">-->
    <!--      <el-descriptions-item label="Code" min-width="150px">-->
    <!--        {{ team?.code || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Parent Team" min-width="150px">-->
    <!--        <el-tag>-->
    <!--          {{ props.teamMap[team?.parent_id]?.name || '-' }}-->
    <!--        </el-tag>-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Approval Enabled" min-width="150px">-->
    <!--        <el-switch :model-value="team.type === 'department'" disabled />-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Description" :span="3">-->
    <!--        {{ team?.description || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Created At" min-width="150px">-->
    <!--        {{ formatAsLocalDateTimeString(team?.created_at) || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      <el-descriptions-item label="Updated At" min-width="150px">-->
    <!--        {{ formatAsLocalDateTimeString(team?.updated_at) || '-' }}-->
    <!--      </el-descriptions-item>-->

    <!--      &lt;!&ndash; Backend not supported for now &ndash;&gt;-->
    <!--      &lt;!&ndash;      <el-descriptions-item label="Assigned Shift">&ndash;&gt;-->
    <!--      &lt;!&ndash;        <el-tag type="info">&ndash;&gt;-->
    <!--      &lt;!&ndash;          {{ props.shiftMap[team?.shift_id]?.name || '-' }}&ndash;&gt;-->
    <!--      &lt;!&ndash;        </el-tag>&ndash;&gt;-->
    <!--      &lt;!&ndash;      </el-descriptions-item>&ndash;&gt;-->
    <!--    </el-descriptions>-->

    <!-- Tabs -->
    <el-tabs v-model="activeTab">
      <!-- Members -->
      <el-tab-pane label="Members" name="members">
        <div class="tab-toolbar">
          <el-input
            v-model="search.members"
            placeholder="Search by keyword"
            prefix-icon="Search"
            clearable
            class="toolbar-input"
          />
        </div>

        <el-table
          border
          :data="paginatedMembers"
          style="width: 100%"
          height="500"
          @sort-change="handleSortChange('members')"
        >
          <el-table-column label="Name" sortable="custom" min-width="250px" align="center" fixed="left">
            <template #default="scope">
              <span>
                <el-link @click="goToDetail(scope.row.id, 'user')">
                  {{ scope.row.first_name + ' ' + scope.row.last_name }}
                </el-link>
              </span>
              <el-tag style="margin-left: 5px" v-if="isLeader(scope.row.id)"> Leader </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="id" label="ID" sortable="custom" min-width="80px" align="center" fixed="left" />

          <el-table-column prop="image" label="Profile Picture" min-width="150px" align="center">
            <template #default="scope">
              <div class="profile-picture-cell">
                <!-- image URL missing -->
                <template v-if="!scope.row.image">
                  <el-text>
                    {{ '-' }}
                  </el-text>
                </template>

                <el-image
                  v-else
                  :src="scope.row.image"
                  fit="cover"
                  style="width: 30px; height: 30px; border-radius: 50%"
                  :preview-src-list="[scope.row.image]"
                  preview-teleported
                >
                  <template #error>
                    <el-text>
                      {{ '-' }}
                    </el-text>
                  </template>
                </el-image>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="role_list" label="Role" min-width="200px" align="center">
            <template #default="scope">
              <el-tag>
                {{ scope.row.role_list[0]?.role?.name || '-' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="Email" min-width="220px" align="center" />
          <el-table-column prop="phone_number" label="Phone" min-width="220px" align="center" />
          <el-table-column prop="username" label="Username" min-width="220px" align="center" />
          <el-table-column :label="'Certificates'" prop="certificate_list" min-width="220px" align="center">
            <template #default="scope">
              <certificate-hover-detail :certificates="scope.row.certificate_list || []" />
            </template>
          </el-table-column>
          <el-table-column prop="employee_number" label="Employee Number" min-width="200" align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.employee_number || '-' }}
              </el-text>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <!-- left spacer to balance flex -->
          <div class="pagination-spacer"></div>

          <!-- centered pagination -->
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :page-sizes="pageSizeOptions"
            v-model:page-size="pageSize"
            :total="filteredMembers.length"
            v-model:current-page="page.members"
          />

          <!-- right-aligned Close button -->
          <div class="dialog-footer">
            <el-button @click="visible = false">Close</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Equipment -->
      <el-tab-pane label="Equipment" name="equipment">
        <div class="tab-toolbar">
          <el-input
            v-model="search.equipment"
            placeholder="Search by keyword"
            prefix-icon="Search"
            clearable
            class="toolbar-input"
          />
        </div>

        <el-table
          :data="paginatedEquipment"
          style="width: 100%"
          height="500"
          @sort-change="handleSortChange('equipment')"
          border
        >
          <el-table-column label="Name" sortable="custom" min-width="250px" align="center" fixed="left">
            <template #default="scope">
              <span>
                <el-link @click="goToDetail(scope.row.id, 'equipment')">
                  {{ scope.row.name }}
                </el-link>
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="id" label="ID" align="center" sortable="custom" width="80" />
          <el-table-column prop="code" label="Code" align="center" min-width="50" sortable="custom" />
          <el-table-column prop="type" label="Type" align="center" min-width="100">
            <template #default="scope">
              {{ scope.row.node_type?.default_label }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <!-- left spacer to balance flex -->
          <div class="pagination-spacer"></div>

          <!-- centered pagination -->
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :page-sizes="pageSizeOptions"
            v-model:page-size="pageSize"
            :total="filteredEquipment.length"
            v-model:current-page="page.equipment"
          />

          <!-- right-aligned Close button -->
          <div class="dialog-footer">
            <el-button @click="visible = false">Close</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Locations -->
      <el-tab-pane label="Locations" name="locations">
        <div class="tab-toolbar">
          <el-input
            v-model="search.locations"
            placeholder="Search by keyword"
            prefix-icon="Search"
            clearable
            class="toolbar-input"
          />
        </div>

        <el-table
          :data="paginatedLocations"
          style="width: 100%"
          height="500"
          @sort-change="handleSortChange('locations')"
          border
        >
          <el-table-column prop="name" label="Name" sortable="custom" min-width="250px" align="center" />
          <el-table-column prop="id" label="ID" sortable="custom" min-width="80" align="center" />
          <el-table-column prop="image_list" label="Image" min-width="150" align="center">
            <template #default="scope">
              <div v-if="scope.row.image_list?.length > 0">
                <el-image
                  :src="scope.row.image_list[0]"
                  fit="cover"
                  :preview-src-list="scope.row.image_list"
                  class="location-image-preview"
                  :z-index="9999"
                  style="width: 100px; height: 100px"
                  preview-teleported
                />
              </div>
              <div v-else>
                {{ '-' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="Code" min-width="120" align="center" />
          <el-table-column prop="location_type" label="Location Type" min-width="150" align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.location_type?.name || '-' }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="Description" min-width="300" align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.description || '-' }}
              </el-text>
            </template>
          </el-table-column>

          <el-table-column prop="address" label="Address" min-width="250" align="center">
            <template #default="scope">
              <el-text>
                {{ scope.row.address || '-' }}
              </el-text>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <!-- left spacer to balance flex -->
          <div class="pagination-spacer"></div>

          <!-- centered pagination -->
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :page-sizes="pageSizeOptions"
            v-model:page-size="pageSize"
            :total="filteredLocations.length"
            v-model:current-page="page.locations"
          />

          <!-- right-aligned Close button -->
          <div class="dialog-footer">
            <el-button @click="visible = false">Close</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import CertificateHoverDetail from '@/views/user/components/CertificateHoverDetail.vue'
import { getEquipmentById } from '@/api/equipment'

const props = defineProps( {
  team : { type : Object, default : null },
  initialTab : { type : String, default : 'members' },
  modelValue : { type : Boolean, default : false },
  userMap : {
    type : Object,
    default : () => {}
  },
  locationMap : {
    type : Object,
    default : () => {}
  },
  shiftMap : {
    type : Object,
    default : () => {}
  },
  teamMap : {
    type : Object,
    default : () => {}
  }
} )

const router = useRouter()

const emit = defineEmits( ['update:modelValue', 'edit'] )
const visible = ref( props.modelValue )

// States
const activeTab = ref( props.initialTab )

const fetchedEquipment = ref( [] )
const loadingEquipment = ref( false )

const pageSize = ref( 10 )
const pageSizeOptions = [5, 10, 20, 50]

// Search terms and pagination states
const search = ref( { members : '', equipment : '', locations : '' } )
const page = ref( { members : 1, equipment : 1, locations : 1 } )
const sort = ref( {
  members : { prop : null, order : null },
  equipment : { prop : null, order : null },
  locations : { prop : null, order : null }
} )

watch(
  () => props.modelValue,
  v => ( visible.value = v )
)

watch( visible, v => emit( 'update:modelValue', v ) )

watch( visible, v => {
  if ( v ) {
    loadEquipmentNodes()
  }
} )

watch(
  () => props.initialTab,
  newVal => {
    if ( newVal && newVal !== activeTab.value ) {
      activeTab.value = newVal
    }
  }
)

watch(
  () => props.team,
  () => {
    loadEquipmentNodes()
  },
  { immediate : true }
)

// Map associated lists from team object =====
const mappedMembers = computed( () => {
  if ( !props.team ) return []
  const memberIds = props.team.team_members_id || []
  const leaderId = props.team.leader_id

  // Deduplicate IDs and ensure leader appears first
  const orderedIds = [...( leaderId ? [leaderId] : [] ), ...memberIds.filter( id => id !== leaderId )]

  return orderedIds.map( id => props.userMap[id] || props.userMap[String( id )] ).filter( Boolean )
} )

async function loadEquipmentNodes() {
  if ( !props.team ) {
    fetchedEquipment.value = []
    return
  }

  const ids = props.team.team_equipment_nodes_id || []
  if ( ids.length === 0 ) {
    fetchedEquipment.value = []
    return
  }

  loadingEquipment.value = true
  try {
    const requests = ids.map( id => getEquipmentById( id ) )
    const responses = await Promise.all( requests )

    fetchedEquipment.value = responses.map( r => r.data ).filter( Boolean )
  } catch ( err ) {
    console.error( 'Failed to fetch equipment nodes:', err )
    fetchedEquipment.value = []
  } finally {
    loadingEquipment.value = false
  }
}

const mappedEquipment = computed( () => fetchedEquipment.value )

const mappedLocations = computed( () => {
  if ( !props.team ) return []
  const ids = props.team.team_locations_id || []
  return ids.map( id => props.locationMap[id] || props.locationMap[String( id )] ).filter( Boolean )
} )

// Filtering
const filterData = ( list, q, fields ) => {
  if ( !list ) {
    return []
  }
  const keyword = q.trim().toLowerCase()
  if ( !keyword ) {
    return list
  }

  return list.filter( item =>
    fields.some( f => {
      if ( f === 'full_name' ) {
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase().trim()
        return fullName.includes( keyword )
      }

      return String( item[f] || '' )
        .toLowerCase()
        .includes( keyword )
    } )
  )
}

// Sorting
const sortData = ( list, { prop, order } ) => {
  if ( !prop || !order ) return list
  const sorted = [...list].sort( ( a, b ) => {
    const va = a[prop] ?? ''
    const vb = b[prop] ?? ''
    return order === 'ascending' ? String( va ).localeCompare( String( vb ) ) : String( vb ).localeCompare( String( va ) )
  } )
  return sorted
}

const handleSortChange = type =>
  ( { prop, order } ) => {
    sort.value[type] = { prop, order }
  }

// ===== Computed filtered lists =====
const filteredMembers = computed( () => {
  const f = filterData( mappedMembers.value, search.value.members, ['id', 'full_name', 'username', 'employee_number'] )
  return sortData( f, sort.value.members )
} )
const filteredEquipment = computed( () => {
  const f = filterData( mappedEquipment.value, search.value.equipment, ['id', 'name', 'code'] )
  return sortData( f, sort.value.equipment )
} )
const filteredLocations = computed( () => {
  const f = filterData( mappedLocations.value, search.value.locations, ['id', 'name', 'code'] )
  return sortData( f, sort.value.locations )
} )

// ===== Pagination slices =====
const paginate = ( list, p ) => {
  const start = ( p - 1 ) * pageSize.value
  return list.slice( start, start + pageSize.value )
}

const paginatedMembers = computed( () => paginate( filteredMembers.value, page.value.members ) )
const paginatedEquipment = computed( () => paginate( filteredEquipment.value, page.value.equipment ) )
const paginatedLocations = computed( () => paginate( filteredLocations.value, page.value.locations ) )

function isLeader( userId ) {
  if ( !props.team?.leader_id ) return false
  return Number( userId ) === Number( props.team.leader_id )
}

function goToDetail( id, type ) {
  if ( type === 'equipment' ) {
    router.push( { path : '/maintenance/equipment', query : { equipmentId : id }} )
  }

  if ( type === 'location' ) {
    // router.push( { name : 'LocationDetail', params : { id : id }} )
  }

  if ( type === 'user' ) {
    router.push( { name : 'UserDetail', params : { id }} )
  }
}
</script>

<style scoped lang="scss">
.tab-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;

  .toolbar-input {
    width: 280px;
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between; /* space for three zones */
  margin-top: 12px;
  width: 100%;
  position: relative;

  /* keep pagination centered visually */
  .el-pagination {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .pagination-spacer {
    width: 120px; /* roughly same width as button area, tweak as needed */
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    width: 120px; /* same as spacer to stay balanced */
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-right: 12px; /* right margin for the button */
}

.dialog-title {
  display: flex;
  align-items: baseline;
  gap: 8px;

  .team-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .team-id {
    font-size: 14px;
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.general-details-descriptions {
  :deep(.el-descriptions__label) {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  :deep(.el-descriptions__content) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}

.profile-picture-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
}

.image-slot-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}
</style>
