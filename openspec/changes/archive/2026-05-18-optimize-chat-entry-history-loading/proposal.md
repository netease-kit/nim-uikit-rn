## Why

聊天页当前在进入大历史会话时会明显卡顿，登录后进入会话列表页时也会出现一段空白等待。根因是 RN 端在聊天和会话两个首屏链路上都存在“首批取数偏大”和“加载中反馈不充分”的问题，这已经影响基础 IM 浏览体验。

## What Changes

- 调整聊天详情页进入策略，进入路由后再异步加载首屏历史，而不是在会话列表点击链路里等待历史预加载完成。
- 将聊天详情页主消息区从一次性渲染的滚动容器调整为虚拟化列表，避免历史消息较多时挂载过多节点。
- 收紧聊天页首屏历史窗口大小，同时保留上拉继续加载更早消息、首次进入定位到最新消息、回复定位和新消息提示等现有行为。
- 收紧会话列表首屏会话窗口，并在登录后首批会话仍在加载时展示明确的列表级 loading 占位，而不是先落入空白或空态观感。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-timeline-and-history`: 调整聊天详情页进入、首屏历史加载和消息时间线渲染的性能行为要求。
- `conversation-list-behavior`: 调整登录后会话列表首屏加载窗口与加载中展示要求。

## Impact

- Affected code: `app/_layout.tsx`, `app/(tabs)/index.tsx`, `app/chat/[id].tsx`, `stores/ImStoreV2Bridge.ts`, `stores/MessageStore.ts`
- Affected behavior: 登录后会话列表首屏观感、会话列表进入聊天详情页的响应速度、聊天页历史消息首屏加载方式、消息列表渲染策略
