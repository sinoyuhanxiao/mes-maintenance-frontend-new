/**
 * Logger configuration for different form types
 * Centralizes settings and behavior for payload logging across the application
 */

export const loggerConfig = {
  // Global settings
  global: {
    autoLog: true,
    showSuccessMessage: true,
    delayMs: 50,
    enableValidation: true,
    enableComparison: false,
  },

  // Form-specific configurations
  forms: {
    workOrder: {
      title: 'Work Order Payload',
      subtitle: "Click 'Logs' to refresh payload data",
      validation: {
        enabled: true,
        schema: 'workOrder',
        showWarnings: true,
      },
      logging: {
        autoTrigger: true,
        logOnSubmit: true,
        logOnChange: false,
      },
      drawer: {
        defaultWidth: 600,
        position: 'right',
        modal: false,
      },
    },

    template: {
      title: 'Template Payload',
      subtitle: "Click 'Logs' to refresh template data",
      validation: {
        enabled: true,
        schema: 'template',
        showWarnings: true,
      },
      logging: {
        autoTrigger: true,
        logOnSubmit: true,
        logOnChange: false,
      },
      drawer: {
        defaultWidth: 500,
        position: 'right',
        modal: false,
      },
    },

    standard: {
      title: 'Standard Payload',
      subtitle: "Click 'Logs' to refresh standard data",
      validation: {
        enabled: true,
        schema: 'standard',
        showWarnings: true,
      },
      logging: {
        autoTrigger: true,
        logOnSubmit: true,
        logOnChange: false,
      },
      drawer: {
        defaultWidth: 500,
        position: 'right',
        modal: false,
      },
    },

    generic: {
      title: 'Form Payload',
      subtitle: "Click 'Logs' to refresh form data",
      validation: {
        enabled: false,
        schema: null,
        showWarnings: false,
      },
      logging: {
        autoTrigger: true,
        logOnSubmit: true,
        logOnChange: false,
      },
      drawer: {
        defaultWidth: 500,
        position: 'right',
        modal: false,
      },
    },
  },

  // Development vs production settings
  environment: {
    development: {
      enableLogging: true,
      enableDrawer: true,
      enableValidation: true,
      enableComparison: true,
      logLevel: 'debug',
    },
    production: {
      enableLogging: false,
      enableDrawer: false,
      enableValidation: false,
      enableComparison: false,
      logLevel: 'error',
    },
  },
}

/**
 * Get configuration for a specific form type
 * @param {string} formType - Type of form
 * @returns {Object} - Configuration object
 */
export const getFormConfig = (formType = 'generic') => {
  const baseConfig = loggerConfig.global
  const formConfig = loggerConfig.forms[formType] || loggerConfig.forms.generic
  const envConfig = loggerConfig.environment[process.env.NODE_ENV] || loggerConfig.environment.development

  return {
    ...baseConfig,
    ...formConfig,
    ...envConfig,
  }
}

/**
 * Check if logging is enabled for current environment
 * @returns {boolean} - Whether logging is enabled
 */
export const isLoggingEnabled = () => {
  const envConfig = loggerConfig.environment[process.env.NODE_ENV] || loggerConfig.environment.development
  return envConfig.enableLogging
}

/**
 * Check if drawer is enabled for current environment
 * @returns {boolean} - Whether drawer is enabled
 */
export const isDrawerEnabled = () => {
  const envConfig = loggerConfig.environment[process.env.NODE_ENV] || loggerConfig.environment.development
  return envConfig.enableDrawer
}

/**
 * Update configuration for a specific form type
 * @param {string} formType - Type of form
 * @param {Object} config - Configuration updates
 */
export const updateFormConfig = (formType, config) => {
  if (loggerConfig.forms[formType]) {
    loggerConfig.forms[formType] = {
      ...loggerConfig.forms[formType],
      ...config,
    }
  }
}

/**
 * Add configuration for a new form type
 * @param {string} formType - Type of form
 * @param {Object} config - Form configuration
 */
export const addFormConfig = (formType, config) => {
  loggerConfig.forms[formType] = {
    ...loggerConfig.forms.generic,
    ...config,
  }
}

export default {
  loggerConfig,
  getFormConfig,
  isLoggingEnabled,
  isDrawerEnabled,
  updateFormConfig,
  addFormConfig,
}
