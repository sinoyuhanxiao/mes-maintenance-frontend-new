import defaultSettings from '@/settings'
import { i18n } from '@/locale'

/* const title = defaultSettings.title || 'Vite Element Admin'

const { t : $t } = i18n.global

export default function getPageTitle( pageTitle ) {
  if ( pageTitle ) {
    return `${$t( pageTitle )} - ${$t( 'title' )}`
  } else {
    return `${$t( title )}`
  }
} */
const appTitle = defaultSettings.title || 'Vite Element Admin'
const { t: $t } = i18n.global

export default function getPageTitle(pageTitle) {
  if (typeof pageTitle === 'string' && pageTitle.trim().length > 0) {
    // 有合法的 i18n key，尝试翻译
    try {
      return `${$t(pageTitle)} - ${appTitle}`
    } catch (e) {
      // 如果 i18n key 不存在，直接显示原字符串
      return `${pageTitle} - ${appTitle}`
    }
  }
  // 没传 pageTitle，直接用应用默认标题
  return appTitle
}
