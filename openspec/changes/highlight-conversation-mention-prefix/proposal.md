## Why

会话模块测试用例 `0272-会话列表@标识` 要求会话列表收到 `@本人` 消息时，红色高亮显示“有人@我”。当前 React Native 会话列表虽然会拼接 `[有人@我]` 文案，但整行摘要仍是统一灰色，没有单独高亮前缀。

## What Changes

- 在 React Native 会话行摘要中识别 `@我` 前缀。
- 将 `[有人@我]` 前缀单独渲染为红色高亮。
- 保持后续消息摘要内容和其他预览逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充 `@我` 摘要前缀的红色高亮要求。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`
- 受影响行为：会话列表 `@我` 提示的视觉强调
- 无新增依赖，无接口协议变更
