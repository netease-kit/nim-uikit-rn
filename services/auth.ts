import {
  hasConfiguredNIMAppKey,
  NIM_APP_KEY_REQUIRED_MESSAGE,
  NIMConfig
} from '@/constants/NIMConfig'

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

async function postJson<T>(path: string, payload: Record<string, string>): Promise<T> {
  if (!hasConfiguredNIMAppKey()) {
    throw new Error(NIM_APP_KEY_REQUIRED_MESSAGE)
  }

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
    throw Object.assign(error, body)
  }

  return body.data
}

export const requestLoginSmsCode = (mobile: string) =>
  postJson<LoginSmsCodeResponse>(NIMConfig.userCenter.sendLoginSmsCodePath, { mobile })

export const loginRegisterByCode = (mobile: string, smsCode: string) =>
  postJson<LoginRegisterByCodeResponse>(NIMConfig.userCenter.loginRegisterByCodePath, {
    mobile,
    smsCode
  })
