<script setup>
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { getDepartmentById } from '@/api/department'

const props = defineProps({
  // Passed in object will display using the object
  department: {
    type: Object,
    default: null,
  },
  departmentId: {
    // Passed in id will fetch internally
    type: Number,
    default: null,
  },
})

const { t } = useI18n()
const resolvedDepartment = ref(props.department)

// Fetch department info if departmentId is passed
async function fetchDepartment(id) {
  if (!id) return
  try {
    const res = await getDepartmentById(id)
    resolvedDepartment.value = res.data || null
  } catch (err) {
    console.error('Failed to fetch department by id:', err)
    resolvedDepartment.value = null
  }
}

watch(
  () => props.departmentId,
  newId => {
    if (newId) {
      fetchDepartment(newId)
    } else {
      resolvedDepartment.value = props.department
    }
  },
  { immediate: true }
)

// If only department object is passed, keep it
watch(
  () => props.department,
  newDept => {
    if (!props.departmentId) {
      resolvedDepartment.value = newDept
    }
  }
)
</script>

<template>
  <!-- Unknown department -->
  <span v-if="!resolvedDepartment">
    <el-tag size="small" type="info" effect="light">
      {{ t('department.unknownDepartment') }}
    </el-tag>
  </span>

  <el-popover v-else effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>
        <el-text>{{ 'ID' }}: {{ resolvedDepartment.id }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.name') }}: {{ resolvedDepartment.name }}</el-text>
      </div>
      <div>
        <el-text>{{ t('common.code') }}: {{ resolvedDepartment.code }}</el-text>
      </div>

      <div>
        <el-text>{{ 'Manager' }}: {{ resolvedDepartment.manager_id }}</el-text>
      </div>

      <div>
        <el-text>{{ 'Associated Member Count' }}: {{ resolvedDepartment.members.length }}</el-text>
      </div>

      <div>
        <el-text>{{ 'Associated Location' }}: {{ resolvedDepartment.location_id }}</el-text>
      </div>

      <div>
        <el-text>{{ 'Associated Role Count' }}: {{ resolvedDepartment.role_list.length }}</el-text>
      </div>
    </template>

    <template #reference>
      <el-tag :type="'primary'" size="small" effect="light">
        {{ resolvedDepartment.name }}
      </el-tag>
    </template>
  </el-popover>
</template>

<style scoped></style>
