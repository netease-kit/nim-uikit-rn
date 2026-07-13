## Why

群成员列表页成员昵称过长时会占用多行，影响列表行高度和右侧操作区域稳定性。成员昵称应与其它列表页名称展示一致，最多一行并在尾部省略。

## What Changes

- 群成员列表页成员昵称限制为单行展示。
- 昵称超出可用宽度时使用尾部省略号。

## Capabilities

### Modified Capabilities

- `team-member-list-behavior`: 群成员列表昵称展示规则。

## Impact

- Affected code: `app/team/members.tsx`
- Affected behavior: 群成员列表页成员昵称展示
- No API or dependency changes.
