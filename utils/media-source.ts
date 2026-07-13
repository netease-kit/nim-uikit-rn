import type {
  V2NIMMessageFileAttachment,
  V2NIMMessageImageAttachment,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'

const HTTPS_CAPABLE_NOS_HOSTS = new Set(['nim-nosdn.yunxinsvr.com', 'nim.nosdn.127.net'])

export function normalizeMediaRenderSource(source?: string | null) {
  if (!source) {
    return ''
  }

  if (!source.startsWith('http://')) {
    return source
  }

  try {
    const url = new URL(source)

    if (HTTPS_CAPABLE_NOS_HOSTS.has(url.hostname)) {
      url.protocol = 'https:'
      return url.toString()
    }
  } catch {
    return source
  }

  return source
}

function isAbsoluteLocalFilePath(source?: string | null) {
  return !!source && source.startsWith('/')
}

function normalizeAttachmentPath(source?: string | null) {
  if (!source) {
    return ''
  }

  if (source.startsWith('file://') || source.startsWith('content://')) {
    return source
  }

  if (isAbsoluteLocalFilePath(source)) {
    return `file://${source}`
  }

  return source
}

export function isLocalAttachmentSource(source?: string | null) {
  return !!source && normalizeAttachmentPath(source) !== source
    ? true
    : !!source && (source.startsWith('file://') || source.startsWith('content://'))
}

export function getAttachmentRemoteOrLocalSource(
  attachment?: {
    path?: string | null
    url?: string | null
  } | null
) {
  const normalizedPath = normalizeAttachmentPath(attachment?.path)
  const localPath = isLocalAttachmentSource(attachment?.path) ? normalizedPath : ''
  const remoteUrl = normalizeMediaRenderSource(attachment?.url)
  const fallbackPath = normalizeMediaRenderSource(normalizedPath)

  return localPath || remoteUrl || fallbackPath
}

export function getImageRenderSource(attachment?: V2NIMMessageImageAttachment | null) {
  return getAttachmentRemoteOrLocalSource(attachment)
}

export function getVideoRenderSource(attachment?: V2NIMMessageVideoAttachment | null) {
  return getAttachmentRemoteOrLocalSource(attachment)
}

function normalizeExtension(extension?: string | null) {
  return extension?.trim().replace(/^\./, '').toLowerCase() || ''
}

function getExtensionFromFileName(fileName?: string | null) {
  const normalizedName = fileName?.trim()
  const match = normalizedName?.match(/\.([A-Za-z0-9]{1,12})$/)

  return normalizeExtension(match?.[1])
}

function getParsedAttachmentRaw(attachment?: { raw?: unknown } | null) {
  const raw = attachment?.raw

  if (!raw) {
    return null
  }

  if (typeof raw === 'object') {
    return raw as Record<string, unknown>
  }

  if (typeof raw !== 'string') {
    return null
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function getStringField(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function getAttachmentExtension(
  attachment?: {
    ext?: string | null
    name?: string | null
    raw?: unknown
  } | null
) {
  const parsedRaw = getParsedAttachmentRaw(attachment)

  return (
    normalizeExtension(attachment?.ext) ||
    getExtensionFromFileName(attachment?.name) ||
    normalizeExtension(getStringField(parsedRaw?.ext)) ||
    getExtensionFromFileName(getStringField(parsedRaw?.name)) ||
    getExtensionFromFileName(getStringField(parsedRaw?.url))
  )
}

export function getFileTransferSource(attachment?: V2NIMMessageFileAttachment | null) {
  return getAttachmentRemoteOrLocalSource(attachment)
}

export function getMediaRenderSource(
  attachment?: V2NIMMessageImageAttachment | V2NIMMessageVideoAttachment | null
) {
  return attachment && 'duration' in attachment
    ? getVideoRenderSource(attachment)
    : getImageRenderSource(attachment as V2NIMMessageImageAttachment | null | undefined)
}
