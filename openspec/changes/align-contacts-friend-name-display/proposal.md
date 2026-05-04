## Why

通讯录页当前好友名称会退回显示 `accountId`，与期望的昵称展示不一致，也会让联系人列表出现多余的账号信息。

## What Changes

- 通讯录页好友行主标题改为优先显示好友昵称。
- 当昵称缺失时回退到备注名或通用占位文案，但不再显示 `accountId`。
- 通讯录页好友行不再额外展示账号相关副标题。

## Capabilities

### New Capabilities

- `contacts-friend-display`: 定义通讯录页好友昵称展示与账号隐藏规则。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/(tabs)/contacts.tsx`
- Affected specs: `openspec/changes/align-contacts-friend-name-display/specs/contacts-friend-display/spec.md`
- No API, dependency, or backend impact.
