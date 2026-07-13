## Why

添加好友页当前在精确搜索命中用户后仍停留在当前页面，要求用户再点击结果行或操作按钮进入名片页。新的产品预期要求搜索成功后自动进入对应名片页，减少一步额外点击并对齐预期流程。

## What Changes

- 调整添加好友页的精确搜索成功分支，命中用户后自动跳转到对应名片页。
- 移除添加好友页搜索成功后的内联搜索结果展示；成功命中只负责跳转。
- 调整名片页添加好友成功反馈，改为 toast 提示“好友申请已发送”，不再使用系统弹窗。
- 发送好友申请成功后，如果目标账号在黑名单中，自动将其移出黑名单。
- 保留搜索不到时的空状态反馈。
- 保留搜索自己时跳转到个人信息页的现有分支。

## Capabilities

### Modified Capabilities

- `friend-add`: 搜索命中用户时不再停留或展示内联结果页，而是自动进入对应名片页；搜索不到时展示空状态占位。
- `friend-search-and-card`: 名片页发送好友申请成功时同步解除目标账号黑名单关系。

## Impact

- Affected code: `app/friend/add.tsx`, `app/friend/friend-card.tsx`, `stores/FriendStore.ts`
- Affected specs: `openspec/specs/friend-add/spec.md`
- No API or dependency changes
