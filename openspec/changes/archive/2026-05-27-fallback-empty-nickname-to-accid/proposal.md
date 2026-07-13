## Why

当前用户未设置昵称时，“我的”和“个人信息”页面显示未设置占位，不符合当前要求。产品预期是昵称为空时直接显示当前个人 accid，确保两个入口展示一致且可识别。

## What Changes

- “我的”页昵称区域在昵称为空时回退显示当前账号 accid。
- “个人信息”页昵称行在昵称为空时回退显示当前账号 accid。
- 头像兜底文案同步优先使用 accid。

## Capabilities

### Modified Capabilities

- `profile-home-and-account`: 当前用户昵称为空时，“我的”和“个人信息”入口都展示当前账号 accid。

## Impact

- Affected code: `app/(tabs)/my.tsx`, `app/user/my-detail.tsx`
- Affected behavior: current-user profile display fallback
- No API or dependency changes.
