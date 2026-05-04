const appKey = ''

export const NIM_APP_KEY_REQUIRED_MESSAGE =
  '示例项目未内置 AppKey，请先在 constants/NIMConfig.ts 中配置你自己的云信 AppKey'

export const hasConfiguredNIMAppKey = () => appKey.trim().length > 0

export const NIMConfig = {
  appkey: appKey,
  debugLevel: 'debug' as const,
  apiVersion: 'v2' as const,
  enableV2CloudConversation: true,
  binaryWebsocket: false,
  defaultLogin: {
    mobile: '',
    smsCode: ''
  },
  userCenter: {
    appKey: appKey,
    baseUrl: 'https://yiyong-user-center.netease.im',
    parentScope: 2,
    scope: 7,
    sendLoginSmsCodePath: '/userCenter/v1/auth/sendLoginSmsCode',
    loginRegisterByCodePath: '/userCenter/v1/auth/loginRegisterByCode'
  },
  storageKeys: {
    authSession: 'im2.auth.session',
    preferences: 'im2.preferences',
    forwardHistory: 'im2.forward.history'
  },
  // 测试环境配置
  testEnvironment: {
    V2NIMLoginServiceConfig: {
      lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
      linkUrl: 'weblink.netease.im'
    }
  }
}

// 环境配置类型
export type NIMEnvironmentConfig = typeof NIMConfig.testEnvironment
