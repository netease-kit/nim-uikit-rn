import { assertAppKeyConfigured, NIMConfig } from '@/constants/NIMConfig'
import { getConfirmedOfflineMessage } from '@/utils/network'

export type LoginSmsCodeResponse = {
  isFirstRegister: boolean
}

export type LoginRegisterByCodeResponse = {
  accessToken: string
  imAccid: string
  imToken: string
}

type ApiEnvelope<T> = {
  code: number
  data: T
  msg?: string
  errMsg?: string
  message?: string
}

type ApiError = Error & {
  code?: number
  errMsg?: string
  msg?: string
  status?: number
  causeMessage?: string
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    const candidate = error as Record<string, unknown>
    const message = candidate.errMsg ?? candidate.msg ?? candidate.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return 'Request failed'
}

async function normalizeAuthError(error: unknown) {
  const offlineMessage = await getConfirmedOfflineMessage()
  const message = offlineMessage ?? extractErrorMessage(error)
  const normalizedError = new Error(message) as ApiError

  if (typeof error === 'object' && error) {
    Object.assign(normalizedError, error)
  }

  normalizedError.causeMessage = extractErrorMessage(error)
  return normalizedError
}

async function postJson<T>(path: string, payload: Record<string, string>): Promise<T> {
  try {
    assertAppKeyConfigured()

    const response = await fetch(`${NIMConfig.userCenter.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        appKey: NIMConfig.userCenter.appKey,
        parentScope: String(NIMConfig.userCenter.parentScope),
        scope: String(NIMConfig.userCenter.scope)
      },
      body: JSON.stringify(payload)
    })

    const body = (await response.json()) as ApiEnvelope<T>

    if (!response.ok || body.code !== 200) {
      const error = new Error(body.errMsg || body.msg || body.message || 'Request failed')
      throw Object.assign(error, body, { status: response.status })
    }

    return body.data
  } catch (error) {
    console.warn('[auth] request failed', {
      path,
      payload,
      message: extractErrorMessage(error),
      error
    })
    throw await normalizeAuthError(error)
  }
}

export const requestLoginSmsCode = (mobile: string) =>
  postJson<LoginSmsCodeResponse>(NIMConfig.userCenter.sendLoginSmsCodePath, { mobile })

export const loginRegisterByCode = (mobile: string, smsCode: string) =>
  postJson<LoginRegisterByCodeResponse>(NIMConfig.userCenter.loginRegisterByCodePath, {
    mobile,
    smsCode
  })
