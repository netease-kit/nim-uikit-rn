## Why

“我的/个人中心”链路当前还有 4 个和测试预期不一致的行为：

- 性别页在无网络保存失败时会阻塞退出，用户无法先返回上一页。
- 多端登录同一账号时，一端修改个人资料，另一端不会把当前登录账号的资料事件回写到 `selfProfile`，仍显示旧资料。
- “我的”页仍展示默认标题“我的”，与预期的沉浸式页面头部不一致。
- “我的”页无预设头像时，头像占位字符仍取昵称前两个字符，而不是后两个字符。

这些问题集中影响个人中心体验和多端资料一致性，需要一起收敛。

## What Changes

- 调整性别页返回保存时机，返回操作优先完成页面退出，保存失败再给出提示。
- 修复当前登录账号收到资料变更事件时的本地 `selfProfile` 同步，保证另一端能实时看到新资料。
- 隐藏“我的”页顶部标题栏。
- 统一“我的”页用户无头像时的占位字符规则为“昵称后两位，昵称为空时取账号后两位”。

## Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充“我的”页 header、头像占位字符和多端资料同步要求。
- `profile-home-and-account`: 明确性别页返回保存失败时应先退出当前页，再提示失败结果。

## Impact

- Affected code: `app/(tabs)/my.tsx`, `app/user/gender.tsx`, `stores/UserStore.ts`
- Affected specs: `profile-home-and-account`
- No dependency or API changes
