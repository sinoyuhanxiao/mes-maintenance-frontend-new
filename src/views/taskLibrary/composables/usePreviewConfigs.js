import { computed } from 'vue'

// Lightweight composable to centralize preview dialog configuration
export function usePreviewConfigs() {
  const previewDialogConfig = computed( () => ( {
    title : 'Preview Procedure',
    width : '70%',
    fullscreen : false,
    closeOnClickModal : true,
    appendToBody : true,
    customClass : 'template-preview-dialog'
  } ) )

  const previewHeaderConfig = computed( () => ( {
    showSubtitle : true,
    showMeta : true,
    metaFields : ['category', 'estimated_minutes', 'applicable_assets']
  } ) )

  const previewToolbarConfig = computed( () => ( {
    showStepNumbersToggle : true,
    showViewportSwitcher : true,
    viewportOptions : ['desktop', 'mobile'],
    interactionMode : 'static'
  } ) )

  const previewLayoutConfig = computed( () => ( {
    sectionCollapsible : true,
    sectionsInitiallyExpanded : true,
    showStepNumbers : true,
    requiredMark : '*',
    density : 'comfortable'
  } ) )

  const previewContentConfig = computed( () => ( {
    grouping : 'by_section_field',
    sectionTitleField : 'section',
    unknownSectionTitle : 'General',
    widgets : {
      inspection : {
        options : ['pass', 'flag', 'fail'],
        buttonStyle : 'pill'
      },
      checkbox : {
        stackDirection : 'vertical'
      },
      number : {
        showUnits : true,
        showLimits : true,
        unitsField : 'unit',
        limitsField : 'limits'
      },
      text : {
        placeholderField : 'placeholder',
        rows : 3
      },
      files : {
        acceptImages : true,
        acceptDocuments : true
      }
    }
  } ) )

  const previewFooterConfig = computed( () => ( {
    showClose : true,
    showPrint : false
  } ) )

  return {
    previewDialogConfig,
    previewHeaderConfig,
    previewToolbarConfig,
    previewLayoutConfig,
    previewContentConfig,
    previewFooterConfig
  }
}
