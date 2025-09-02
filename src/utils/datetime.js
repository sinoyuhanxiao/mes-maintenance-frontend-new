// src/utils/datetime.js

/**
 * Converts a UTC date string to local time in 'YYYY-MM-DD HH:MM:SS' format.
 * @param {string} utcDateString - The UTC date string to convert.
 * @returns {string} The formatted local time string.
 */
export function convertToLocalTime( utcDateString ) {
  const date = new Date( utcDateString )

  // Extract year, month, day, hour, minute, second
  const year = date.getFullYear()
  const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
  const day = String( date.getDate() ).padStart( 2, '0' )
  const hour = String( date.getHours() ).padStart( 2, '0' )
  const minute = String( date.getMinutes() ).padStart( 2, '0' )
  const second = String( date.getSeconds() ).padStart( 2, '0' )

  // Return formatted date string
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * Returns the user's current IANA time zone string, like 'Asia/Shanghai' or 'America/Vancouver'.
 * @returns {string} The current time zone.
 */
export function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// datetime picker to utc
export function convertToUTC( localDateString ) {
  const date = new Date( localDateString )
  const utcDateString = date.toISOString()
  return utcDateString
}

/**
 * Converts an ISO date string to local time and formats as 'YYYY-MM-DD HH:mm:ss'.
 * Safe fallback for null/invalid input.
 *
 * @param {string} isoDateString - The UTC/ISO date string to convert.
 * @returns {string} The formatted local time string.
 */
export function formatAsLocalDateTimeString( isoDateString ) {
  if ( !isoDateString ) {
    return '-'
  }

  const date = new Date( isoDateString )
  if ( isNaN( date ) ) {
    return '-'
  }

  const pad = n => String( n ).padStart( 2, '0' )

  return (
    `${date.getFullYear()}-${pad( date.getMonth() + 1 )}-${pad( date.getDate() )} ` +
      `${pad( date.getHours() )}:${pad( date.getMinutes() )}:${pad( date.getSeconds() )}`
  )
}

/**
 * Converts a Date object (from el-time-picker) to an offset time string: "HH:mm:ss+00:00"
 */
export function formatDateObjectToOffsetTime( dateObj ) {
  if ( !( dateObj instanceof Date ) || isNaN( dateObj ) ) {
    return null
  }

  return dateObj.toISOString().substring( 11, 19 ) + getLocalOffsetString()
}

/**
 * Returns local timezone offset in "+HH:MM" or "-HH:MM" format.
 */
export function getLocalOffsetString() {
  const offsetMinutes = new Date().getTimezoneOffset()
  const sign = offsetMinutes > 0 ? '-' : '+'
  const abs = Math.abs( offsetMinutes )
  const hh = String( Math.floor( abs / 60 ) ).padStart( 2, '0' )
  const mm = String( abs % 60 ).padStart( 2, '0' )

  return `${sign}${hh}:${mm}`
}
