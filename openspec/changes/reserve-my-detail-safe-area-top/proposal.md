## Why

`/user/my-detail` 及其直接打开的子信息编辑页当前没有给顶部状态栏预留安全区，刘海屏或沉浸式状态栏设备上会出现内容顶到系统区域的问题。这组页面属于“我的”信息主入口和编辑链路，布局需要和仓库内其他个人设置页保持一致。

## What Changes

- 为 `/user/my-detail` 页面及其直接子页补充顶部状态栏安全区留白。
- 保持页面底部安全区与现有页面一致，避免内容贴边。
- 为个人信息页及其编辑子页补充安全区布局要求，防止同类回归。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充个人信息页及其编辑子页在顶部状态栏区域的安全区布局要求。

## Impact

- 受影响代码：`app/user/my-detail.tsx`、`app/user/gender.tsx`、`app/user/my-detail-edit.tsx`
- 受影响行为：个人信息页及其编辑子页的页面容器布局
- 无新增依赖，无 API 变化
