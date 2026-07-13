## Why

聊天页已经有位置消息入口、气泡展示和位置详情页，但发送入口仍提示暂未支持，导致 RN 端无法主动发送当前位置。需要补齐当前位置获取、位置消息创建和发送链路。

## What Changes

- 聊天更多面板的位置入口改为打开位置选择页，不在聊天页直接定位发送。
- 位置选择页请求前台定位权限并初始化地图，用户确认后发送选中的位置。
- 选择页支持地图点击选择位置，定位或反解析失败时提供可编辑经纬度和地址兜底。
- MessageStore 增加位置消息发送方法，复用现有消息发送、失败、会话预览和重发链路。
- Expo 配置注册 `expo-location` plugin，声明前台定位用途文案。

## Capabilities

### New Capabilities

- `chat-location-messages`: 规定会话详情页应支持发送、展示、打开和重发位置消息。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`, `app/chat/location-picker.tsx`, `stores/MessageStore.ts`, `app.json`
- Affected UX: chat composer more panel location action and location picker confirmation flow
- Dependencies: uses existing `expo-location` and its config plugin for foreground location permission metadata
