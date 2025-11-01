<template>
  <div class="callback-wrapper">
    <el-card class="callback-card">
      <template #header>
        <span>Processing login callback</span>
      </template>

      <el-result v-if="loading" title="Verifying Cognito login…" sub-title="Please wait...">
        <template #icon>
          <el-icon><Loading /></el-icon>
        </template>
      </el-result>

      <el-result v-else-if="error" icon="error" title="Callback failed" :sub-title="errorMsg">
        <template #extra>
          <el-button type="primary" @click="retry" :loading="loading">Retry</el-button>
          <el-button @click="goHome" style="margin-left: 1rem">Go Home</el-button>
        </template>
      </el-result>

      <el-result v-else icon="success" title="Login Successfully" sub-title="The main page is being redirected..." />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { callback } from '@/api/user'
import { gotoCognitoLogin } from '@/utils/cognito/cognito'
import { useUserStore } from '@/store'

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const gotoCognito = () => {
  gotoCognitoLogin()
}

const goHome = () => {
  router.replace('/')
}

const retry = () => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  doCallback()
}

const doCallback = async () => {
  let code = route.query.code

  if (!code) {
    const hash = window.location.hash
    const searchParams = new URLSearchParams(hash.split('?')[1])
    code = searchParams.get('code')
  }

  if (import.meta.env.DEV) {
    console.log('Callback hash:', window.location.hash)
    console.log('Final code:', code)
  }

  if (!code) {
    error.value = true
    loading.value = false
    errorMsg.value = 'No Cognito login code detected. Redirecting to login page...'
    setTimeout(gotoCognito, 1800)
    return
  }
  try {
    const res = await callback(code)
    console.log('Callback API result:', res)
    await userStore.GET_USER_INFO()
    loading.value = false
    error.value = false
    await router.replace({ path: '/', query: {} })
  } catch (err) {
    loading.value = false
    error.value = true
    errorMsg.value =
      err?.response?.data?.message ||
      err.message ||
      'Login callback failed. Please try again or contact the administrator.'
  }
}

onMounted(() => {
  console.log('Callback page mounted!', route.query.code)
  doCallback()
})
</script>

<style scoped>
.callback-wrapper {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.callback-card {
  width: 100%;
  max-width: 400px;
  border-radius: 14px;
  box-shadow: 0 2px 12px #eee;
  padding: 1.5rem 2rem 2rem 2rem;
}
</style>
