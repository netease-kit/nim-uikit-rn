## Why

RN 表情面板中第 4 排第 5 个表情发送后，消息气泡展示的表情与输入模块中点击的表情不一致。该位置对应 `[睡着]`，但本地化表情映射中 `[睡着]` 和 `[睡觉]` 复用了同一个 `Sleep` key，后定义的表情覆盖先定义表情，导致输入和渲染映射错位。

## What Changes

- 为 `[睡觉]` 使用独立的 `Sleeping` 本地化 key。
- 为 `[发怒]` 使用独立的 `Huff` 本地化 key，避免与 `[生气]` 共用 `Angry`。
- 保持 `[睡着]` 映射到 `icon-a-26`，`[睡觉]` 映射到 `icon-a-65`，`[发怒]` 映射到 `icon-a-37`，`[生气]` 映射到 `icon-a-38`。
- 确保 RN 表情面板点击后插入的 token 与消息渲染使用的图片一致。

## Capabilities

### Modified Capabilities

- `chat-composer-actions`: 表情面板发送的表情应与消息中展示的表情一致。

## Impact

- 受影响代码：`src/NEUIKit/common/utils/emoji.ts`、`src/NEUIKit/common/locales/zh.ts`、`src/NEUIKit/common/locales/en.ts`
- 受影响行为：RN 聊天输入表情面板和聊天消息表情渲染
- 不影响消息发送协议、历史消息文本内容和表情图片资源
