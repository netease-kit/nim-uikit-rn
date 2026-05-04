## Why

通讯录页当前在“我的群聊”下方重复提供了“添加好友”快捷入口，而页面右上角已经有相同能力入口。重复入口会增加列表噪音，也偏离当前页面的快捷区分组方式。

## What Changes

- 从通讯录页顶部快捷入口列表中移除“添加好友”这一项。
- 保留通讯录页右上角的“添加好友”入口，不改变添加好友能力本身。

## Capabilities

### New Capabilities

- `contacts-shortcuts`: 定义通讯录页顶部快捷入口的展示内容。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/(tabs)/contacts.tsx`
- Affected specs: `openspec/changes/remove-contacts-add-friend-shortcut/specs/contacts-shortcuts/spec.md`
- No API, dependency, or backend impact.
