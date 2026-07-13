## Why

个人信息编辑页当前在保存昵称、手机号、邮箱和个性签名后，返回列表时看起来像没有生效。这个问题会直接破坏用户对资料编辑链路的基本预期，也说明本地资料状态在保存成功后的回写时机不稳定。

## What Changes

- 修复个人信息编辑页保存昵称、手机号、邮箱和个性签名后的本地资料回写。
- 保证保存成功后返回个人信息页时，更新值立即可见，不依赖云端回读时序。
- 为个人信息编辑链路补充保存结果可见性的规范约束。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充个人信息字段保存成功后返回详情页应立即显示更新值的要求。

## Impact

- 受影响代码：`stores/UserStore.ts`、可能涉及 `app/user/my-detail-edit.tsx`
- 受影响行为：个人信息编辑页保存后的本地资料展示一致性
- 无新增依赖，无 API 变化
