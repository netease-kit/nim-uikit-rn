## Why

个人信息文本编辑页当前使用 `取消 / 标题 / 保存` 顶栏，但测试用例要求这些页面展示为“返回”、对应字段标题和“完成”按钮。该差异会导致昵称、手机、邮箱和个性签名编辑页的 UI 用例连续失败，需要统一对齐。

## What Changes

- 将个人信息文本编辑页顶栏左侧文案从 `取消` 调整为返回样式。
- 将右侧主操作文案从 `保存` 调整为 `完成`。
- 保持编辑页的保存逻辑、字段限制和网络失败处理不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 明确个人信息文本编辑页使用测试要求的返回与完成文案。

## Impact

- Affected code: `app/user/my-detail-edit.tsx`
- Affected specs: `openspec/specs/profile-home-and-account/spec.md`
- No API or dependency changes
