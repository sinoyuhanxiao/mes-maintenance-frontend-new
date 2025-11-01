import useTagsViewStore from '@/store/modules/tagsView'

export function updateTabTitle(route, title) {
  const tagsViewStore = useTagsViewStore()
  const currentTab = tagsViewStore.visitedViews.find(tab => tab.path === route.fullPath)
  if (currentTab) {
    currentTab.title = title
    tagsViewStore.UPDATE_VISITED_VIEW(currentTab)
  }
}
