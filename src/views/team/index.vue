<template>
  <MesLayout :title="'Team Management'" :view-mode="'table'">
    <!--    <template #viewMode>-->
    <!--      <div class="toolbar">-->
    <!--        <div class="right-group">-->
    <!--          <div>-->
    <!--            <el-input-->
    <!--              v-model="searchInput"-->
    <!--              :placeholder="t('common.searchByKeyword')"-->
    <!--              clearable-->
    <!--              @input="searchTeams"-->
    <!--              style="width: 280px"-->
    <!--            >-->
    <!--              <template #prefix>-->
    <!--                <el-icon><Search /></el-icon>-->
    <!--              </template>-->
    <!--            </el-input>-->
    <!--          </div>-->
    <!--          <div class="actions-row">-->
    <!--            <el-button type="primary" @click="openCreateForm">{{ t('team.button.addTeam') }}</el-button>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </template>-->

    <template #body>
      <el-text>
        {{ 'WORK IN PROGRESS' }}
      </el-text>
      <!--      <el-table-->
      <!--        v-loading="loading"-->
      <!--        :data="paginatedTeams"-->
      <!--        style="width: 100%"-->
      <!--        border-->
      <!--        fit-->
      <!--        highlight-current-row-->
      <!--        :height="tableHeight"-->
      <!--        :empty-text="t('common.noData')"-->
      <!--        @sort-change="val => (sortSettings = val)"-->
      <!--      >-->
      <!--        <el-table-column prop="id" :label="t('team.table.id')" width="100" sortable />-->
      <!--        <el-table-column prop="team_name" :label="t('team.table.name')" sortable />-->
      <!--        <el-table-column prop="leader_name" :label="t('team.table.leader')" sortable />-->
      <!--        <el-table-column prop="members" :label="t('team.table.leader')" sortable />-->
      <!--        <el-table-column prop="leader_name" :label="t('team.table.leader')" sortable />-->
      <!--        <el-table-column prop="parent_team_id" :label="t('team.table.parentTeam')">-->
      <!--          <template #default="scope">-->
      <!--            <span>{{ getTeamNameById(scope.row.parent_team_id) }}</span>-->
      <!--          </template>-->
      <!--        </el-table-column>-->
      <!--        <el-table-column :label="t('team.table.actions')" align="right" width="160">-->
      <!--          <template #default="scope">-->
      <!--            <el-button size="small" @click="handleEdit(scope.row)">{{ t('common.edit') }}</el-button>-->
      <!--            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">{{-->
      <!--              t('common.delete')-->
      <!--            }}</el-button>-->
      <!--          </template>-->
      <!--        </el-table-column>-->
      <!--      </el-table>-->

      <!--      <el-dialog-->
      <!--        :title="teamEntry.id == null ? t('team.form.newTeam') : t('team.form.editTeam')"-->
      <!--        v-model="isDialogVisible"-->
      <!--        width="40%"-->
      <!--      >-->
      <!--        <el-form ref="teamFormRef" :model="teamEntry" :rules="teamFormRules" label-width="120px">-->
      <!--          <el-form-item prop="team_name" :label="t('team.form.name')">-->
      <!--            <el-input v-model="teamEntry.team_name" />-->
      <!--          </el-form-item>-->
      <!--          <el-form-item prop="leader_name" :label="t('team.form.leader')">-->
      <!--            <el-input v-model="teamEntry.leader_name" />-->
      <!--          </el-form-item>-->
      <!--          <el-form-item prop="parent_team_id" :label="t('team.form.parentTeam')">-->
      <!--            <el-select v-model="teamEntry.parent_team_id" clearable>-->
      <!--              <el-option-->
      <!--                v-for="team in teams.value"-->
      <!--                :key="team.id"-->
      <!--                :label="team.team_name"-->
      <!--                :value="team.id"-->
      <!--                :disabled="team.id === teamEntry.id"-->
      <!--              />-->
      <!--            </el-select>-->
      <!--          </el-form-item>-->
      <!--        </el-form>-->
      <!--        <template #footer>-->
      <!--          <div class="popup-container">-->
      <!--            <el-button @click="isDialogVisible = false">{{ t('common.cancel') }}</el-button>-->
      <!--            <el-button type="primary" @click="handleConfirmSubmit">{{ t('common.confirm') }}</el-button>-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </el-dialog>-->
    </template>

    <!--    <template #foot>-->
    <!--      <el-pagination-->
    <!--        v-if="shouldShowPagination"-->
    <!--        @current-change="handlePageChange"-->
    <!--        @size-change="handleSizeChange"-->
    <!--        :current-page="currentPage"-->
    <!--        :page-size="pageSize"-->
    <!--        :page-sizes="[10, 20, 50]"-->
    <!--        layout="total, sizes, prev, pager, next"-->
    <!--        :total="filteredTeams.length"-->
    <!--      />-->
    <!--    </template>-->
  </MesLayout>
