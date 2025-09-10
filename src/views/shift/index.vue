<template>
  <MesLayout :title="t('router.shiftManagement')" :view-mode="'table'">
    <template #head>
      <!-- Header tool bar -->
      <div class="toolbar">
        <div class="actions-row">
          <div class="actions-item">
            <!-- Search Box -->
            <el-input v-model="searchQuery" :placeholder="t('common.searchByKeyword')" clearable style="width: 280px">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- Refresh & Add Button -->
          <div class="actions-item">
            <el-button class="refresh-button" type="primary" circle @click="handleRefreshButton">
              <el-icon style="color: white">
                <RefreshRight />
              </el-icon>
            </el-button>

            <el-button type="primary" @click="openDialog()">
              {{ t('shift.createShift') }}
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div style="display: flex; flex-direction: column; max-width: 100%">
        <!-- Shift List -->
        <ShiftList
          :loading="loading"
          :shifts="shifts"
          @edit-shift="openDialog"
          @delete-shift="confirmDelete"
          :search-input="searchQuery"
          :user-map="userMap"
        />

        <!-- Dialog for Create/Edit -->
        <el-dialog
          v-model="dialogVisible"
          :title="isEditMode ? t('shift.editShift') : t('shift.createShift')"
          :close-on-click-modal="false"
        >
          <ShiftForm
            ref="shiftFormComp"
            :shift="shiftForm"
            :is-edit-mode="isEditMode"
            @submit="submitForm"
            @cancel="dialogVisible = false"
          />
        </el-dialog>
      </div>
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { formatDateObjectToOffsetTime } from '@/utils/datetime.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { createShift, deleteShift, getAllShifts, updateShift } from '@/api/shift'
import ShiftList from '@/views/shift/components/shiftList.vue'
import ShiftForm from '@/views/shift/components/shiftForm.vue'
import { useI18n } from 'vue-i18n'
import MesLayout from '@/components/MesLayout/src/index.vue'
import { getAllUsers } from '@/api/user'

const { t } = useI18n()

/** Refs/State */
const loading = ref(false)
const shifts = ref([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const isEditMode = ref(false)
const shiftFormComp = ref(null)

const shiftForm = reactive({
  id: null,
  name: '',
  description: '',
  start_time: null,
  end_time: null,
  grace_minute: 0,
})

const userMap = ref({})

/** Helpers */
function parseTimeToDateOrNull(val) {
  if (!val) {
    return null
  }

  const date = new Date(`1970-01-01T${val}`)
  return isNaN(date.getTime()) ? null : date
}

/** Actions */
function openDialog(shiftRow = null) {
  isEditMode.value = !!shiftRow

  if (shiftRow) {
    // clone the row
    shiftForm.id = shiftRow.id ?? null
    shiftForm.name = shiftRow.name ?? ''
    shiftForm.description = shiftRow.description ?? ''
    shiftForm.grace_minute = shiftRow.grace_minute ?? 0
    // Convert backend time strings to Date for time pickers
    shiftForm.start_time = parseTimeToDateOrNull(shiftRow.start_time)
    shiftForm.end_time = parseTimeToDateOrNull(shiftRow.end_time)
  } else {
    shiftForm.id = null
    shiftForm.name = ''
    shiftForm.description = ''
    shiftForm.start_time = null
    shiftForm.end_time = null
    shiftForm.grace_minute = 0
  }

  dialogVisible.value = true

  // Wait for dialog + child to mount, then clear validation
  nextTick(() => {
    const formEl = shiftFormComp.value?.$refs?.shiftFormRef
    if (formEl?.clearValidate) {
      formEl.clearValidate()
    }
  })
}

async function loadShifts() {
  try {
    loading.value = true
    const res = await getAllShifts()
    shifts.value.splice(0, shifts.value.length, ...res.data.data)
  } catch (err) {
    console.error('Failed to load shifts:', err)
    shifts.value = []
  } finally {
    loading.value = false
  }
}

async function loadUserMap() {
  try {
    const response = await getAllUsers( 1, 1000 )
    const list = response.data.content
    const map = {}
    list.forEach(u => {
      map[u.id] = u
    })
    userMap.value = map
  } catch (err) {
    ElMessage.error(t('user.message.errorLoadingUsersData'))
  }
}

async function submitForm(updatedShift) {
  try {
    // Convert Date objects back to offset times for API
    const offsetStart = formatDateObjectToOffsetTime(updatedShift.start_time)
    const offsetEnd = formatDateObjectToOffsetTime(updatedShift.end_time)
    const payload = {
      ...updatedShift,
      start_time: offsetStart,
      end_time: offsetEnd,
    }

    if (isEditMode.value) {
      await updateShift(payload.id, payload)
    } else {
      await createShift(payload)
    }
    dialogVisible.value = false
    await loadShifts()
  } catch (err) {
    console.error('Error saving shift:', err)
  }
}

async function confirmDelete(id) {
  try {
    await ElMessageBox.confirm(t('common.confirmMessage'), t('common.warning'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    await deleteShift(id)
    await loadShifts()
  } catch (err) {
    // Canceled or error
    if (err !== 'cancel') {
      console.error('Error deleting shift:', err)
    }
  }
}

async function handleRefreshButton() {
  searchQuery.value = ''
  await loadShifts()
}

/** Lifecycle */
onMounted(() => {
  loadShifts()
  loadUserMap()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;

  .actions-row {
    display: flex;
    justify-content: flex-end;
    flex: 1;
    gap: 12px;
  }
}

.refresh-button {
  background-color: #80cfff;
  border-color: #80cfff;
}
.refresh-button:hover {
  background-color: #66b5ff;
  border-color: #66b5ff;
  transform: rotate(360deg);
  transition: transform 0.3s ease-in-out, background-color 0.2s ease;
}
.refresh-button el-icon {
  color: white;
}
</style>
