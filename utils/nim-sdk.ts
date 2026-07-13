/* eslint-disable @typescript-eslint/no-redeclare */
import type { V2NIM as NIMInstance } from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK'
import type {
  V2NIMAIModelRoleType as NIMAIModelRoleType,
  V2NIMAIUser as NIMAIUser
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMAIService'
import type { V2NIMConversationType as NIMConversationType } from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMConversationService'
import type {
  V2NIMFriend as NIMFriend,
  V2NIMFriendAddApplication as NIMFriendAddApplication,
  V2NIMFriendAddApplicationStatus as NIMFriendAddApplicationStatus,
  V2NIMFriendAddMode as NIMFriendAddMode
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMFriendService'
import type { V2NIMLocalConversation as NIMLocalConversation } from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMLocalConversationService'
import type { V2NIMKickedOfflineDetail as NIMKickedOfflineDetail } from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMLoginService'
import type {
  V2NIMClientAntispamOperateType as NIMClientAntispamOperateType,
  V2NIMCollection as NIMCollection,
  V2NIMMessage as NIMMessage,
  V2NIMMessageAIConfigParams as NIMMessageAIConfigParams,
  V2NIMMessageAttachment as NIMMessageAttachment,
  V2NIMMessageAudioAttachment as NIMMessageAudioAttachment,
  V2NIMMessageCallAttachment as NIMMessageCallAttachment,
  V2NIMMessageCustomAttachment as NIMMessageCustomAttachment,
  V2NIMMessageFileAttachment as NIMMessageFileAttachment,
  V2NIMMessageImageAttachment as NIMMessageImageAttachment,
  V2NIMMessageLocationAttachment as NIMMessageLocationAttachment,
  V2NIMMessagePin as NIMMessagePin,
  V2NIMMessagePinNotification as NIMMessagePinNotification,
  V2NIMMessagePinState as NIMMessagePinState,
  V2NIMMessageRefer as NIMMessageRefer,
  V2NIMMessageRevokeNotification as NIMMessageRevokeNotification,
  V2NIMMessageSendingState as NIMMessageSendingState,
  V2NIMMessageType as NIMMessageType,
  V2NIMMessageVideoAttachment as NIMMessageVideoAttachment,
  V2NIMP2PMessageReadReceipt as NIMP2PMessageReadReceipt,
  V2NIMSendMessageParams as NIMSendMessageParams,
  V2NIMTeamMessageReadReceipt as NIMTeamMessageReadReceipt,
  V2NIMTeamMessageReadReceiptDetail as NIMTeamMessageReadReceiptDetail
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMMessageService'
import type {
  V2NIMP2PMessageMuteMode as NIMP2PMessageMuteMode,
  V2NIMTeamMessageMuteMode as NIMTeamMessageMuteMode
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMSettingService'
import type {
  V2NIMCreateTeamResult as NIMCreateTeamResult,
  V2NIMTeam as NIMTeam,
  V2NIMTeamAgreeMode as NIMTeamAgreeMode,
  V2NIMTeamChatBannedMode as NIMTeamChatBannedMode,
  V2NIMTeamInviteMode as NIMTeamInviteMode,
  V2NIMTeamJoinMode as NIMTeamJoinMode,
  V2NIMTeamMember as NIMTeamMember,
  V2NIMTeamMemberRole as NIMTeamMemberRole,
  V2NIMTeamType as NIMTeamType,
  V2NIMTeamUpdateExtensionMode as NIMTeamUpdateExtensionMode,
  V2NIMTeamUpdateInfoMode as NIMTeamUpdateInfoMode,
  V2NIMUpdateTeamInfoParams as NIMUpdateTeamInfoParams
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMTeamService'
import type {
  V2NIMUser as NIMUser,
  V2NIMUserUpdateParams as NIMUserUpdateParams
} from 'nim-web-sdk-ng/dist/v2/NIM_RN_SDK/V2NIMUserService'
import { AppState, Platform } from 'react-native'

import { installNativeCameraCaptureAppStateGuard } from './native-capture-state'

type NIMRuntimeModule = {
  default?: {
    getInstance: (...args: any[]) => NIMInstance
  }
  V2NIMConst?: Record<string, any>
}

let runtimeModule: NIMRuntimeModule | null = null
let runtimeModuleLoaded = false

function isServerRender() {
  return typeof window === 'undefined'
}

export function isIgnorableNIMLog(args: unknown[]) {
  return args.some((item) => {
    if (typeof item !== 'string') {
      return false
    }

    return (
      item.includes('parseCmd:: mapper not exist 28_21 200') ||
      item.includes('OfflinePushService:: token is empty') ||
      item.includes('Core::emit event: pushEvents process takes') ||
      item.includes('imsocket::Websocket onerror') ||
      item.includes('TimeOrigin::setOriginTimetick: denied RTT') ||
      item.includes('TimeOrigin::setOriginTimetick: ignore RTT') ||
      (item.includes('clientSocketV2::NIM login status is') &&
        item.includes('so can not sendCmd subscribeEvent')) ||
      item.includes('clientSocketV2::NIM login status is 0, so can not sendCmd v2SetAppBackground')
    )
  })
}

function patchNIMConsoleNoise() {
  const consoleWithPatchFlag = console as typeof console & {
    __im2NIMConsolePatched__?: boolean
    __im2OriginalConsoleError__?: typeof console.error
  }

  if (consoleWithPatchFlag.__im2NIMConsolePatched__) {
    return
  }

  consoleWithPatchFlag.__im2NIMConsolePatched__ = true
  consoleWithPatchFlag.__im2OriginalConsoleError__ = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    if (isIgnorableNIMLog(args)) {
      return
    }

    consoleWithPatchFlag.__im2OriginalConsoleError__?.(...args)
  }
}

function loadRuntimeModule(): NIMRuntimeModule | null {
  if (runtimeModuleLoaded) {
    return runtimeModule
  }

  if (isServerRender()) {
    runtimeModuleLoaded = true
    return runtimeModule
  }

  patchNIMConsoleNoise()
  if (Platform.OS !== 'web') {
    installNativeCameraCaptureAppStateGuard(AppState)
  }

  runtimeModule =
    typeof document !== 'undefined'
      ? require('nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK')
      : require('nim-web-sdk-ng/dist/v2/NIM_RN_SDK')
  runtimeModuleLoaded = true

  return runtimeModule
}

const runtime = loadRuntimeModule()
const NIM = runtime?.default ?? null
const V2NIMConst = runtime?.V2NIMConst ?? {}

export default NIM
export { V2NIMConst }

export const V2NIMClientAntispamOperateType = (V2NIMConst as any).V2NIMClientAntispamOperateType
export const V2NIMConversationType = (V2NIMConst as any).V2NIMConversationType
export const V2NIMDataSyncLevel = (V2NIMConst as any).V2NIMDataSyncLevel
export const V2NIMDataSyncState = (V2NIMConst as any).V2NIMDataSyncState
export const V2NIMDataSyncType = (V2NIMConst as any).V2NIMDataSyncType
export const V2NIMFriendAddApplicationType = (V2NIMConst as any).V2NIMFriendAddApplicationType
export const V2NIMFriendAddApplicationStatus = (V2NIMConst as any).V2NIMFriendAddApplicationStatus
export const V2NIMFriendAddMode = (V2NIMConst as any).V2NIMFriendAddMode
export const V2NIMLoginStatus = (V2NIMConst as any).V2NIMLoginStatus
export const V2NIMMessagePinState = (V2NIMConst as any).V2NIMMessagePinState
export const V2NIMMessageSendingState = (V2NIMConst as any).V2NIMMessageSendingState
export const V2NIMMessageType = (V2NIMConst as any).V2NIMMessageType
export const V2NIMP2PMessageMuteMode = (V2NIMConst as any).V2NIMP2PMessageMuteMode
export const V2NIMTeamAgreeMode = (V2NIMConst as any).V2NIMTeamAgreeMode
export const V2NIMTeamChatBannedMode = (V2NIMConst as any).V2NIMTeamChatBannedMode
export const V2NIMTeamInviteMode = (V2NIMConst as any).V2NIMTeamInviteMode
export const V2NIMTeamJoinMode = (V2NIMConst as any).V2NIMTeamJoinMode
export const V2NIMTeamMemberRole = (V2NIMConst as any).V2NIMTeamMemberRole
export const V2NIMTeamMessageMuteMode = (V2NIMConst as any).V2NIMTeamMessageMuteMode
export const V2NIMTeamType = (V2NIMConst as any).V2NIMTeamType
export const V2NIMTeamUpdateExtensionMode = (V2NIMConst as any).V2NIMTeamUpdateExtensionMode
export const V2NIMTeamUpdateInfoMode = (V2NIMConst as any).V2NIMTeamUpdateInfoMode
export const V2NIMUserStatusType = (V2NIMConst as any).V2NIMUserStatusType

export type V2NIM = NIMInstance
export type V2NIMAIUser = NIMAIUser
export type V2NIMClientAntispamOperateType = NIMClientAntispamOperateType
export type V2NIMCollection = NIMCollection
export type V2NIMMessageAIConfigParams = NIMMessageAIConfigParams
export type V2NIMAIModelRoleType = NIMAIModelRoleType
export type V2NIMConversationType = NIMConversationType
export type V2NIMCreateTeamResult = NIMCreateTeamResult
export type V2NIMFriend = NIMFriend
export type V2NIMFriendAddApplication = NIMFriendAddApplication
export type V2NIMFriendAddApplicationStatus = NIMFriendAddApplicationStatus
export type V2NIMFriendAddMode = NIMFriendAddMode
export type V2NIMKickedOfflineDetail = NIMKickedOfflineDetail
export type V2NIMLocalConversation = NIMLocalConversation
export type V2NIMMessage = NIMMessage
export type V2NIMMessageAttachment = NIMMessageAttachment
export type V2NIMMessageAudioAttachment = NIMMessageAudioAttachment
export type V2NIMMessageCallAttachment = NIMMessageCallAttachment
export type V2NIMMessageCustomAttachment = NIMMessageCustomAttachment
export type V2NIMMessageFileAttachment = NIMMessageFileAttachment
export type V2NIMMessageImageAttachment = NIMMessageImageAttachment
export type V2NIMMessageLocationAttachment = NIMMessageLocationAttachment
export type V2NIMMessagePin = NIMMessagePin
export type V2NIMMessagePinNotification = NIMMessagePinNotification
export type V2NIMMessagePinState = NIMMessagePinState
export type V2NIMMessageRefer = NIMMessageRefer
export type V2NIMMessageRevokeNotification = NIMMessageRevokeNotification
export type V2NIMMessageSendingState = NIMMessageSendingState
export type V2NIMMessageType = NIMMessageType
export type V2NIMMessageVideoAttachment = NIMMessageVideoAttachment
export type V2NIMP2PMessageMuteMode = NIMP2PMessageMuteMode
export type V2NIMP2PMessageReadReceipt = NIMP2PMessageReadReceipt
export type V2NIMSendMessageParams = NIMSendMessageParams
export type V2NIMTeamAgreeMode = NIMTeamAgreeMode
export type V2NIMTeam = NIMTeam
export type V2NIMTeamChatBannedMode = NIMTeamChatBannedMode
export type V2NIMTeamInviteMode = NIMTeamInviteMode
export type V2NIMTeamJoinMode = NIMTeamJoinMode
export type V2NIMTeamMember = NIMTeamMember
export type V2NIMTeamMemberRole = NIMTeamMemberRole
export type V2NIMTeamMessageMuteMode = NIMTeamMessageMuteMode
export type V2NIMTeamMessageReadReceipt = NIMTeamMessageReadReceipt
export type V2NIMTeamMessageReadReceiptDetail = NIMTeamMessageReadReceiptDetail
export type V2NIMTeamType = NIMTeamType
export type V2NIMTeamUpdateExtensionMode = NIMTeamUpdateExtensionMode
export type V2NIMTeamUpdateInfoMode = NIMTeamUpdateInfoMode
export type V2NIMUpdateTeamInfoParams = NIMUpdateTeamInfoParams
export type V2NIMUser = NIMUser
export type V2NIMUserUpdateParams = NIMUserUpdateParams
