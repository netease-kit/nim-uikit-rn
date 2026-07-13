import { AppTranslationKey, translateCurrentApp } from '@/utils/app-language'
import { getNetworkUnavailableMessage, isKnownOffline } from '@/utils/network'

type ErrorLike = {
  code?: unknown
  desc?: unknown
  detail?: unknown
  errCode?: unknown
  errorCode?: unknown
  rawError?: unknown
  reason?: unknown
  rootRawError?: unknown
  message?: unknown
  msg?: unknown
  errMsg?: unknown
}

const SDK_ERROR_CODE_KEYS: Record<string, AppTranslationKey> = {
  '403': 'sdkErrorFeatureNotEnabled',
  '414': 'sdkErrorInvalidParameter',
  '416': 'sdkErrorOperationRateLimit',
  '191004': 'sdkErrorInvalidParameter',
  '191005': 'sdkErrorTimeout',
  '191006': 'sdkErrorResourceNotExist',
  '191007': 'sdkErrorResourceAlreadyExist',
  '192002': 'sdkErrorTimeout',
  '192004': 'sdkErrorTimeout',
  '102404': 'sdkErrorAccountNotExist',
  '102302': 'sdkErrorAIRobotTokenInvalid',
  '102304': 'sdkErrorNotAIAccount',
  '102308': 'sdkErrorNotAIAccount',
  '102309': 'sdkErrorAIRobotBindCodeNotExist',
  '102310': 'sdkErrorAIRobotNotBelongToUser',
  '102311': 'sdkErrorAIRobotQRCodeAlreadyBound',
  '102421': 'sdkErrorAccountChatBanned',
  '102422': 'sdkErrorAccountBanned',
  '102426': 'sdkErrorAccountInBlockList',
  '103404': 'sdkErrorUserProfileNotExist',
  '104302': 'sdkErrorFriendApplicationNotExist',
  '104404': 'sdkErrorFriendNotExist',
  '104405': 'sdkErrorFriendAlreadyExist',
  '104429': 'sdkErrorSelfFriendOperationNotAllowed',
  '104435': 'sdkErrorFriendLimit',
  '104449': 'sdkErrorFriendOperationRateLimit',
  '104451': 'sdkErrorFriendHitAntispam',
  '106429': 'sdkErrorSelfBlockListOperationNotAllowed',
  '106435': 'sdkErrorBlockListLimit',
  '106403': 'sdkErrorAIBlocklistNotAllowed',
  '107314': 'sdkErrorRevokeExpired',
  '107315': 'sdkErrorRevokeNotAllowed',
  '107319': 'sdkErrorPinLimit',
  '107320': 'sdkErrorPinNotExist',
  '107322': 'sdkErrorPinAlreadyExist',
  '107323': 'sdkErrorOperationRateLimit',
  '107404': 'sdkErrorMessageNotExist',
  '107406': 'sdkErrorRevokeExpired',
  '107410': 'sdkErrorAntispam',
  '107336': 'chatUnsupportedFormat',
  '107337': 'sdkErrorAIMessagesDisabled',
  '107451': 'sdkErrorAntispam',
  '108305': 'sdkErrorJoinedTeamLimit',
  '108306': 'sdkErrorTeamNormalMemberChatBanned',
  '108404': 'sdkErrorTeamNotExist',
  '108437': 'sdkErrorTeamMemberLimit',
  '109306': 'sdkErrorNoPermission',
  '109311': 'sdkErrorAlreadyInTeam',
  '109313': 'sdkErrorInvitationExpired',
  '109404': 'sdkErrorTeamMemberNotExist',
  '109424': 'sdkErrorTeamMemberChatBanned',
  '110404': 'sdkErrorConversationNotExist',
  '189308': 'sdkErrorAIRequestLLMFailed',
  '109432': 'sdkErrorNoPermission'
}

