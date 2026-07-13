## Why

当前群聊被禁言时，聊天详情页输入框虽然已经不可编辑，但输入框外观仍保持可用态，缺少禁用反馈，容易让用户误以为可以输入。需要让禁用状态在视觉上与交互状态保持一致。

## What Changes

- 调整群聊禁言时聊天详情页输入框的视觉状态。
- 在输入框不可编辑时同步应用置灰样式，包括输入框容器与提示文案。

## Capabilities

### New Capabilities

- `team-chat-banned-composer-state`: 定义群聊禁言时聊天输入区的禁用视觉状态

### Modified Capabilities

- `chat-composer-actions`: 聊天输入区在群聊禁言状态下的展示样式要求更新

## Impact

- 影响 `app/chat/[id].tsx` 的输入框样式与禁言状态展示。
- 影响聊天输入区在群聊禁言场景下的用户感知，但不改变现有发送拦截逻辑。
