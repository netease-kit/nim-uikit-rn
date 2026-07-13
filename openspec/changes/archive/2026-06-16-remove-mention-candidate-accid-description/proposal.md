## Why

团队聊天 `@` 选择弹窗当前会在候选人昵称下方额外显示一行 accid 作为描述，信息噪音偏高，也不符合当前列表期望。用户只需要看到可选择的昵称，不需要再看到作为描述的 accid。

## What Changes

- 移除 RN 团队聊天 `@` 选择弹窗中普通成员候选行的 accid 描述文本。
- 保留候选头像、昵称、`@所有人`、选择插入和现有排序逻辑不变。
- 不改变 mention metadata、发送逻辑、候选过滤和昵称优先级。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-mention-name-priority`: 团队 `@` 选择器候选行只显示主昵称，不再额外显示 accid 描述。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: team mention selector candidate row presentation
- No API, dependency, or backend impact.