</template>

<script setup>
// import { ref, computed, reactive, onMounted } from 'vue'
// import { useI18n } from 'vue-i18n'
import MesLayout from 'src/components/MesLayout'
// import { Search } from '@element-plus/icons-vue'
// import { ElMessage } from 'element-plus'
// import * as teamService from './components/teamService.js'
//
// const { t } = useI18n()
// const loading = ref( false )
// const isDialogVisible = ref( false )
// const searchInput = ref( '' )
// const teamFormRef = ref()
// const teams = teamService.useTeamList()
// const filteredTeams = ref( [] )
// const sortSettings = ref( { prop : '', order : '' } )
// const currentPage = ref( 1 )
// const pageSize = ref( 10 )
// const tableHeight = ref( window.innerHeight - 250 )
//
// const teamEntry = reactive( {
//   id : null,
//   team_name : '',
//   leader_name : '',
//   parent_team_id : null
// } )
//
// const teamFormRules = {
//   team_name : [{ required : true, message : t( 'team.validation.nameRequired' ), trigger : 'blur' }],
//   leader_name : [{ required : true, message : t( 'team.validation.leaderRequired' ), trigger : 'blur' }]
// }
//
// const paginatedTeams = computed( () => {
//   const sorted = [...filteredTeams.value].sort( ( a, b ) => {
//     const getVal = obj => sortSettings.value.prop?.split( '.' ).reduce( ( acc, key ) => acc?.[key], obj )
//     const va = getVal( a )
//     const vb = getVal( b )
//     if ( !sortSettings.value.order ) return 0
//     return sortSettings.value.order === 'ascending' ? ( va > vb ? 1 : -1 ) : vb > va ? 1 : -1
//   } )
//   return sorted.slice( ( currentPage.value - 1 ) * pageSize.value, currentPage.value * pageSize.value )
// } )
//
// const shouldShowPagination = computed( () => filteredTeams.value.length > 10 )
//
// function getTeamNameById( id ) {
//   return teams.value.find( team => team.id === id )?.team_name || '-'
// }
//
// function resetTeamEntry() {
//   Object.assign( teamEntry, {
//     id : null,
//     team_name : '',
//     leader_name : '',
//     parent_team_id : null
//   } )
// }
//
// function openCreateForm() {
//   teamFormRef.value?.resetFields()
//   resetTeamEntry()
//   isDialogVisible.value = true
// }
//
// function handleEdit( team ) {
//   teamFormRef.value?.resetFields()
//   Object.assign( teamEntry, { ...team } )
//   isDialogVisible.value = true
// }
//
// async function handleConfirmSubmit() {
//   try {
//     await teamFormRef.value.validate()
//     if ( teamEntry.id != null ) {
//       await teamService.updateTeam( teamEntry.id, { ...teamEntry } )
//       ElMessage.success( t( 'team.message.updated' ) )
//     } else {
//       await teamService.createTeam( { ...teamEntry } )
//       ElMessage.success( t( 'team.message.created' ) )
//     }
//     filteredTeams.value = await teamService.getTeams()
//     isDialogVisible.value = false
//   } catch ( err ) {
//     console.error( err )
//     ElMessage.error( t( 'team.message.failed' ) )
//   }
// }
//
// async function handleDelete( id ) {
//   await teamService.deleteTeam( id )
//   filteredTeams.value = await teamService.getTeams()
//   ElMessage.success( t( 'team.message.deleted' ) )
// }
//
// function searchTeams() {
//   const keyword = searchInput.value.toLowerCase()
//   filteredTeams.value = teams.value.filter(
//     t => t.team_name.toLowerCase().includes( keyword ) || t.leader_name?.toLowerCase().includes( keyword )
//   )
//   currentPage.value = 1
// }
//
// function handlePageChange( val ) {
//   currentPage.value = val
// }
//
// function handleSizeChange( val ) {
//   pageSize.value = val
// }
//
// onMounted( async() => {
//   filteredTeams.value = await teamService.getTeams()
// } )
</script>

<style scoped>
.toolbar {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
}
.actions-row {
  display: flex;
  gap: 8px;
}
.popup-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