const SDK_ERROR_MESSAGE_KEYS: [RegExp, AppTranslationKey][] = [
  [/request entity too large/i, 'chatUploadRequestTooLarge'],
  [/status:\s*413/i, 'chatUploadRequestTooLarge'],
  [/^feature not enabled$/i, 'sdkErrorFeatureNotEnabled'],
  [/^invalid parameter$/i, 'sdkErrorInvalidParameter'],
  [/^parameter error$/i, 'sdkErrorInvalidParameter'],
  [/^timeout$/i, 'sdkErrorTimeout'],
  [/^request timeout$/i, 'sdkErrorTimeout'],
  [/^connect timeout$/i, 'sdkErrorTimeout'],
  [/^protocol timeout$/i, 'sdkErrorTimeout'],
  [/^resource not exist$/i, 'sdkErrorResourceNotExist'],
  [/^resource already exist$/i, 'sdkErrorResourceAlreadyExist'],
  [/^conversation (does )?not exist$/i, 'sdkErrorConversationNotExist'],
  [/^no permission$/i, 'sdkErrorNoPermission'],
  [/^AI robot token is invalid$/i, 'sdkErrorAIRobotTokenInvalid'],
  [/^AI robot account bind code does not exist$/i, 'sdkErrorAIRobotBindCodeNotExist'],
  [/^AI robot account does not belong to current user$/i, 'sdkErrorAIRobotNotBelongToUser'],
  [/^This QR code has already been bound$/i, 'sdkErrorAIRobotQRCodeAlreadyBound'],
  [/^AI robot account does not exist$/i, 'sdkErrorAccountNotExist'],
  [/^not an AI (robot )?account$/i, 'sdkErrorNotAIAccount'],
  [/^account not exist$/i, 'sdkErrorAccountNotExist'],
  [/^user profile not exist$/i, 'sdkErrorUserProfileNotExist'],
  [/^friend application not exist$/i, 'sdkErrorFriendApplicationNotExist'],
  [/^friend not exist$/i, 'sdkErrorFriendNotExist'],
  [/^friend already exist$/i, 'sdkErrorFriendAlreadyExist'],
  [/^self friend operation not allowed$/i, 'sdkErrorSelfFriendOperationNotAllowed'],
  [/^friend limit$/i, 'sdkErrorFriendLimit'],
  [/^friend operation rate limit$/i, 'sdkErrorFriendOperationRateLimit'],
  [/^friend hit antispam$/i, 'sdkErrorFriendHitAntispam'],
  [/^self block list operation not allowed$/i, 'sdkErrorSelfBlockListOperationNotAllowed'],
  [/^block list limit$/i, 'sdkErrorBlockListLimit'],
  [/^team member limit$/i, 'sdkErrorTeamMemberLimit'],
  [/^team invitation limit$/i, 'sdkErrorTeamMemberLimit'],
  [/^group member limit$/i, 'sdkErrorTeamMemberLimit'],
  [/^joined team limit$/i, 'sdkErrorJoinedTeamLimit'],
  [/^join team limit$/i, 'sdkErrorJoinedTeamLimit'],
  [/^joined team limit exceeded$/i, 'sdkErrorJoinedTeamLimit'],
  [/^member limit$/i, 'sdkErrorTeamMemberLimit'],
  [/team member.*limit/i, 'sdkErrorTeamMemberLimit'],
  [/team invitation.*limit/i, 'sdkErrorTeamMemberLimit'],
  [/group member.*limit/i, 'sdkErrorTeamMemberLimit'],
  [/joined team.*limit/i, 'sdkErrorJoinedTeamLimit'],
  [/join team.*limit/i, 'sdkErrorJoinedTeamLimit'],
  [/群组?人数.*上限/, 'sdkErrorTeamMemberLimit'],
  [/群成员.*上限/, 'sdkErrorTeamMemberLimit'],
  [/加入群组数量.*上限/, 'sdkErrorJoinedTeamLimit'],
  [/^team does not exist$/i, 'sdkErrorTeamNotExist'],
  [/^team not exist$/i, 'sdkErrorTeamNotExist'],
  [/^group does not exist$/i, 'sdkErrorTeamNotExist'],
  [/^group not exist$/i, 'sdkErrorTeamNotExist'],
  [/^already in (the )?team$/i, 'sdkErrorAlreadyInTeam'],
  [/^already in (the )?group$/i, 'sdkErrorAlreadyInTeam'],
  [/^team member already exit$/i, 'sdkErrorAlreadyInTeam'],
  [/^invitation expired$/i, 'sdkErrorInvitationExpired'],
  [/^the invitation has expired$/i, 'sdkErrorInvitationExpired'],
  [/^verification message has been processed$/i, 'sdkErrorVerificationProcessed'],
  [/^the verification message has been processed$/i, 'sdkErrorVerificationProcessed'],
  [/^user banned$/i, 'sdkErrorAccountBanned'],
  [/^user chat banned$/i, 'sdkErrorAccountChatBanned'],
  [/^team member does not exist$/i, 'sdkErrorTeamMemberNotExist'],
  [/^team normal member chat banned$/i, 'sdkErrorTeamNormalMemberChatBanned'],
  [/^team member chat banned$/i, 'sdkErrorTeamMemberChatBanned'],
  [/^failed request to the language model$/i, 'sdkErrorAIRequestLLMFailed'],
  [/^ai model request error$/i, 'sdkErrorAIRequestLLMFailed'],
  [/^AI messaging function not enabled$/i, 'sdkErrorAIMessagesDisabled'],
  [/^cannot blocklist an AI account$/i, 'sdkErrorAIBlocklistNotAllowed'],
  [/^AI messages must be of text$/i, 'chatUnsupportedFormat'],
  [/^message not exist$/i, 'sdkErrorMessageNotExist'],
  [/^pin not exist$/i, 'sdkErrorPinNotExist'],
  [/^PIN not exist$/i, 'sdkErrorPinNotExist'],
  [/^pin already exist$/i, 'sdkErrorPinAlreadyExist'],
  [/^pin limit$/i, 'sdkErrorPinLimit'],
  [/^unsending message expired$/i, 'sdkErrorRevokeExpired'],
  [/^revoke message exceed time limit$/i, 'sdkErrorRevokeExpired'],
  [/^revoke specific message not allowed$/i, 'sdkErrorRevokeNotAllowed'],
  [/not allowed/i, 'sdkErrorOperationNotAllowed'],
  [/not support|unsupported/i, 'sdkErrorUnsupported'],
  [/^account in block list$/i, 'sdkErrorAccountInBlockList'],
  [/^file upload failed$/i, 'sdkErrorFileUploadFailed'],
  [/^upload failed$/i, 'sdkErrorFileUploadFailed'],
  [/^connect failed$/i, 'sdkErrorConnectFailed'],
  [/^protocol send failed$/i, 'sdkErrorProtocolSendFailed'],
  [/^request failed$/i, 'sdkErrorRequestFailed'],
  [/^callback failed$/i, 'sdkErrorCallbackFailed'],
  [/rate limit/i, 'sdkErrorOperationRateLimit'],
  [/antispam/i, 'sdkErrorAntispam']
]
const ILLEGAL_STATE_ERROR_CODE = '190002'
const UPLOAD_ENTITY_TOO_LARGE_PATTERNS = [/request entity too large/i, /status:\s*413/i]

