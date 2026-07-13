## Why

群聊输入框已 @ 用户 A 后，再回复用户 A 的消息会追加第二个 `@A`。发送时消息扩展包含同一账号的多个 @ 段，但 RN 文本渲染按 @ 文案字符串匹配，高亮依赖尾随空格等可见文本，导致发送后第二个 @ 在部分场景未高亮。

## What Changes

- 消息文本渲染优先按 `serverExtension.yxAitMsg[*].segments` 的位置切分 @ 高亮。
- 同一账号多次 @ 时，每个有效 segment 都应高亮。
- 非 @ 文本继续保留现有 emoji 和链接解析。

## Impact

- Affects RN rich-text rendering for text messages with mention extensions.
- Does not change text send payload shape, reply behavior, push payload, or conversation mention badges.
