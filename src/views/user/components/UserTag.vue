<template>
  <!-- Unknown user -->
  <span v-if="!user">
    <el-tag size="small" type="info" effect="light">
      {{ t('user.unknownUser') }}
    </el-tag>
  </span>

  <!-- User with info -->
  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>
        <el-text>{{ t('user.table.id') }}: {{ user.id }}</el-text>
      </div>
      <div>
        <el-text>{{ t('user.table.name') }}: {{ fullName }}</el-text>
      </div>
      <div v-if="user.roles?.length">
        <el-text>{{ t('user.table.role') }}:</el-text>
        <ul class="role-list">
          <li v-for="role in user.roles" :key="role.id">• {{ role.name }}</li>
        </ul>
      </div>
      <div v-if="user.email">
        <el-text>{{ t('user.table.email') }}: {{ user.email }}</el-text>
      </div>
      <div v-if="user.phone_number">
        <el-text>{{ t('user.table.phoneNumber') }}: {{ user.phone_number }}</el-text>
      </div>
      <div v-if="user.teams?.length">
        <el-text>{{ t('user.assignedTeam') }}:</el-text>
        {{ user.teams.map(team => team.team_name).join(', ') }}
      </div>
      <div>
        <el-text>{{ 'Status' }}: {{ user.status }}</el-text>
      </div>
    </template>

    <template #reference>
      <el-tag :type="'primary'" size="small" effect="light">
        {{ fullName }}
      </el-tag>
    </template>
  </el-popover>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps( {
  user : {
    type : Object,
    default : null
  }
} )

const fullName = computed( () =>
  props.user ? `${props.user.first_name} ${props.user.last_name}` : t( 'user.unknownUser' )
)
</script>

<style scoped>
.role-list{
  padding-left: 10px;
}
</style>
