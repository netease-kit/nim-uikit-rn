## Why

RN 会话页右上角添加菜单当前缺少 Android 端已有的“加入群组”和“创建讨论组”，建群流程也没有显式区分讨论组与高级群，导致入口能力和群设置页表现都与 Android 不一致。

## What Changes

- 为会话页右上角添加菜单补齐四个入口：添加好友、加入群组、创建讨论组、创建高级群。
- 新增应用内“加入群组”搜索与申请/直加入群流程。
- 为群创建选择页增加显式模式参数，并保留单聊拉人默认创建讨论组的既有行为。
- 对齐讨论组与高级群在设置页、信息页中的文案和功能差异，讨论组隐藏群管理与我的群昵称，高级群保留对应能力。

## Capabilities

### Modified Capabilities

- `team-create-entry`: 补齐会话入口的建群/入群能力，并保留讨论组与高级群区分。
- `discussion-settings`: 收敛讨论组与高级群设置页、信息页的差异展示。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`、`app/conversation/picker.tsx`、`app/team/join.tsx`、`app/team/settings.tsx`、`app/team/info.tsx`、`stores/TeamStore.ts`、`utils/app-language.ts`
- 受影响行为：会话页添加菜单、加入群组流程、讨论组/高级群创建与设置展示
- 无新增第三方依赖
