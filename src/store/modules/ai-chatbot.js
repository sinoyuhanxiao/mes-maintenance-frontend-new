import { defineStore } from 'pinia'

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    open: false,
  }),
  actions: {
    show() {
      this.open = true
    },
    hide() {
      this.open = false
    },
    toggle() {
      this.open = !this.open
    },
  },
  // set to true if you want state after hard refresh (needs pinia-plugin-persistedstate)
  persist: false,
})
