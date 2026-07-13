## Why

个人信息页当前没有按照测试用例要求展示 `账号 + 复制按钮`，且账号位置落在页面底部独立卡片中，不符合既定顺序。`TestCases/10.0.0/我的/0003-编辑个人信息页UI.md` 因此无法通过，需要将页面结构调整回测试定义的总览顺序。

## What Changes

- 将个人信息页中的账号展示调整到昵称之后、性别之前。
- 为账号行提供可见的复制按钮，保留现有复制成功/失败反馈。
- 移除底部独立账号卡片，避免重复展示账号信息。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 明确个人信息页按测试顺序展示账号行，并提供可见复制按钮。

## Impact

- Affected code: `app/user/my-detail.tsx`
- Affected specs: `openspec/specs/profile-home-and-account/spec.md`
- No API or dependency changes
