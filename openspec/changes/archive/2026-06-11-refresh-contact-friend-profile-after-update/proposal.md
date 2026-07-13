## Why

好友更新个人资料后，好友名片页会主动拉取并展示新资料，但返回通讯录好友列表时，列表行仍可能继续显示旧昵称和旧头像，直到手动刷新后才恢复一致。通讯录列表不应落后于好友资料页、会话列表和聊天页的身份展示结果。

## What Changes

- 让通讯录好友目录复用 RN UIKit 统一的身份解析规则来计算好友昵称和头像。
- 让通讯录好友目录在远端用户资料更新后立即重算可见好友行，无需手动下拉刷新。
- 保持好友备注名优先级不变，只修正资料昵称和头像的回流刷新。

## Capabilities

### Modified Capabilities

- `contacts-home`: 好友资料变更后，通讯录好友目录应立即展示最新昵称和头像。

## Impact

- Affected code: `app/(tabs)/contacts.tsx`
- Affected behavior: contacts friend row identity refresh after remote user profile updates
- No API or dependency changes.
