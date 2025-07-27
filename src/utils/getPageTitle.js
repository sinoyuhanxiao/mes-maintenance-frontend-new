import defaultSettings from '@/settings'
import { i18n } from '@/locale'
const title = defaultSettings.title || 'Vite Element Admin'

const { t : $t } = i18n.global

export default function getPageTitle( pageTitle ) {
  if ( pageTitle ) {
    return `${$t( pageTitle )} - ${$t( 'title' )}`
  } else {
    return `${$t( title )}`
  }
}
