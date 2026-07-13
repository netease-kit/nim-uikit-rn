## Why

群管理页已提供“谁可以@所有人”设置，但聊天页 @ 选择弹窗当前只展示普通群成员，没有根据该设置展示或隐藏“所有人”选项。用户切换权限后，聊天输入框输入 `@` 时的候选项应立即符合群设置。

## What Changes

- 聊天页读取群 `serverExtension.yxAllowAt` 设置。
- 当权限为群主/管理员时，仅群主或管理员在 @ 弹窗看到“所有人”选项。
- 当权限为所有人时，所有群成员在 @ 弹窗看到“所有人”选项。
- 选择“所有人”时按现有 `ait_all` mention 扩展发送。

## Capabilities

### Modified Capabilities

- `chat-mention-permissions`: 群聊 @ 所有人候选展示规则。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: 群聊输入 @ 时的“所有人”候选展示
- No API or dependency changes.
