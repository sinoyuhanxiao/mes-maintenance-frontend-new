<template>
  <div class="root">
    <div class="padding-container" />

    <div class="left-container">
      <div class="profile-preview">
        <!--              <WorkOrderImage :image-path="scope.row.image ? [scope.row.image] : null" />-->
        <el-image
          :src="
            user?.image !== null
              ? user?.image
              : 'https://api.dicebear.com/7.x/initials/svg?seed=' +
                encodeURIComponent(user?.first_name + ' ' + user?.last_name)
          "
          fit="cover"
          :preview-src-list="[
            user?.image !== null
              ? user?.image
              : 'https://api.dicebear.com/7.x/initials/svg?seed=' +
                encodeURIComponent(user?.first_name + ' ' + user?.last_name),
          ]"
          class="circular-image"
          :z-index="2000"
          preview-teleported
          style="width: 150px; height: 150px; border-radius: 50%"
        >
          <template #error>
            <div class="image-slot-circle">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>

        <div class="user-thumb">
          <div class="user-name">
            {{ user?.first_name + ' ' + user?.last_name }}
          </div>

          <div v-for="role in user?.roles" :key="role.id" class="user-text">
            {{ role.name || '-' }}
          </div>

          <div class="user-text">{{ t('user.lastVisited') }}: {{ user?.last_visited || '-' }}</div>
        </div>
      </div>

      <div class="actions-group">
        <div style="flex: 1">
          <el-button :icon="Edit" type="info" @click="handleEdit">{{ t('common.edit') }}</el-button>
        </div>

        <div>
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
                <span>{{ user?.id }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.firstName')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.first_name }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.lastName')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.last_name }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.department')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <el-text>
                  {{ findDepartmentById(user?.department_id)?.name || '-' }}
                </el-text>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.table.username')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.username }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.table.phoneNumber')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.phone_number }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.table.email')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.email }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.assignedTeam')" :span="2" v-if="user?.teams?.length > 0">
            <template #default>
              <div style="display: flex; align-items: center">
                <el-tag
                  v-for="(team, index) in user?.teams"
                  :key="index"
                  :type="team.isLeader === true ? 'warning' : 'info'"
                >
                  {{ team.name }} - {{ team.isLeader ? 'Leader' : 'Member' }}
                </el-tag>
              </div>
            </template>
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
      <div class="detail-section">
        <div v-for="role in user?.roles || []" :key="role.id" class="el-col el-col-24 is-guttered card-container">
          <div class="role-card">
            <el-text size="large" style="color: var(--el-color-primary)">
              {{ role.name }}
            </el-text>
            <!-- Hide permission matrix table for now -->
            <!--            <role-permission-content :role="role" />-->
          </div>
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
        <div v-if="user?.certificates?.length > 0">
          <div
            v-for="cert in user?.certificates || []"
            :key="cert.id"
            class="info-card"
            style="display: flex; flex-direction: row; gap: 16px"
          >
            <div class="image-container">
              <el-carousel height="150px">
                <el-carousel-item v-for="img in cert.image_list" :key="img.id">
                  <el-image :src="img.url" fit="contain" style="height: 150px; width: 150px" />
                </el-carousel-item>
              </el-carousel>
            </div>

            <div class="cert-info detail-section">
              <el-descriptions class="general-details-descriptions" :column="4">
                <el-descriptions-item :label="t('user.certificateName')">{{
                  cert.certificate_name
                }}</el-descriptions-item>
                <el-descriptions-item :label="t('user.certificateNumber')">{{
                  cert.certificate_number
                }}</el-descriptions-item>
                <el-descriptions-item :label="t('user.issueDate')">{{
                  cert.issue_date.slice(0, 10)
                }}</el-descriptions-item>
                <el-descriptions-item :label="t('user.expiryDate')">{{
                  cert.expiration_date.slice(0, 10)
                }}</el-descriptions-item>
                <el-descriptions-item :label="t('user.reviewer')">{{ cert.reviewer?.name }}</el-descriptions-item>
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
          :user="user"
          :role-options="roleOptions"
          :department-options="departmentOptions"
          @confirm="handleUserSubmit"
          @cancel="() => (isUserFormDialogVisible = false)"
          @update:loading="isFormProcessing = $event"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllDepartments, getAllRoles, getUserById } from '@/api/user.js'
import { ElMessageBox } from 'element-plus'
// import RolePermissionContent from '@/views/user/components/RolePermissionContent.vue'
import { Edit, Picture, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { useI18n } from 'vue-i18n'
import UserForm from '@/views/user/components/UserForm.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const roleOptions = ref( [] )
const departmentOptions = ref( [] )
const isFormProcessing = ref( false )
const isUserFormDialogVisible = ref( false )
const user = ref( null )

const viewedUserId = ref( null )

onMounted( async() => {
  // 1. Use ID from URL if available, otherwise fallback to current user
  const routeId = parseInt( route.params.id )
  viewedUserId.value = isNaN( routeId ) ? parseInt( userStore.uid ) : routeId

  await loadUser( viewedUserId.value )

  const roles = await getAllRoles()
  const departments = await getAllDepartments()
  roleOptions.value = roles
  departmentOptions.value = departments
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
    await ElMessageBox.confirm( 'Are you sure you want to log out?', 'Warning', {
      type : 'warning'
    } )

    await userStore.LOGIN_OUT()
    await router.push( '/login' )
    window.location.reload()
  } catch ( error ) {}
}

function findDepartmentById( id ) {
  return departmentOptions.value.find( dep => dep.id === id ) || null
}

async function loadUser( id ) {
  try {
    const response = await getUserById( id )
    user.value = response.data
  } catch ( e ) {}
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
  gap: 12px;
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
  width: 70%;
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
</style>
