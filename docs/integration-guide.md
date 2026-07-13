# IM2 RN Demo 接入文档

本文档用于把当前 `release/v10.0.0` Demo 接到你自己的云信应用环境。仓库内已做脱敏处理，所有需要替换的配置都以空值或示例值保留。

## 1. 接入前准备

你需要先准备：

1. 一个已开通 IM 的云信应用，并拿到 `AppKey`
2. 可用于短信验证码登录的用户中心环境
3. 至少一个可登录测试手机号
4. 可选的原生推送和签名材料

## 2. 必改配置

### 2.1 `constants/NIMConfig.ts`

仓库默认不再携带共享 `AppKey`。首次接入时，至少替换下面这些字段：

```ts
const appKey = 'your_app_key_here'

export const NIMConfig = {
  appkey: appKey,
  defaultLogin: {
    mobile: '',
    smsCode: ''
  },
  userCenter: {
    appKey,
    baseUrl: 'https://your-user-center-host',
    parentScope: 2,
    scope: 7,
    sendLoginSmsCodePath: '/userCenter/v1/auth/sendLoginSmsCode',
    loginRegisterByCodePath: '/userCenter/v1/auth/loginRegisterByCode'
  }
}
```

说明：

- `appkey` 和 `userCenter.appKey` 应保持一致。
- `defaultLogin` 仅用于本地调试预填，不建议提交真实手机号和验证码。
- `baseUrl`、`parentScope`、`scope`、接口路径需要按你的真实环境调整。

未配置 `AppKey` 时，应用会直接报错：`请先在 constants/NIMConfig.ts 中配置你自己的 AppKey`。

### 2.2 `app.json`

如果你要打自己的安装包，而不是只跑 Demo，请同步替换：

- `expo.ios.bundleIdentifier`
- `expo.android.package`
- `expo.scheme`
- 应用名、图标、Splash 图

## 3. 可选原生配置

以下文件不会随仓库提供，需要你自己补：

- `android/signing.local.properties`
- `android/app/agconnect-services.json`
- 各厂商推送证书、密钥和证书名
- iOS 签名证书、`mobileprovision`

如果你启用离线推送，还需要补全 [constants/NIMConfig.ts](../constants/NIMConfig.ts) 里的这些字段：

- `offlinePush.apnsCertificateName`
- `offlinePush.hwPush.appId`
- `offlinePush.hwPush.certificateName`
- 其他厂商推送的 `appId`、`appKey`、`secret`、`certificateName`

不启用时保持空字符串即可。

## 4. 登录链路说明

当前 Demo 使用短信验证码登录：

1. 登录页先请求短信验证码
2. 用户中心返回 `accessToken`、`imAccid`、`imToken`
3. App 再用 `imAccid` 和 `imToken` 登录 NIM SDK

因此你需要同时保证：

- 用户中心短信接口可用
- IM 账号可自动注册或可正常绑定
- 测试手机号能收到验证码

## 5. 启动与验证

安装依赖：

```bash
npm install
```

说明：

- 仓库已通过根目录 `.npmrc` 启用 `legacy-peer-deps=true`，用于兼容当前 `mobx-react` 与 React 19 的 peer 依赖窗口。

启动开发服务：

```bash
npm run start
```

推荐最少验证：

1. 登录页能正常获取短信验证码
2. 登录成功后可进入首页
3. 会话列表、聊天页、通讯录页可正常打开
4. 文本、图片、文件、位置等你关心的消息能力可按需验证

## 6. 相关文档

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [docs/feature-support-matrix.md](feature-support-matrix.md)
- [AGENTS.md](../AGENTS.md)
