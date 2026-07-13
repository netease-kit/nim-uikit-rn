## Why

当前 `/user/setting` 页面仍停留在 12 天前为对齐 Web 做的精简结构，只展示“云端会话”和“英文切换”两个开关。这与测试用例 `0064-0093` 以及现有 `notification-preferences`、`appearance-preferences` 规格要求不一致，导致“我的 > 设置”后续整段用例无法通过。

## What Changes

- 将设置首页恢复为测试要求的结构：消息提醒入口、听筒模式开关、消息已读未读功能开关、外观入口、语言入口、退出登录按钮。
- 将消息提醒页收敛为测试要求的开关组合：新消息通知、响铃模式、震动模式、通知栏显示消息详情。
- 新增语言设置页路由，提供中文/英文选项和保存动作，并将选择持久化到偏好存储中。

## Capabilities

### New Capabilities

- `language-preferences`: 定义语言设置页的入口、选项和本地持久化行为。

### Modified Capabilities

- `notification-preferences`: 恢复设置首页与消息提醒页的测试结构和入口关系。
- `appearance-preferences`: 确保外观页从设置首页可达。

## Impact

- Affected code: `app/user/setting.tsx`, `app/user/notification-settings.tsx`, `app/user/language.tsx`, `stores/PreferenceStore.ts`
- Affected specs: `openspec/specs/notification-preferences/spec.md`, `openspec/specs/appearance-preferences/spec.md`
- No API or dependency changes
