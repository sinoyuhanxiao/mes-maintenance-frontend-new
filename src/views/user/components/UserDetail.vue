<template>
  <div class="root">
    <div class="padding-container" />

    <div class="left-container">
      <div class="profile-preview">
        <el-image
          :src="'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.name"
          style="width: 150px; height: 150px; border-radius: 50%"
          fit="cover"
        />

        <div class="user-thumb">
          <div class="user-name">
            {{ user?.name }}
          </div>

          <div v-for="role in user?.roles" :key="role.id" class="user-text">
            {{ role.name || '-' }}
          </div>

          <div class="user-text">{{ t('user.lastVisited') }}: {{ user?.last_visited || '-' }}</div>
        </div>
      </div>

      <div class="actions-group">
        <div style="flex: 1">
          <el-button :icon="Edit" type="warning" @click="handleWIP">{{ t('common.edit') }}</el-button>
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
          <el-descriptions-item :label="t('common.id')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.id }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('common.name')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.name }}</span>
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :label="t('user.department')" :span="1">
            <template #default>
              <div style="display: flex; align-items: center">
                <span>{{ user?.department?.name }}</span>
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

          <el-descriptions-item :label="t('user.assignedTeam')" :span="2">
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
          <div class="info-card">
            <el-text size="large">
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserById } from '@/views/user/components/userService'
import { ElMessage, ElMessageBox } from 'element-plus'
// import RolePermissionContent from '@/views/user/components/RolePermissionContent.vue'
import { Edit, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
// const currentUserId = parseInt( userStore.uid )
const viewedUserId = parseInt( route.params.id )

const user = ref( null )

onMounted( async() => {
  user.value = await getUserById( viewedUserId )
} )

// const showActions = computed( () => currentUserId === viewedUserId )
const handleWIP = async() => {
  try {
    ElMessage( 'This feature is still work in progress.' )
  } catch ( e ) {}
}

const handleLogout = async() => {
  try {
    await ElMessageBox.confirm( 'Are you sure you want to log out?', 'Warning', {
      type : 'warning'
    } )

    // TODO: Implement later
    // 退出登录

    await userStore.LOGIN_OUT()
    await router.push( '/login' )
    window.location.reload()
  } catch ( error ) {}
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
