<template>
  <div class="team-select-container">
    <el-select
      v-model="selectedIds"
      :loading="isLoading"
      multiple
      filterable
      clearable
      :placeholder="t('user.form.selectTeamPlaceHolder')"
      style="width: 100%"
    >
      <el-option v-for="team in teamOptions" :key="team.id" :label="team.name" :value="team.id" />
    </el-select>

    <div v-if="selectedTeamObjs.length" class="selected-team-tag-container">
      <el-tag
        v-for="(team, index) in selectedTeamObjs"
        :key="index"
        class="selected-team-tag"
        :type="team.isLeader === true ? 'warning' : 'info'"
        @click="toggleLeader(team.id)"
      >
        {{ team.name }} - {{ team.isLeader ? 'Leader' : 'Member' }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { getAllTeams } from '@/views/team/components/teamService'

const { t } = useI18n()
const props = defineProps( {
  /**
   * v-model: array of { id: number | string, isLeader: boolean, name?: string }
   */
  modelValue : {
    type : Array,
    default : () => []
  }
} )

const emit = defineEmits( ['update:modelValue', 'selection-change'] )

// For tag display; auto-fills name once options load
const selectedTeamObjs = computed( () => {
  const map = new Map( teamOptions.value.map( o => [o.id, o] ) )
  return ( props.modelValue || [] ).map( t => ( {
    ...t,
    name : t.name ?? map.get( t.id )?.name ?? String( t.id )
  } ) )
} )

const teamOptions = ref( [] )
const isLoading = ref( false )

function toggleLeader( id ) {
  const next = ( props.modelValue || [] ).slice()
  const idx = next.findIndex( t => t.id === id )
  if ( idx !== -1 ) {
    next.splice( idx, 1, { ...next[idx], isLeader : !next[idx].isLeader } )
    emit( 'update:modelValue', next )
    emit( 'selection-change', next )
  }
}

// Bind <el-select> to a list of IDs, while v-model is an array of objects
const selectedIds = computed( {
  get() {
    return ( props.modelValue || [] ).map( t => t.id )
  },
  set( ids ) {
    // Preserve existing isLeader flags; default isLeader=false for new selections
    const prevMap = new Map( ( props.modelValue || [] ).map( t => [t.id, t] ) )
    const newArr = ids.map( id => {
      const prev = prevMap.get( id )
      const opt = teamOptions.value.find( o => o.id === id )
      return {
        id,
        isLeader : prev?.isLeader ?? false,
        name : prev?.name ?? opt?.name ?? String( id )
      }
    } )
    emit( 'update:modelValue', newArr )
    emit( 'selection-change', newArr )
  }
} )

async function fetchTeamsData() {
  // keep ids consistent

  isLoading.value = true

  try {
    const res = await getAllTeams()

    const payload = res?.data ?? res // { status, data } | Array
    const list = Array.isArray( payload )
      ? payload
      : Array.isArray( payload?.data )
        ? payload.data // ← your case
        : Array.isArray( payload?.content )
          ? payload.content
          : Array.isArray( res?.data?.data )
            ? res.data.data // extra safety
            : []

    teamOptions.value = list.map( t => ( { ...t } ) )
    console.log( res )
    if ( res?.data.status === 200 ) teamOptions.value = res.data?.data.content ?? []
  } finally {
    isLoading.value = false
  }
}

onMounted( async() => {
  await fetchTeamsData()
} )
</script>

<style scoped>
.team-select-container {
  width: 100%;
}

.selected-team-tag {
  margin-right: 10px;
  cursor: pointer;
  user-select: none;
}
</style>
