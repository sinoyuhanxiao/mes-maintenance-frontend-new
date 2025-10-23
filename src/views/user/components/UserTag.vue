<template>
  <!-- Unknown user -->
  <span v-if="!user">
    <el-tag size="small" type="info" effect="light">
      {{ '-' }}
    </el-tag>
  </span>

  <!-- User with info -->
  <el-popover v-else effect="light" trigger="hover" placement="top" width="320px">
    <template #default>
      <div class="user-card">
        <!-- Header: avatar + name + roles -->
        <div class="user-card-header">
          <div class="avatar">
            <el-image :src="avatarUrl" fit="cover" class="avatar-img" alt="avatar" :preview-src-list="[avatarUrl]">
              <template #error>
                <div class="avatar-fallback">
                  {{ fullName.charAt(0) }}
                </div>
              </template>
            </el-image>
          </div>
          <div class="info">
            <div class="name">{{ fullName }}</div>
            <div class="roles" v-if="user.role_list?.length">
              <div v-for="role in user.role_list" :key="role.id" class="role">
                {{ role.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="user-card-body">
          <!--          <div class="line" v-if="user.department_ids?.length">-->
          <!--            <span class="label">{{ t('user.department') }}:</span>-->

          <!--            <span class="value">-->
          <!--              <template v-for="(id, idx) in user.department_ids" :key="id">-->
          <!--                {{ getDepartmentById(id)?.name || id }}-->
          <!--                <span v-if="idx < user.department_ids.length - 1">, </span>-->
          <!--              </template>-->
          <!--            </span>-->
          <!--          </div>-->

          <div v-if="user.email" class="line">
            <span class="label">{{ t('user.table.email') }}:</span>
            <a :href="`mailto:${user.email}`" class="value link">{{ user.email }}</a>
          </div>

          <div v-if="user.phone_number" class="line">
            <span class="label">{{ t('user.table.phoneNumber') }}:</span>
            <span class="value">{{ user.phone_number }}</span>
          </div>

          <div class="line">
            <span class="label">Status:</span>
            <span class="value">{{ user.enabled ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #reference>
      <el-button plain type="primary" size="small" @click="goToDetail">
        {{ fullName }}
      </el-button>
    </template>
  </el-popover>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const props = defineProps( {
  user : {
    type : Object,
    default : null
  }
} )

const fullName = computed( () =>
  props.user ? `${props.user.first_name} ${props.user.last_name}` : t( 'user.unknownUser' )
)

const avatarUrl = computed( () => {
  if ( !props.user ) return ''
  if ( props.user.image ) {
    return props.user.image
  }
  return (
    'https://api.dicebear.com/7.x/initials/svg?seed=' +
    encodeURIComponent( `${props.user.first_name || ''} ${props.user.last_name || ''}` )
  )
} )

// function getDepartmentById( id ) {
//   return props.departmentOptions.find( dep => dep.id === id ) || null
// }

function goToDetail() {
  if ( props.user?.id ) {
    router.push( { name : 'UserDetail', params : { id : props.user.id }} )
  }
}
</script>

<style scoped lang="scss">
.user-card {
  background: #fff;
  color: #000;
  font-size: 13px;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .avatar {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .roles {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .role {
        background: #eaf4ff;
        color: #0078d4;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.3;
        width: fit-content;
      }
    }
  }
}

.user-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .line {
    display: flex;
    gap: 6px;
    align-items: baseline;

    .label {
      font-weight: 500;
      color: #444;
      min-width: 90px;
    }

    .value {
      color: #000;
      word-break: break-word;
    }

    .link {
      color: #0078d4;
      text-decoration: none;
    }
  }
}
</style>
