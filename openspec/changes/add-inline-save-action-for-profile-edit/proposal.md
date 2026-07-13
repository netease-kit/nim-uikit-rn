## Why

个人信息编辑页当前把保存动作放在不稳定的导航头区域，部分运行环境下用户看不到可操作的保存按钮，导致资料虽然可编辑却无法提交。个人信息编辑链路需要像 `/friend/edit` 一样使用页内固定的 `取消 / 标题 / 保存` 顶栏，提供稳定、可见的保存入口。

## What Changes

- 为个人信息文本编辑页改成页内 `取消 / 标题 / 保存` 顶栏。
- 为性别编辑页改成页内 `取消 / 标题 / 保存` 顶栏。
- 为个人信息编辑链路补充“编辑页必须提供可见的页内保存入口”的规范约束。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充个人信息编辑页和性别页必须提供页面内可见保存入口的要求。

## Impact

- 受影响代码：`app/user/my-detail-edit.tsx`、`app/user/gender.tsx`
- 受影响行为：个人信息编辑页的保存动作可见性
- 无新增依赖，无 API 变化
