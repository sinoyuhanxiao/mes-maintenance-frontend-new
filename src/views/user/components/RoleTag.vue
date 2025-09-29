<template>
  <!--  <el-popover placement="top-start" :width="550">-->
  <!--    <template #default>-->
  <!--      <div class="permissions-container">-->
  <!--        <div class="permissions-header">-->
  <!--          <el-text>Permissions:</el-text>-->
  <!--        </div>-->

  <!--        <div v-if="groupedPermissions.length" class="permissions-groups">-->
  <!--          <div v-for="grp in groupedPermissions" :key="grp.group" class="permission-group">-->
  <!--            <div class="group-name">-->
  <!--              <el-text tag="b">{{ grp.group }}</el-text>-->
  <!--            </div>-->

  <!--            <div class="group-actions">-->
  <!--              <div v-for="act in grp.actions" :key="act.id">-->
  <!--                <el-icon class="success-icon" style="margin-right: 3px">-->
  <!--                  <CircleCheck />-->
  <!--                </el-icon>-->
  <!--                <span>{{ act }}</span>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </div>-->

  <!--        <div v-else class="no-permissions">-->
  <!--          <el-text type="info">No permissions</el-text>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </template>-->
  <!--  </el-popover>-->

  <!-- Unknown role -->
  <span v-if="!role">
    <el-tag size="small" type="info" effect="light">
      {{ 'Unknown Role' }}
    </el-tag>
  </span>

  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>
        <el-text>{{ 'ID' }}: {{ role.id }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.name') }}: {{ role.name }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.description') }}: {{ role.description }}</el-text>
      </div>
      <div>
        <el-text>{{ 'Permission List' }}: {{ role.permission_list?.length || '-' }}</el-text>
      </div>
      <div>
        <el-text>{{ 'Associated Department List' }}:
          <template v-if="role.department_list && role.department_list?.length">
            {{ role.department_list.map(dep => dep.name).join(', ') }}
          </template>
          <template v-else>
            -
          </template>
        </el-text>
      </div>
    </template>

    <template #reference>
      <el-tag :type="'primary'" size="small" effect="light">
        {{ role.name }}
      </el-tag>
    </template>
  </el-popover>
</template>

<script setup>
// import { computed } from 'vue'
// import { CircleCheck } from '@element-plus/icons-vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps( {
  role : {
    type : Object,
    default : null
  }
} )

// // keep a consistent action order in the UI
// const ACTION_ORDER = ['View', 'Create', 'Edit', 'Delete', 'Execute', 'Cancel', 'Approve']
// // detect action at the beginning of permission name
// const ACTION_RE = /^(Create|Edit|View|Delete|Execute|Cancel|Approve)\s+/i
// // optional label normalization
// const GROUP_LABEL_ALIAS = {
//   'Spare Part' : 'Spare Parts'
// }

// const groupedPermissions = computed( () => {
//   const perms = props.role?.permissions || []
//   const map = new Map()
//
//   perms.forEach( p => {
//     const name = p?.name || ''
//     const m = name.match( ACTION_RE )
//     if ( !m ) return
//     const action = capitalize( m[1] )
//     const rawGroup = name.replace( ACTION_RE, '' ).trim() || 'General'
//     const group = GROUP_LABEL_ALIAS[rawGroup] || rawGroup
//
//     if ( !map.has( group ) ) {
//       map.set( group, new Set() )
//     }
//     map.get( group ).add( action )
//   } )
//
//   // turn into sorted array
//   const arr = Array.from( map.entries() ).map( ( [group, actionSet] ) => ( {
//     group,
//     actions : ACTION_ORDER.filter( a => actionSet.has( a ) )
//   } ) )
//
//   // optional: stable group order (work order first, etc.)
//   const FEATURE_ORDER = [
//     'Maintenance Work Order',
//     'Task Template',
//     'Equipment',
//     'Spare Parts',
//     'Request',
//     'User',
//     'Vendor',
//     'Location',
//     'General'
//   ]
//   const orderOf = g => {
//     const i = FEATURE_ORDER.indexOf( g )
//     return i === -1 ? Number.MAX_SAFE_INTEGER : i
//   }
//   arr.sort( ( a, b ) => orderOf( a.group ) - orderOf( b.group ) || a.group.localeCompare( b.group ) )
//
//   return arr
// } )

// function capitalize( s ) {
//   return s ? s.charAt( 0 ).toUpperCase() + s.slice( 1 ).toLowerCase() : s
// }
</script>

<style scoped>
.role-tag {
  font-weight: bold;
  cursor: pointer;
}

.permissions-container {
  min-width: 260px;
  padding: 8px;
}

.permissions-header {
  margin-bottom: 8px;
}

.permissions-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.permission-group {
  display: grid;
  grid-template-columns: 180px 1fr; /* left: group label, right: actions */
  align-items: center;
  gap: 6px 12px;
}

.group-name {
  line-height: 22px;
}

.group-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.success-icon {
  color: var(--el-color-success);
}

.no-permissions {
  color: var(--el-text-color-secondary);
  font-style: italic;
}
</style>
