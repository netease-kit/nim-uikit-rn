## Why

会话列表右上角进入的搜索页当前会在输入框内容变化时立即刷新搜索结果，用户还未确认搜索词时就会不断变化。群聊搜索结果也只显示在一个“群聊”模块中，无法区分讨论组和高级群。

## What Changes

- 会话搜索页输入框只更新输入内容，不自动执行搜索。
- 用户点击键盘搜索键后，才用当前输入内容刷新搜索结果。
- 搜索结果按“好友”、“讨论组”、“高级群”三个模块展示。
- 空搜索词或清空输入框时清空已提交的搜索结果。

## Capabilities

### Modified Capabilities

- `conversation-search-behavior`: 会话搜索提交时机与结果分组。

## Impact

- Affected code: `app/conversation/search.tsx`, `utils/app-language.ts`
- Affected behavior: 会话搜索页搜索触发时机和群聊结果分组
- No API or dependency changes.
