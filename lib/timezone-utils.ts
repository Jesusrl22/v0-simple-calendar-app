export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getTimezoneOffset() {
  const now = new Date()
  return -now.getTimezoneOffset() * 60 * 1000
}

export function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export function formatDateTimeForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Removed createLocalDate function as it is no longer needed
// Removed convertToUTCForStorage function as it is no longer needed
