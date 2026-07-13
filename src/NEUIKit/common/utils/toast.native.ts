import { normalizeDisplayErrorMessage } from '@/utils/error-message'

import { showNativeToast } from './native-toast-host'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  message: string
  duration?: number
  type?: ToastType
}

export const showToast = (options: ToastOptions | string) => {
  const resolved = typeof options === 'string' ? { message: options } : options
  const message = normalizeDisplayErrorMessage(resolved.message || '')

  if (!message) {
    return
  }

  showNativeToast({ message, duration: resolved.duration, type: resolved.type })
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

export const toast = {
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
  alert: showAlertToast,
  success: (message: string, duration?: number) =>
    showToast({ message, type: 'success', duration }),
  warning: (message: string, duration?: number) =>
    showToast({ message, type: 'warning', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration })
}
