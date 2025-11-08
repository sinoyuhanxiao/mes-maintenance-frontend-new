/**
 * Converts UTC ISO date strings to "YYYY-MM-DD HH:MM:SS" format in browser local timezone
 * Handles various ISO formats: YYYY-MM-DDTHH:MM:SSZ, YYYY-MM-DD HH:MM:SS, etc.
 *
 * @param {string} value - ISO date string (UTC)
 * @returns {string|null} Formatted date string in local timezone or null if invalid
 */
export const formatIsoToDateTime = value => {
  if ( !value ) return null
  const raw = String( value ).trim()
  if ( !raw ) return null

  try {
    const date = new Date( raw )
    if ( isNaN( date.getTime() ) ) return null

    // Extract local time components (automatically converts from UTC)
    const year = date.getFullYear()
    const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
    const day = String( date.getDate() ).padStart( 2, '0' )
    const hours = String( date.getHours() ).padStart( 2, '0' )
    const minutes = String( date.getMinutes() ).padStart( 2, '0' )
    const seconds = String( date.getSeconds() ).padStart( 2, '0' )

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch ( e ) {
    return null
  }
}

/**
 * Formats a work order date field by extracting the value and normalizing it
 *
 * @param {Object} workOrder - Work order object
 * @param {string} key - Date field key to extract
 * @returns {string} Formatted date string or '-' if not available
 */
export const formatWorkOrderDate = ( workOrder, key ) => {
  const value = workOrder?.[key]
  if ( !value ) return '-'

  const formatted = formatIsoToDateTime( value )
  return formatted || '-'
}

/**
 * Formats any date/datetime value to YYYY-MM-DD format for date pickers
 * Handles: Already formatted dates, ISO datetime strings, UTC timestamps
 *
 * @param {string|Date} value - Date value to format
 * @returns {string|null} Date in YYYY-MM-DD format or null
 */
export const formatDateForDatePicker = value => {
  if ( !value ) return null

  const raw = String( value ).trim()
  if ( !raw ) return null

  // Already in YYYY-MM-DD format
  if ( /^\d{4}-\d{2}-\d{2}$/.test( raw ) ) {
    return raw
  }

  // ISO datetime or datetime with space separator
  const dateMatch = raw.match( /^(\d{4}-\d{2}-\d{2})/ )
  if ( dateMatch ) {
    return dateMatch[1]
  }

  // Try parsing as Date object (for UTC timestamps)
  try {
    const date = new Date( raw )
    if ( !isNaN( date.getTime() ) ) {
      const year = date.getUTCFullYear()
      const month = String( date.getUTCMonth() + 1 ).padStart( 2, '0' )
      const day = String( date.getUTCDate() ).padStart( 2, '0' )
      return `${year}-${month}-${day}`
    }
  } catch ( e ) {
    // Fall through to return null
  }

  return null
}

/**
 * Formats datetime value to YYYY-MM-DDTHH:mm:ss format for datetime pickers
 * Uses local timezone (not UTC)
 *
 * @param {string|Date} value - Datetime value to format
 * @returns {string|null} Datetime in YYYY-MM-DDTHH:mm:ss format or null
 */
export const formatDateTimeForPicker = value => {
  if ( !value ) return null

  const raw = String( value ).trim()
  if ( !raw ) return null

  try {
    const date = new Date( raw )
    if ( isNaN( date.getTime() ) ) return null

    const year = date.getFullYear()
    const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
    const day = String( date.getDate() ).padStart( 2, '0' )
    const hours = String( date.getHours() ).padStart( 2, '0' )
    const minutes = String( date.getMinutes() ).padStart( 2, '0' )
    const seconds = String( date.getSeconds() ).padStart( 2, '0' )

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  } catch ( e ) {
    return null
  }
}

/**
 * Appends a default time (HH:mm:ss) to a date value
 * Handles both date-only and datetime formats
 *
 * @param {string} dateValue - Date or datetime value
 * @param {string} defaultTime - Time to append (e.g., '00:00:00' or '23:59:59')
 * @returns {string|null} ISO-like string (YYYY-MM-DDTHH:mm:ss) or null
 */
export const withDefaultTime = ( dateValue, defaultTime = '00:00:00' ) => {
  if ( !dateValue ) return null

  const raw = String( dateValue ).trim()
  if ( !raw ) return null

  // If already has time component, return as-is (with T separator)
  const datetimeMatch = raw.match( /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/ )
  if ( datetimeMatch ) {
    return `${datetimeMatch[1]}T${datetimeMatch[2]}`
  }

  // If date-only format, append default time
  if ( /^\d{4}-\d{2}-\d{2}$/.test( raw ) ) {
    return `${raw}T${defaultTime}`
  }

  return null
}

/**
 * Converts local datetime string to UTC ISO string (ending with Z)
 * Used for backend payload preparation
 *
 * @param {string} localDateTimeString - Local datetime string (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD HH:mm:ss)
 * @returns {string|null} UTC ISO string or null
 */
export const toUtcIso = localDateTimeString => {
  if ( !localDateTimeString ) return null

  try {
    // Ensure T separator
    const normalized = String( localDateTimeString ).trim().replace( ' ', 'T' )
    const date = new Date( normalized )

    if ( isNaN( date.getTime() ) ) return null

    return date.toISOString()
  } catch ( e ) {
    return null
  }
}

/**
 * Applies formatDateForDatePicker to form date fields
 * Ensures consistent YYYY-MM-DD format for date pickers
 *
 * @param {Object} form - Form object with date fields
 * @returns {Object} Form object with normalized date fields
 */
export const normalizeDateFields = form => {
  if ( form.start_date ) {
    form.start_date = formatDateForDatePicker( form.start_date )
  }
  if ( form.due_date ) {
    form.due_date = formatDateForDatePicker( form.due_date )
  }
  if ( form.end_date ) {
    form.end_date = formatDateForDatePicker( form.end_date )
  }
  return form
}

/**
 * Extracts and formats date fields from backend work order payload
 * Uses only: start_date, due_date, end_date (with due_date → end_date fallback)
 *
 * @param {Object} workOrder - Work order object from backend
 * @returns {Object} Object with formatted start_date, due_date, end_date
 */
export const extractWorkOrderDates = workOrder => {
  if ( !workOrder ) {
    return { start_date : null, due_date : null, end_date : null }
  }

  return {
    start_date : formatDateForDatePicker( workOrder.start_date ),
    due_date : formatDateForDatePicker( workOrder.due_date || workOrder.end_date ),
    end_date : formatDateForDatePicker( workOrder.end_date || workOrder.due_date )
  }
}
