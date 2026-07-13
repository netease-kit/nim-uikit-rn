## Why

好友备注名修改成功并返回会话列表后，P2P 会话标题仍显示旧名称，只有下拉刷新后才更新。会话列表应在好友展示名变化后立即刷新标题，避免用户看到过期的备注信息。

## What Changes

- 会话列表格式化结果显式依赖好友备注名、昵称和头像变化。
- RN UIKit 身份解析优先使用 RN 本地好友备注，避免 im-store 旧称呼覆盖刚保存的备注。
- 保留现有下拉刷新能力，但不再依赖下拉刷新才能看到新标题。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: P2P 会话标题应在好友备注名修改后立即更新。

## Impact

- Affected code: `app/(tabs)/index.tsx`, `src/NEUIKit/rn/identity.ts`
- Affected behavior: P2P conversation row title refresh after friend alias edit
- No API or dependency changes.
