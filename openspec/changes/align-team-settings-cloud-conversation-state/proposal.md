## Why

会话测试用例 `0299-退出群聊置顶&免打扰状态清空` 需要在重新加入群聊后看到最新的非置顶、非免打扰状态。当前群设置页仍从本地 `conversationStore` 读取会话状态，而仓库已启用云会话模式，可能导致页面继续显示旧的本地置顶或免打扰状态。

## What Changes

- 群设置页在云会话模式下优先从云 `conversationStore` 读取会话状态。
- 未启用云会话时继续保持本地 `conversationStore` 回退逻辑。

## Capabilities

### Modified Capabilities

- `team-settings`: 补充云会话模式下群设置页会话状态来源要求。

## Impact

- 受影响代码：`app/team/settings.tsx`
- 受影响行为：群设置页展示的置顶与免打扰状态
- 无新增依赖，无接口协议变更
