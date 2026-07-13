import { normalizeDisplayErrorMessage } from '@/utils/error-message'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  /**
   * 提示文本
   */
  message: string
  /**
   * 展示时间，单位毫秒
   * @default 2000
   */
  duration?: number
  /**
   * 提示类型
   * @default "info"
   */
  type?: ToastType
}

let container: HTMLDivElement | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const toastBackgroundByType: Record<ToastType, string> = {
  info: 'rgba(0, 0, 0, 0.78)',
  success: 'rgba(0, 0, 0, 0.78)',
  warning: 'rgba(250, 173, 20, 0.9)',
  error: 'rgba(255, 77, 79, 0.9)'
}

/**
 * 显示Toast提示
 * @param options Toast配置项或提示文本
 */
export const showToast = (options: ToastOptions | string) => {
  const opt = typeof options === 'string' ? { message: options } : options
  const message = normalizeDisplayErrorMessage(opt.message || '')

  if (!message || typeof document === 'undefined') {
    return
  }

  if (!container) {
    container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '50%'
    container.style.top = '50%'
    container.style.transform = 'translate(-50%, -50%)'
    container.style.zIndex = '9999'
    container.style.pointerEvents = 'none'
    container.style.maxWidth = '80vw'
    container.style.borderRadius = '8px'
    container.style.padding = '10px 18px'
    container.style.color = '#fff'
    container.style.fontSize = '14px'
    container.style.lineHeight = '20px'
    container.style.textAlign = 'center'
    container.style.wordBreak = 'break-word'
    container.style.whiteSpace = 'pre-line'
    container.style.opacity = '0'
    container.style.transition = 'opacity 160ms ease, transform 160ms ease'
    document.body.appendChild(container)
  }

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  container.textContent = message
  container.style.backgroundColor = toastBackgroundByType[opt.type || 'info']
  container.style.opacity = '1'
  container.style.transform = 'translate(-50%, -50%)'

  const duration = opt.duration || 2000
  hideTimer = setTimeout(() => {
    if (!container) {
      return
    }

    container.style.opacity = '0'
    container.style.transform = 'translate(-50%, calc(-50% + 8px))'

    setTimeout(() => {
      if (container) {
        document.body.removeChild(container)
        container = null
      }
    }, 180)
  }, duration)
}

export const formatAlertToastMessage = (title?: string, message?: string) => {
  const normalizedMessage = normalizeDisplayErrorMessage(message || '')
  const normalizedTitle = `${title || ''}`.trim()

  return normalizedMessage || normalizedTitle
}

export const showAlertToast = (title?: string, message?: string, duration?: number) => {
  const formattedMessage = formatAlertToastMessage(title, message)

  if (!formattedMessage) {
    return
  }

  showToast({ message: formattedMessage, type: 'info', duration })
}

/**
 * Toast快捷方法
 */
export const toast = {
  /**
   * 显示普通提示
   */
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),

  alert: showAlertToast,

  /**
   * 显示成功提示
   */
  success: (message: string, duration?: number) =>
    showToast({ message, type: 'success', duration }),

  /**
   * 显示警告提示
   */
  warning: (message: string, duration?: number) =>
    showToast({ message, type: 'warning', duration }),

  /**
   * 显示错误提示
   */
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration })
}
