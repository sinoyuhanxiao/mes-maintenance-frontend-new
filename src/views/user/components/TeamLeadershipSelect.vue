<template>
  <!-- TeamLeadershipSelect.vue – multi=FALSE but same API -->
  <el-tree-select
    v-model="local"
    :data="treeWithFlags"
    show-checkbox
    :multiple="false"
    check-strictly
    default-expand-all
    :placeholder="t('user.leadershipTeamsPlaceholder')"
    @update:modelValue="$emit('update:modelValue', local ? [local] : [])"
  >
    <!-- add leader name in option -->
    <template #default="{ data }">
      <span>{{ data.name }}</span>
      <span style="float: right; color: #999; font-size: 12px">
        {{ data.leader ? t('user.table.leader') + `: ${data.leader.name}` : '' }}
      </span>
    </template>

    <template #footer>
      <el-text>{{ assignTeamLeadershipHintText(props.role) }}</el-text>
    </template>
  </el-tree-select>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps( {
  modelValue : Array,
  tree : Array,
  role : Number,
  parentMap : Object
} )
defineEmits( ['update:modelValue'] )
const local = ref( props.modelValue[0] ?? null )

/* 👉 tree with .disabled filled in */
const treeWithFlags = computed( () => markDisabled( props.tree, props.role, props.parentMap ) )
watch(
  () => props.modelValue,
  v => {
    local.value = v[0] ?? null
  }
)

/** util – runs once whenever role OR the tree changes */
function markDisabled( nodes, role, parentMap ) {
  return nodes.map( n => {
    const depth = ( () => {
      let d = 1
      let p = parentMap[n.id]
      while ( p ) {
        d++
        p = parentMap[p]
      }
      return d
    } )()

    // decide once
    let disabled
    switch ( role ) {
      case 1:
        disabled = depth !== 1
        break // only tier-1
      case 3:
        disabled = depth < 2
        break // tier-2+
      default:
        disabled = true
        break // roles 2 & 4
    }

    // clone so we don’t mutate original
    const node = { ...n, disabled }

    if ( n.children?.length ) {
      node.children = markDisabled( n.children, role, parentMap )
    }

    return node
  } )
}

function assignTeamLeadershipHintText( roleId ) {
  switch ( roleId ) {
    case 4:
      return t( 'user.managerAssignTeamLeadershipHint' )
    case 1:
      return t( 'user.supervisorAssignTeamLeadershipHint' )
    case 3:
      return t( 'user.teamLeadAssignTeamLeadershipHint' )
    default:
      return t( 'user.workerAssignTeamLeadershipHint' )
  }
}
</script>
