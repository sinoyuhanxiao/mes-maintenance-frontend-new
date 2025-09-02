<template>
  <!-- Unknown user tag -->
  <span v-if="!user">
    <el-tag size="small" type="info" effect="light">
      {{ t('user.unknownUser') }}
    </el-tag>
  </span>

  <!-- User tag with popover -->
  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div v-if="user.id">
        <el-text> {{ t('user.table.id') }}: {{ user.id }} </el-text>
      </div>
      <div v-if="user.name">
        <el-text> {{ t('user.table.name') }}: {{ user.name }} </el-text>
      </div>
      <div v-if="user.role">
        <el-text> {{ t('user.table.role') }}: {{ user.role }} </el-text>
      </div>
      <div v-if="user.email">
        <el-text> {{ t('user.table.email') }}: {{ user.email }} </el-text>
      </div>
      <div v-if="user.phone_number">
        <el-text> {{ t('user.table.phoneNumber') }}: {{ user.phone_number }} </el-text>
      </div>
      <div v-if="user.teams?.length">
        <el-text>{{ t('user.assignedTeam') }}:</el-text>
        {{ user.teams.map(team => team.team_name).join(', ') }}
      </div>
    </template>

    <template #reference>
      <el-tag :type="user.role?.el_tag_type || 'info'" size="small" effect="light">
        {{ user.name || t('user.unknownUser') }}
      </el-tag>
    </template>
  </el-popover>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps( {
  user : {
    type : Object,
    default : null
  }
} )
</script>
