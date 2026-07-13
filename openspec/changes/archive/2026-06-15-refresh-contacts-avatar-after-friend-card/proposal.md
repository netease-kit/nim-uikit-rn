## Why

当前通讯录好友列表在进入好友卡片并返回后，仍可能继续显示旧头像。好友卡片已经拉到了最新云端资料，但列表层把旧好友资料头像作为显式头像透传，覆盖了共享 UIKit 的最新头像解析结果。

## What Changes

- 调整通讯录好友列表的头像来源，避免旧好友资料头像覆盖共享 UIKit 的最新头像解析结果。
- 保持好友列表昵称优先级、在线状态和跳转行为不变。
- 让用户从好友卡片返回通讯录后，无需手动下拉刷新即可看到最新头像。

## Capabilities

### New Capabilities

### Modified Capabilities

- `contacts-home`: 通讯录好友列表在从好友卡片返回后，需要展示最新头像。

## Impact

- Affected code: `app/(tabs)/contacts.tsx`
- Affected behavior: contacts friend list avatar refresh after returning from friend card
- No API, dependency, or backend impact.
