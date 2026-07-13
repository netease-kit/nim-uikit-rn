export const AMAP_WEB_API_KEY = '78c0eb6bff7db9ed52e07ca7051a97a3'

export function isValidMapCoordinate(latitude?: number, longitude?: number) {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  )
}

export function getAmapStaticMapUrl(latitude?: number, longitude?: number, size = '500*200') {
  if (!isValidMapCoordinate(latitude, longitude)) {
    return ''
  }

  return `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=15&size=${size}&key=${AMAP_WEB_API_KEY}`
}

export function resolveLocationText(messageText?: string, attachmentAddress?: string) {
  const titleText = messageText?.trim() || ''
  const addressText = attachmentAddress?.trim() || ''

  if (titleText && addressText && titleText !== addressText) {
    return {
      title: titleText,
      subtitle: addressText
    }
  }

  const source = titleText || addressText

  if (!source) {
    return {
      title: '位置',
      subtitle: '暂无详细地址'
    }
  }

  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return {
      title: parts[0],
      subtitle: parts.slice(1).join(' ')
    }
  }

  return {
    title: source,
    subtitle: addressText && addressText !== source ? addressText : '暂无详细地址'
  }
}
