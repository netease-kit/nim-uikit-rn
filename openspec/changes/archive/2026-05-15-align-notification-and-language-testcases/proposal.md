## Why

当前 `我的 > 设置` 后续用例还存在两类缺口：

- `0076-0087` 所需的消息提醒组合规则、通知点击清理和前后台展示行为，RN 侧部分设置仅做了本地持久化，没有完整落到通知运行时。
- `0089-0093` 要求应用内保存的语言设置真正覆盖页面文案，但当前仅保存了 `language` 字段，没有驱动页面和 UIKit 文案切换；同时 RN 核心用户链路仍残留大量硬编码中文文案。

另外，对照 Android `imkit` 参考实现，Android 端真机离线推送依赖应用初始化时的厂商 push 通道注册与 NIM push handler 绑定；当前 Expo RN Demo 尚未具备等价链路，需在规格里明确这部分差异。

## What Changes

- 让消息提醒页的主开关、响铃、震动、详情展示组合真实影响通知运行时配置和可见状态。
- 在通知点击进入聊天后清理当前桌面通知与角标，补齐 workbook 要求的点击后清理行为。
- 建立应用内语言覆盖能力，让登录、我的、设置、个人信息、联系人、会话设置，以及由 store / util 直接生成的用户可见文案都能随保存的语言切换中英文。
- 明确当前 RN Demo 与 Android IMKit 在真机离线厂商推送初始化上的差异，不把现有能力误判为已完成。

## Capabilities

### Modified Capabilities

- `notification-preferences`: 扩展通知偏好从“仅持久化”到“驱动当前 RN 通知展示配置与点击清理行为”。
- `push-routing-and-delivery`: 明确当前实现已覆盖前台展示抑制和点击路由，但未覆盖 Android IMKit 等价的厂商离线推送初始化。
- `language-preferences`: 扩展为“保存后立即驱动核心 RN 用户链路与逻辑层可见文案语言”。

## Impact

- Affected code: `app/_layout.tsx`, `app/login.tsx`, `app/session/p2p-settings.tsx`, `app/team/settings.tsx`, `app/conversation/*`, `app/contacts/*`, `app/friend/*`, `app/user/*`, `stores/PreferenceStore.ts`, `stores/FriendStore.ts`, `stores/MessageStore.ts`, `utils/app-language.ts`, `utils/messageForward.ts`, `utils/network.ts`, `utils/notifications.ts`, `utils/permissions.ts`, `utils/teamNotification.ts`
- Affected specs: `notification-preferences`, `push-routing-and-delivery`, `language-preferences`
- No dependency changes
