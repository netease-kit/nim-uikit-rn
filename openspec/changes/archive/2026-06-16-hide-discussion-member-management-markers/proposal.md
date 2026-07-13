## Why

讨论组成员列表当前复用了高级群成员列表的角色和管理展示，导致讨论组也显示“群主”标识和“移除”按钮。讨论组成员列表应保持成员展示，不展示高级群管理身份与移除操作。

## What Changes

- 讨论组完整成员列表不显示群主/管理员角色徽标。
- 讨论组完整成员列表不显示“移除”按钮。
- 高级群成员列表保持现有群主/管理员徽标和按权限移除成员逻辑。

## Impact

- Affects discussion-group member list rendering.
- Does not change team membership APIs, sorting, permissions, or advanced-group behavior.
