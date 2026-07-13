## Why

Android 上会话列表、聊天详情和通讯录好友列表都通过共享 UIKit 用户状态源显示在线状态。当前共享状态源在 Android 显式跳过用户状态订阅，只做一次 `getUserStatus` 同步，因此好友上下线后没有持续事件推送，三个页面都不能及时更新。

## What Changes

- Android 也启用用户状态订阅路径，允许 SDK `subscribeUserStatus` 或 legacy `subscribeEvent` 接收后续在线状态变化。
- 保留现有 `getUserStatus` 作为初始状态和兜底同步。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: Android 会话列表好友在线状态应及时更新。
- `chat-user-online-status`: Android 聊天详情好友在线状态应及时更新。
- `contacts-home`: Android 通讯录好友在线状态应及时更新。

## Impact

- 受影响代码：`src/NEUIKit/rn/user-status.ts`
- 受影响行为：Android 好友在线状态订阅与更新
- 无新增依赖，无接口协议变更
