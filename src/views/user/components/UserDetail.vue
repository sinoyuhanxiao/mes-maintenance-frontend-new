<template>
  <div class="root" v-loading="loading">
    <div class="padding-container" />

    <div class="left-container">
      <div class="profile-preview">
        <template v-if="!rawUser?.image">
          <div class="circular-image">
            <el-tooltip content="No image available">
              <div class="image-slot-circle">
                <el-icon><Picture /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </template>

        <el-image
          v-else
          :src="rawUser?.image"
          fit="cover"
          :preview-src-list="[rawUser?.image]"
          class="circular-image"
          :z-index="2000"
          preview-teleported
        >
          <template #error>
            <el-tooltip content="Image failed to load">
              <div class="image-slot-circle">
                <el-icon><Picture /></el-icon>
              </div>
            </el-tooltip>
          </template>
        </el-image>

        <div class="user-thumb">
          <div class="user-name">
            {{ rawUser?.first_name + ' ' + rawUser?.last_name }}
          </div>

          <div v-for="roleWrapper in rawUser?.role_list" :key="roleWrapper?.role.id" class="user-text">
            {{ roleWrapper.role?.name || '-' }}
          </div>

          <!-- Not supported in backend for now -->
          <!--          <div class="user-text">{{ t('user.lastVisited') }}: {{ rawUser?.last_visited || '-' }}</div>-->
        </div>
      </div>

      <div class="actions-group">
        <div style="flex: 1">
          <el-button :icon="Edit" type="info" @click="handleEdit">
            {{ t('common.edit') }}
          </el-button>
        </div>

        <div v-if="isCurrentUser">
          <el-button :icon="SwitchButton" type="danger" @click="handleLogout">{{ t('userCenter.logout') }}</el-button>
        </div>
      </div>
    </div>

    <div class="center-container">
      <!-- Personal info title -->
      <div class="title-block" style="margin-top: 30px">
        <el-text :size="'large'" tag="b">
          {{ t('user.userInformation') }}
        </el-text>
      </div>

      <!-- Personal Info Section -->
      <div class="detail-section">
        <el-descriptions class="general-details-descriptions" :column="4">
          <el-descriptions-item :label="'ID'" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.id }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.firstName')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.first_name }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.lastName')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.last_name }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <!--          <el-descriptions-item :label="t('user.department')" :span="1">-->
          <!--            <template #default>-->
          <!--              <div v-if="rawUser?.department_ids && rawUser?.department_ids.length">-->
          <!--                <div v-for="id in rawUser?.department_ids" :key="id" style="display: flex; align-items: center">-->
          <!--                  <el-text>-->
          <!--                    {{ departmentOptions.find(dept => dept.id === id)?.name || '-' }}-->
          <!--                  </el-text>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--              <div v-else>-->
          <!--                {{ '-' }}-->
          <!--              </div>-->
          <!--            </template>-->
          <!--          </el-descriptions-item>-->

          <el-descriptions-item :label="t('user.table.username')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.username }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.employeeNumber')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.employee_number || '-' }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.table.phoneNumber')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.phone_number }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.table.email')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ rawUser?.email }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <!-- TODO: team info not in user dto -->
          <el-descriptions-item :label="t('user.assignedTeam')" :span="2" v-if="userTeams?.length > 0">
            <template #default>
              <div v-for="team in userTeams" :key="team.id" style="display: flex; align-items: center">
                <el-text>
                  {{ team.name }}
                </el-text>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item label="Created At" min-width="150px">
            {{ formatAsLocalDateTimeString(rawUser?.created_at) || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="Updated At" min-width="150px">
            {{ formatAsLocalDateTimeString(rawUser?.updated_at) || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- Role title -->
      <div class="title-block">
        <el-text :size="'large'" tag="b">
          {{ t('user.table.role') }}
        </el-text>
      </div>

      <!-- Role cards -->
      <div class="certificate-info-list">
        <div v-if="rawUser?.role_list?.length > 0">
          <div v-for="roleWrapper in rawUser?.role_list || []" :key="roleWrapper?.role.id">
            <div>
              <el-descriptions class="general-details-descriptions" :column="4">
                <el-descriptions-item :label="'Role Name'">
                  {{ roleWrapper.role.name }}
                </el-descriptions-item>

                <el-descriptions-item :label="'Role ID'">
                  {{ roleWrapper.role.id }}
                </el-descriptions-item>

                <el-descriptions-item :label="'Code'">
                  {{ roleWrapper.role.code }}
                </el-descriptions-item>

                <el-descriptions-item :label="'Module'">
                  {{ roleWrapper.role.module || '-' }}
                </el-descriptions-item>

                <div v-if="roleWrapper.role.description">
                  <el-descriptions-item :label="'Description'" :span="4">
                    {{ roleWrapper.role.description }}
                  </el-descriptions-item>
                </div>
              </el-descriptions>
            </div>
          </div>
        </div>
        <div v-else>
          <el-empty :description="'No role assigned'" :image-size="120" style="margin-top: 12px" />
        </div>
      </div>

      <el-divider />

      <!-- Certificates title -->
      <div class="title-block">
        <el-text :size="'large'" tag="b">
          {{ t('user.certificate') }}
        </el-text>
      </div>

      <!-- Certificate cards -->
      <div class="certificate-info-list">
        <div v-if="rawUser?.certificate_list?.length > 0">
          <div v-for="cert in rawUser?.certificate_list || []" :key="cert.id" class="info-card">
            <div v-if="cert.file_list.length > 1" class="image-container">
              <el-carousel height="150px">
                <el-carousel-item v-for="(img, index) in cert.file_list" :key="img">
                  <el-image
                    :src="img"
                    :preview-src-list="cert.file_list"
                    :initial-index="index"
                    fit="cover"
                    preview-teleported
                  />
                </el-carousel-item>
              </el-carousel>
            </div>

            <div v-else class="image-container">
              <el-image
                :src="cert.file_list?.[0] || ''"
                :preview-src-list="cert.file_list"
                :initial-index="0"
                fit="cover"
                style="height: 150px; width: 150px"
              >
                <template #error>
                  <el-tooltip content="No Image">
                    <el-empty style="padding: 0 0" :image-size="100" />
                  </el-tooltip>
                </template>
              </el-image>
            </div>

            <div>
              <el-descriptions class="general-details-descriptions" :column="4">
                <el-descriptions-item :label="t('user.certificateName')">
                  {{ cert.name }}
                </el-descriptions-item>
                <el-descriptions-item :label="t('user.certificateNumber')">
                  {{ cert.certificate_number }}
                </el-descriptions-item>
                <el-descriptions-item v-if="cert.issue_date" :label="t('user.issueDate')">
                  {{ cert.issue_date.slice(0, 10) }}
                </el-descriptions-item>
                <el-descriptions-item v-if="cert.expiration_date" :label="t('user.expiryDate')">
                  {{ cert.expiration_date.slice(0, 10) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
        <div v-else>
          <el-empty :description="t('user.noCertificates')" :image-size="120" style="margin-top: 12px" />
        </div>
      </div>
    </div>

    <div class="padding-container" />

    <el-dialog :title="t('user.form.editUser')" v-model="isUserFormDialogVisible" top="10vh" width="50%">
      <div v-loading="isFormProcessing">
        <UserForm
          :user="rawUser"
          @confirm="handleUserSubmit"
          @cancel="() => (isUserFormDialogVisible = false)"
          @update:loading="isFormProcessing = $event"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getUserById } from '@/api/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Picture, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { useI18n } from 'vue-i18n'
import UserForm from '@/views/user/components/UserForm.vue'
import { gotoCognitoLogin } from '@/utils/cognito/cognito'
// import { searchDepartments } from '@/api/department'
import { searchRoles } from '@/api/rbac'
import { searchTeams } from '@/api/team'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()

const roleOptions = ref( [] )
// const departmentOptions = ref( [] )
const isFormProcessing = ref( false )
const isUserFormDialogVisible = ref( false )
const rawUser = ref( null )
const viewedUserId = ref( null )
const loading = ref( false )
const userTeams = ref( [] )

onMounted( async() => {
  viewedUserId.value = parseInt( route.params.id )
  try {
    loading.value = true
    await loadRoles()
    // await loadDepartments()
    await loadUser( viewedUserId.value )
    await loadUserTeams( viewedUserId.value )
  } catch ( e ) {
  } finally {
    loading.value = false
  }
} )

const isCurrentUser = computed( () => {
  return userStore?.uid === viewedUserId.value
} )

function handleEdit( user ) {
  isUserFormDialogVisible.value = true
}

function handleUserSubmit() {
  isUserFormDialogVisible.value = false
  loadUser( viewedUserId.value )
}

const handleLogout = async() => {
  try {
    await ElMessageBox.confirm( 'Are you sure you want to log out?', 'Warning', { type : 'warning' } )
    await userStore.LOGIN_OUT()
    gotoCognitoLogin()
    window.location.reload()
  } catch ( error ) {}
}

async function loadUser( id ) {
  try {
    const response = await getUserById( id )
    const userData = response?.data || {}

    rawUser.value = {
      ...userData,
      role_list : ( userData.role_list || [] ).filter( roleWrapper => roleWrapper.role?.status === 1 )
    }
  } catch ( e ) {
    console.error( 'Failed to load user:', e )
  }
}

async function loadRoles() {
  try {
    const response = await searchRoles( {}, 1, 1000 )
    roleOptions.value = response.data.content
  } catch ( e ) {
    ElMessage.error( e )
  }
}

// async function loadDepartments() {
//   try {
//     const response = await searchDepartments( {}, 1, 1000 )
//     departmentOptions.value = response.data.content
//   } catch ( e ) {
//     ElMessage.error( e )
//   }
// }

async function loadUserTeams( userId ) {
  if ( !userId ) {
    userTeams.value = []
    return
  }
  try {
    const res = await searchTeams( { member_ids : [userId] }, 1, 1000 )
    userTeams.value = res?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load teams for user', err )
    userTeams.value = []
  }
}
</script>

<style scoped lang="scss">
.root {
  display: flex;
  width: 100%;
  gap: 16px;
}

.left-container {
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
}

.user-thumb {
  text-align: center;

  .user-name {
    margin: 15px 0 12px 0;
    color: rgba(104, 114, 132, 1);
    font-size: 20px;
  }

  .user-text {
    color: rgba(166, 179, 202, 1);
    font-size: 16px;
  }
}

.actions-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
}

.center-container {
  width: 60%;
  flex: 1;
  margin-top: 24px;
  margin-bottom: 24px;
  padding: 0 24px 24px 24px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.padding-container {
  width: 10%;
}

.info-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin-top: 16px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  //width: 100%;
}

.role-card {
  padding: 16px;
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 8px;
  margin-top: 16px;
  background-color: var(--el-color-primary-light-9);
}

.role-permission-card {
  margin-top: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 12px;
}

.certificate-info-list {
  display: flex;
  flex-direction: column;
}

.certificate-card {
  display: flex;
  gap: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 10px;
}

.image-container {
  width: 150px;
}

.cert-info {
  //width: 100%;
  background: transparent;
}

.title-block {
  align-items: flex-start;
}

// Custom el-description style from Work order todo view
.general-details-descriptions {
  :deep(.el-descriptions__header) {
    margin-bottom: 0;
  }

  :deep(.el-descriptions__body) {
    background: transparent;
  }

  :deep(.el-descriptions__table) {
    border: none;
    border-collapse: separate;
    border-spacing: 0 16px;
  }

  :deep(.el-descriptions__cell) {
    padding: 0 70px 0 0;
    border: none;
    vertical-align: top;

    &:last-child {
      padding-right: 0;
    }
  }

  :deep(.el-descriptions__label) {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
    margin-bottom: 4px;
    display: block;
  }

  :deep(.el-descriptions__content) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}

.section-container {
  margin-top: 24px;
  padding: 0 24px 24px 24px;
}

.circular-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid var(--el-border-color-lighter);
  display: flex;
}

.image-slot-circle {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 70px;
  border-radius: 50%;
}
</style>