function getErrorLike(error: unknown): ErrorLike {
  if (error instanceof Error) {
    return error as ErrorLike
  }

  if (typeof error === 'object' && error) {
    return error as ErrorLike
  }

  return {}
}

function getErrorCode(error: ErrorLike) {
  const code = error.code ?? error.errCode ?? error.errorCode
  return typeof code === 'number' || typeof code === 'string' ? String(code).trim() : ''
}

function getRawErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error.trim()
  }

  const candidate = getErrorLike(error)
  const message = candidate.errMsg ?? candidate.msg ?? candidate.message ?? candidate.desc
  return typeof message === 'string' ? message.trim() : ''
}

function collectErrorText(value: unknown, seen = new Set<object>(), depth = 0): string[] {
  if (depth > 4 || value == null) {
    return []
  }

  if (typeof value === 'string') {
    return [value]
  }

  if (typeof value !== 'object') {
    return []
  }

  if (seen.has(value)) {
    return []
  }
  seen.add(value)

  const error = value as ErrorLike
  const texts = [error.errMsg, error.msg, error.message, error.desc, error.reason].filter(
    (item): item is string => typeof item === 'string'
  )

  if (error.detail) {
    texts.push(...collectErrorText(error.detail, seen, depth + 1))
  }
  if (error.rawError) {
    texts.push(...collectErrorText(error.rawError, seen, depth + 1))
  }
  if (error.rootRawError) {
    texts.push(...collectErrorText(error.rootRawError, seen, depth + 1))
  }

  if (depth < 2) {
    Object.values(value as Record<string, unknown>).forEach((item) => {
      texts.push(...collectErrorText(item, seen, depth + 1))
    })
  }

  return texts
}

function isUploadEntityTooLargeError(error: unknown) {
  return collectErrorText(error).some((text) =>
    UPLOAD_ENTITY_TOO_LARGE_PATTERNS.some((pattern) => pattern.test(text))
  )
}

function isIllegalStateMessage(message: string) {
  return /illegal state/i.test(message.trim())
}

export function isIllegalStateLikeError(error: unknown) {
  const errorLike = getErrorLike(error)
  return (
    getErrorCode(errorLike) === ILLEGAL_STATE_ERROR_CODE ||
    isIllegalStateMessage(getRawErrorMessage(error))
  )
}

export function normalizeDisplayErrorMessage(message: string, fallback?: string) {
  const rawMessage = message.trim()

  if (!rawMessage) {
    return fallback || ''
  }

  if (isKnownOffline() && isIllegalStateMessage(rawMessage)) {
    return getNetworkUnavailableMessage()
  }

  const matched = SDK_ERROR_MESSAGE_KEYS.find(([pattern]) => pattern.test(rawMessage))
  if (matched) {
    return translateCurrentApp(matched[1])
  }

  return rawMessage
}

export function getDisplayErrorMessage(error: unknown, fallback: string) {
  if (isKnownOffline() && isIllegalStateLikeError(error)) {
    return getNetworkUnavailableMessage()
  }

  if (isUploadEntityTooLargeError(error)) {
    return translateCurrentApp('chatUploadRequestTooLarge')
  }

  const errorCode = getErrorCode(getErrorLike(error))
  const codeKey = errorCode ? SDK_ERROR_CODE_KEYS[errorCode] : undefined

  if (codeKey) {
    return translateCurrentApp(codeKey)
  }

  return normalizeDisplayErrorMessage(getRawErrorMessage(error), fallback) || fallback
}
