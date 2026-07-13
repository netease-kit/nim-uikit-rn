## Why

群聊 `@` 选择框当前提供了成员搜索输入框，但该能力并非当前需要的交互，且会增加弹层复杂度。需求要求直接移除 `@` 选择框中的搜索模块，仅保留直接选择成员的列表。

## What Changes

- 移除群聊 `@` 选择框顶部搜索栏。
- 移除 `@` 选择框内基于关键字的候选过滤。
- 保留现有 `@所有人` 权限规则、普通成员候选、插入 mention 文本和 metadata 逻辑不变。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 群聊 `@` 选择框不再提供搜索模块。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: team mention selector shows direct candidate list without search
- No API or dependency changes.
