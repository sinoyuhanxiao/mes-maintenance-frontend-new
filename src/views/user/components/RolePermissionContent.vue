<template>
  <div class="permission-content">
    <el-text size="large">
      {{ props.role.name }}
    </el-text>

    <el-table :data="filteredRows" border style="width: 100%; margin-top: 12px" v-if="filteredRows.length">
      <el-table-column prop="featureLabel" label="Feature" min-width="200" />

      <el-table-column v-if="visibleColumns.visibility" label="Visibility" align="center" width="110">
        <template #default="{ row }">
          <el-checkbox :model-value="row.visibility" disabled />
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumns.create" label="Create" align="center" width="100">
        <template #default="{ row }">
          <el-checkbox :model-value="row.create" disabled />
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumns.edit" label="Edit" align="center" width="100">
        <template #default="{ row }">
          <el-checkbox :model-value="row.edit" disabled />
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumns.delete" label="Delete" align="center" width="100">
        <template #default="{ row }">
          <el-checkbox :model-value="row.delete" disabled />
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumns.cancel" label="Cancel" align="center" width="100">
        <template #default="{ row }">
          <el-checkbox :model-value="row.cancel" disabled />
        </template>
      </el-table-column>

      <el-table-column v-if="visibleColumns.execute" label="Execute" align="center" width="110">
        <template #default="{ row }">
          <el-checkbox :model-value="row.execute" disabled />
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="No visible permissions for this role" :image-size="120" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Props
 * role.permissions: Array<{ id: number|string, name: string, key: string }>
 * Examples of key values:
 *   'MAINTENANCE_CREATE_WORKORDER'
 *   'MAINTENANCE_VIEW_WORKORDER'
 *   'TASKTEMPLATE_EDIT'
 *   'EQUIPMENT_DELETE'
 *   'SPAREPART_VIEW'
 */
const props = defineProps({
  role: { type: Object, required: true },
})

/** Map feature key fragments -> canonical key + label for display */
const FEATURE_MAP = {
  WORKORDER: { feature: 'work_order', label: 'Work Order' },
  TASKTEMPLATE: { feature: 'task_template', label: 'Task Template' },
  EQUIPMENT: { feature: 'equipment', label: 'Equipment' },
  SPAREPART: { feature: 'spare_parts', label: 'Spare Parts' },
  REQUEST: { feature: 'request', label: 'Request' },
  USER: { feature: 'user', label: 'User' },
  VENDOR: { feature: 'vendor', label: 'Vendor' },
  LOCATION: { feature: 'location', label: 'Location' },
}

/** Map action tokens in the key -> table boolean fields */
const ACTION_MAP = {
  VIEW: 'visibility',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  CANCEL: 'cancel',
  EXECUTE: 'execute',
}

/** Try to extract { featureKey, actionKey } from a permission.key string */
function parseKey(rawKey = '') {
  const key = String(rawKey).toUpperCase()

  // find action first
  const actionToken = Object.keys(ACTION_MAP).find(
    t => key.includes(`_${t}_`) || key.endsWith(`_${t}`) || key.startsWith(`${t}_`)
  )
  const action = actionToken ? ACTION_MAP[actionToken] : null

  // find feature token by scanning known fragments
  const featureToken = Object.keys(FEATURE_MAP).find(ft => key.includes(ft))
  const featureInfo = featureToken ? FEATURE_MAP[featureToken] : null

  return {
    feature: featureInfo?.feature || null,
    featureLabel: featureInfo?.label || null,
    action,
  }
}

/** Build a matrix grouped by feature with booleans for each action column */
const rows = computed(() => {
  const list = Array.isArray(props.role?.permissions) ? props.role.permissions : []
  const matrix = new Map()

  list.forEach(p => {
    const { feature, featureLabel, action } = parseKey(p?.key)
    if (!feature || !action) return

    if (!matrix.has(feature)) {
      matrix.set(feature, {
        feature,
        featureLabel: featureLabel || feature,
        visibility: false,
        create: false,
        edit: false,
        delete: false,
        cancel: false,
        execute: false,
      })
    }
    matrix.get(feature)[action] = true
  })

  return Array.from(matrix.values())
})

/** Hide rows where all actions are false */
const filteredRows = computed(() =>
  rows.value.filter(r => r.visibility || r.create || r.edit || r.delete || r.cancel || r.execute)
)

/** Auto-hide columns that are entirely false across all rows */
const visibleColumns = computed(() => {
  const agg = {
    visibility: false,
    create: false,
    edit: false,
    delete: false,
    cancel: false,
    execute: false,
  }
  filteredRows.value.forEach(r => {
    Object.keys(agg).forEach(k => {
      agg[k] ||= !!r[k]
    })
  })
  return agg
})
</script>

<style scoped>
.permission-content {
  display: flex;
  flex-direction: column;
}
</style>
