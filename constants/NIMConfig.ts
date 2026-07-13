const appKey = ''
const missingAppKeyMessage = '请先在 constants/NIMConfig.ts 中配置你自己的 AppKey'

const webTestEnvironment = {
  V2NIMLoginServiceConfig: {
    lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
    linkUrl: 'weblink.netease.im'
  }
} as const

const nativeTestEnvironment = {
  V2NIMLoginServiceConfig: {
    lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
    linkUrl: 'weblink.netease.im'
  }
} as const

export type NIMDebugLevel = 'debug' | 'log' | 'warn' | 'error' | 'off'

export const NIMConfig = {
  appkey: appKey,
  debugLevel: 'warn' as NIMDebugLevel,
  apiVersion: 'v2' as const,
  enableV2CloudConversation: false,
  binaryWebsocket: false,
  offlinePush: {
    apnsCertificateName: '',
    fcmCertificateName: '',
    hwPush: {
      appId: '',
      certificateName: ''
    },
    miPush: {
      appId: '',
      appKey: '',
      certificateName: ''
    },
    vivoPush: {
      appId: '',
      appKey: '',
      certificateName: ''
    },
    oppoPush: {
      appId: '',
      appKey: '',
      secret: '',
      certificateName: ''
    },
    honorPush: {
      appId: '',
      appKey: '',
      certificateName: ''
    },
    mzPush: {
      appId: '',
      appKey: '',
      certificateName: ''
    }
  },
  defaultLogin: {
    mobile: '',
    smsCode: ''
  },
  userCenter: {
    appKey,
    baseUrl: 'https://yiyong-user-center.netease.im',
    parentScope: 2,
    scope: 7,
    sendLoginSmsCodePath: '/userCenter/v1/auth/sendLoginSmsCode',
    loginRegisterByCodePath: '/userCenter/v1/auth/loginRegisterByCode'
  },
  storageKeys: {
    authSession: 'im2.auth.session',
    preferences: 'im2.preferences',
    forwardHistory: 'im2.forward.history',
    friendApplicationClearTimestamp: 'im2.friend.application.clear.timestamp',
    conversationClearedUnreadWatermarks: 'im2.conversation.cleared.unread.watermarks',
    conversationHiddenIds: 'im2.conversation.hidden.ids'
  },
  testEnvironment: webTestEnvironment,
  nativeTestEnvironment,
  webTestEnvironment
}

export function getMissingAppKeyMessage() {
  return missingAppKeyMessage
}

export function assertAppKeyConfigured() {
  if (!NIMConfig.appkey.trim()) {
    throw new Error(missingAppKeyMessage)
  }
}

// 环境配置类型
export type NIMEnvironmentConfig = typeof NIMConfig.testEnvironment
