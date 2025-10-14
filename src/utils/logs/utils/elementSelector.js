/**
 * Dynamic element selector utility
 * Provides flexible element selection capabilities for various form types
 */

/**
 * Configuration for different form types and their typical button selectors
 */
export const selectorConfigs = {
  workOrder : {
    submitButton : [
      'div.form-actions-fixed > div.form-actions-content > button.el-button.create-button',
      'div.form-actions-fixed > div.form-actions-content > button.create-button',
      'button.create-button',
      'div.form-actions-content > button[type="submit"]',
      'div.form-actions-fixed button[type="submit"]',
      '.form-actions button.el-button--primary',
      'button[type="submit"]'
    ],
    form : ['form.create-form', 'form.work-order-form', 'form', '.el-form'],
    container : ['.work-order-create-enhanced', '.work-order-create', '.create-container', '.main-container']
  },
  template : {
    submitButton : [
      'button.submit-button',
      'button[type="submit"]',
      '.form-actions button.el-button--primary',
      '.template-actions button.save-button',
      'button.save-template'
    ],
    form : ['form.template-form', 'form.designer-form', 'form', '.el-form'],
    container : ['.template-designer', '.template-container', '.designer-container']
  },
  standard : {
    submitButton : [
      'button.submit-button',
      'button[type="submit"]',
      '.form-actions button.el-button--primary',
      '.standard-actions button.save-button',
      'button.save-standard'
    ],
    form : ['form.standard-form', 'form', '.el-form'],
    container : ['.standard-container', '.standards-view']
  },
  generic : {
    submitButton : [
      'button[type="submit"]',
      'button.submit-button',
      'button.save-button',
      'button.create-button',
      '.form-actions button.el-button--primary',
      '.form-actions button.primary',
      'button.el-button--primary',
      'button.primary'
    ],
    form : ['form', '.el-form', '.form-container'],
    container : ['.main-container', '.page-container', '.content-container']
  }
}

/**
 * Find element using multiple selectors with fallback
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {Element} container - Container element to search within
 * @returns {Element|null} - Found element or null
 */
export const findElementWithFallback = ( selectors, container = document ) => {
  if ( !Array.isArray( selectors ) ) {
    selectors = [selectors]
  }

  for ( const selector of selectors ) {
    try {
      const element = container.querySelector( selector )
      if ( element ) {
        return element
      }
    } catch ( error ) {
      console.warn( `Invalid selector: ${selector}`, error )
    }
  }

  return null
}

/**
 * Find all elements using multiple selectors
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {Element} container - Container element to search within
 * @returns {Element[]} - Array of found elements
 */
export const findAllElementsWithFallback = ( selectors, container = document ) => {
  if ( !Array.isArray( selectors ) ) {
    selectors = [selectors]
  }

  const foundElements = []

  for ( const selector of selectors ) {
    try {
      const elements = container.querySelectorAll( selector )
      if ( elements.length > 0 ) {
        foundElements.push( ...Array.from( elements ) )
      }
    } catch ( error ) {
      console.warn( `Invalid selector: ${selector}`, error )
    }
  }

  // Remove duplicates
  return Array.from( new Set( foundElements ) )
}

/**
 * Find submit button for a specific form type
 * @param {string} formType - Type of form (workOrder, template, standard, generic)
 * @param {Element} container - Container element to search within
 * @returns {Element|null} - Found submit button or null
 */
export const findSubmitButton = ( formType = 'generic', container = document ) => {
  const config = selectorConfigs[formType] || selectorConfigs.generic
  return findElementWithFallback( config.submitButton, container )
}

/**
 * Find form element for a specific form type
 * @param {string} formType - Type of form
 * @param {Element} container - Container element to search within
 * @returns {Element|null} - Found form element or null
 */
export const findForm = ( formType = 'generic', container = document ) => {
  const config = selectorConfigs[formType] || selectorConfigs.generic
  return findElementWithFallback( config.form, container )
}

/**
 * Find container element for a specific form type
 * @param {string} formType - Type of form
 * @param {Element} container - Container element to search within
 * @returns {Element|null} - Found container element or null
 */
export const findContainer = ( formType = 'generic', container = document ) => {
  const config = selectorConfigs[formType] || selectorConfigs.generic
  return findElementWithFallback( config.container, container )
}

/**
 * Find all action buttons (submit, cancel, reset, etc.)
 * @param {string} formType - Type of form
 * @param {Element} container - Container element to search within
 * @returns {Object} - Object containing categorized buttons
 */
export const findActionButtons = ( formType = 'generic', container = document ) => {
  const actionSelectors = {
    submit : ['button[type="submit"]', 'button.submit-button', 'button.create-button', 'button.save-button'],
    cancel : [
      'button.cancel-button',
      'button[type="button"]:contains("Cancel")',
      'button[type="button"]:contains("cancel")',
      '.form-actions button:contains("Cancel")'
    ],
    reset : ['button[type="reset"]', 'button.reset-button', 'button:contains("Reset")', 'button:contains("reset")']
  }

  return {
    submit : findAllElementsWithFallback( actionSelectors.submit, container ),
    cancel : findAllElementsWithFallback( actionSelectors.cancel, container ),
    reset : findAllElementsWithFallback( actionSelectors.reset, container )
  }
}

