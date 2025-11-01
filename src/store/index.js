import { createPinia } from 'pinia'
import useUserStore from './modules/users'
import useTagsViewStore from './modules/tagsView'
import useAppStore from './modules/app'
import useSettingsStore from './modules/settings'
import usePermissionStore from './modules/permission'
import { useTaskLibraryStore } from './modules/taskLibrary'
import { useTemplateDesignerStore } from './modules/templateDesigner'
import { useWorkOrderDraftStore } from './modules/workOrderDraft'

const store = createPinia()

export function registerStore(app) {
  app.use(store)
}

export {
  useUserStore,
  useTagsViewStore,
  useAppStore,
  useSettingsStore,
  usePermissionStore,
  useTaskLibraryStore,
  useTemplateDesignerStore,
  useWorkOrderDraftStore,
}

export default store
