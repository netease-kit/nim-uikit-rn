## Why

通讯录好友列表当前只渲染头像和昵称，没有订阅好友在线状态，也没有把在线状态传给头像组件。会话列表已经通过 UIKit RN 的用户状态订阅展示在线/离线点，通讯录需要复用同一套状态源保持一致。

## What Changes

- 通讯录页按当前好友列表 accountId 订阅用户在线状态。
- 好友行头像传入在线/离线状态，让 `UIKitUserAvatar` 显示状态点。

## Capabilities

### New Capabilities

### Modified Capabilities

- `contacts-home`: 好友列表显示好友在线状态。

## Impact

- 受影响代码：`app/(tabs)/contacts.tsx`
- 受影响行为：通讯录好友列表头像在线状态展示
- 无新增依赖，无接口协议变更
