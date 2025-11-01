<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
    <!-- Bind to store so it persists across route changes -->
    <ChatbotFloating v-model:open="chatbotOpen" />
  </el-config-provider>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zh from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useAppStore } from '@/store'
// import { useI18n } from 'vue-i18n'
import ChatbotFloating from '@/components/aiChatbot/ChatbotFloating.vue'
import { useChatbotStore } from '@/store/modules/ai-chatbot'

export default defineComponent({
  name: 'App',
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ChatbotFloating,
  },
  setup() {
    // const { t } = useI18n()
    const appStore = useAppStore()
    const chatbotStore = useChatbotStore()
    const locale = computed(() => (appStore.lang === 'zh' ? zh : en))
    const size = computed(() => appStore.size)

    // Two-way binding for v-model:open
    const chatbotOpen = computed({
      get: () => chatbotStore.open,
      set: v => (chatbotStore.open = v),
    })

    return {
      locale,
      size,
      chatbotOpen,
    }
  },
})
</script>