/**
 * Auto-detect form type based on page elements and URL
 * @param {Object} route - Vue router route object (optional)
 * @returns {string} - Detected form type
 */
export const detectFormType = ( route = null ) => {
  // Check URL/route first
  if ( route ) {
    const path = route.path.toLowerCase()
    const name = route.name?.toLowerCase() || ''

    if ( path.includes( 'work-order' ) || name.includes( 'workorder' ) || name.includes( 'work_order' ) ) {
      return 'workOrder'
    } else if ( path.includes( 'template' ) || name.includes( 'template' ) ) {
      return 'template'
    } else if ( path.includes( 'standard' ) || name.includes( 'standard' ) ) {
      return 'standard'
    }
  }

  // Check page elements
  const workOrderIndicators = [
    '.work-order-create',
    '.work-order-form',
    'h2:contains("Work Order")',
    '.create-title:contains("Work Order")'
  ]

  const templateIndicators = ['.template-designer', '.template-form', 'h2:contains("Template")', '.designer-container']

  const standardIndicators = ['.standard-container', '.standard-form', 'h2:contains("Standard")', '.standards-view']

  if ( findElementWithFallback( workOrderIndicators ) ) {
    return 'workOrder'
  } else if ( findElementWithFallback( templateIndicators ) ) {
    return 'template'
  } else if ( findElementWithFallback( standardIndicators ) ) {
    return 'standard'
  }

  return 'generic'
}

/**
 * Add custom selectors for a form type
 * @param {string} formType - Type of form
 * @param {Object} selectors - Object containing selector arrays
 */
export const addCustomSelectors = ( formType, selectors ) => {
  if ( !selectorConfigs[formType] ) {
    selectorConfigs[formType] = {}
  }

  Object.keys( selectors ).forEach( key => {
    if ( !selectorConfigs[formType][key] ) {
      selectorConfigs[formType][key] = []
    }

    if ( Array.isArray( selectors[key] ) ) {
      selectorConfigs[formType][key].unshift( ...selectors[key] )
    } else {
      selectorConfigs[formType][key].unshift( selectors[key] )
    }
  } )
}

/**
 * Wait for element to appear in DOM
 * @param {string|string[]} selectors - CSS selector(s) to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @param {Element} container - Container to search within
 * @returns {Promise<Element|null>} - Promise that resolves to found element or null
 */
export const waitForElement = ( selectors, timeout = 5000, container = document ) => {
  return new Promise( resolve => {
    const startTime = Date.now()

    const checkForElement = () => {
      const element = findElementWithFallback( selectors, container )

      if ( element ) {
        resolve( element )
        return
      }

      if ( Date.now() - startTime > timeout ) {
        resolve( null )
        return
      }

      // Use requestAnimationFrame for better performance
      requestAnimationFrame( checkForElement )
    }

    checkForElement()
  } )
}

/**
 * Create a MutationObserver to watch for element changes
 * @param {string|string[]} selectors - CSS selector(s) to watch for
 * @param {Function} callback - Callback function when element is found
 * @param {Element} container - Container to observe
 * @returns {MutationObserver} - The created observer
 */
export const observeForElement = ( selectors, callback, container = document.body ) => {
  const observer = new MutationObserver( mutations => {
    mutations.forEach( mutation => {
      if ( mutation.type === 'childList' ) {
        const element = findElementWithFallback( selectors, container )
        if ( element ) {
          callback( element )
        }
      }
    } )
  } )

  observer.observe( container, {
    childList : true,
    subtree : true
  } )

  // Check if element already exists
  const existingElement = findElementWithFallback( selectors, container )
  if ( existingElement ) {
    setTimeout( () => callback( existingElement ), 0 )
  }

  return observer
}

/**
 * Get detailed information about found elements
 * @param {string} formType - Type of form
 * @param {Element} container - Container to search within
 * @returns {Object} - Detailed element information
 */
export const getElementInfo = ( formType = 'generic', container = document ) => {
  const submitButton = findSubmitButton( formType, container )
  const form = findForm( formType, container )
  const formContainer = findContainer( formType, container )
  const actionButtons = findActionButtons( formType, container )

  return {
    formType,
    elements : {
      submitButton,
      form,
      container : formContainer,
      actionButtons
    },
    selectors : selectorConfigs[formType] || selectorConfigs.generic,
    stats : {
      hasSubmitButton : !!submitButton,
      hasForm : !!form,
      hasContainer : !!formContainer,
      totalActionButtons : Object.values( actionButtons ).flat().length
    }
  }
}

export default {
  selectorConfigs,
  findElementWithFallback,
  findAllElementsWithFallback,
  findSubmitButton,
  findForm,
  findContainer,
  findActionButtons,
  detectFormType,
  addCustomSelectors,
  waitForElement,
  observeForElement,
  getElementInfo
}
