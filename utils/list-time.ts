function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export function formatAndroidAlignedListTime(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const now = new Date()
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const time = `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
  const isToday =
    year === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return time
  }

  if (year === now.getFullYear()) {
    return `${month}月${day}日 ${time}`
  }

  return `${year}年${month}月${day}日`
}
