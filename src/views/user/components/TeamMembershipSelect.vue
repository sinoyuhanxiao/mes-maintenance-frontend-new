<template>
  <!-- TeamMembershipSelect.vue – multi-select -->
  <el-tree-select
    v-model="internal"
    :data="treeWithFlags"
    multiple
    show-checkbox
    check-strictly
    default-expand-all
    :placeholder="t('user.membershipTeamsPlaceholder')"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <!-- add leader name in option -->
    <template #default="{ data }">
      <span>{{ data.label }}</span>
      <span style="float: right; color: #999; font-size: 12px">
        {{ data.leader ? t('user.table.leader') + `: ${data.leader.name}` : '' }}
      </span>
    </template>

    <template #footer>
      <el-text>{{ assignTeamMembershipHintText(props.role) }}</el-text>
    </template>
  </el-tree-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps( {
  modelValue : Array,
  tree : Array,
  role : Number,
  parentMap : Object
} )

const emit = defineEmits( ['update:modelValue'] )

/* two-way binding wrapper ----------------------------------------- */
const internal = computed( {
  get : () => props.modelValue,
  set : v => emit( 'update:modelValue', v )
} )

/* 👉 tree with .disabled filled in */
const treeWithFlags = computed( () => markDisabled( props.tree, props.role, props.parentMap ) )

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
      case 1: // supervisor
      case 4:
        disabled = true
        break
      case 3:
        disabled = depth !== 1
        break
      case 2:
        disabled = false
        break
      default:
        disabled = false
    }

    // clone so we don’t mutate original
    const node = { ...n, disabled }

    if ( n.children?.length ) {
      node.children = markDisabled( n.children, role, parentMap )
    }

    return node
  } )
}

function assignTeamMembershipHintText( roleId ) {
  switch ( roleId ) {
    case 4:
      return t( 'user.managerAssignTeamMembershipHint' )
    case 1:
      return t( 'user.supervisorAssignTeamMembershipHint' )
    case 3:
      return t( 'user.teamLeadAssignTeamMembershipHint' )

    default:
      return t( 'user.workerAssignTeamMembershipHint' )
  }
}
</script>
