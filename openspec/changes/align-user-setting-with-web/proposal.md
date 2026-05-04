## Why

当前 RN `/user/setting` 页面保留了大量 RN 端自定义设置项，与本地 Web 端设置页的结构、文案和交互模型差异较大。

## What Changes

- 将 RN 设置页的主内容结构对齐为 Web 端的两项开关和退出登录按钮。
- 将 RN 设置页顶部导航对齐为 Web 端的页内导航栏，而不是保留原生 header。
- 使用与 Web 对应的开关文案：`是否开启云端会话`、`是否切换为英文`。
- 保留退出登录能力，但移除当前 RN 页面中的缓存清理、消息提醒入口和额外偏好项。

## Capabilities

### New Capabilities

- `user-setting-page`: 定义设置页与 Web 对齐的内容结构和交互项。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/user/setting.tsx`
- Affected specs: `openspec/changes/align-user-setting-with-web/specs/user-setting-page/spec.md`
- No API, dependency, or backend impact.
