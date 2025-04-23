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

