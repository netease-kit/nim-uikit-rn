## Why

当前 RN `/user/setting` 页面已经承载消息提醒、外观、语言等能力，但缺少本地 Web 设置页中已有的“云端会话”开关，导致设置页无法补齐对应测试能力，也无法显式管理云端会话偏好。

## What Changes

- 在 RN 设置页中补齐与 Web 一致的 `是否开启云端会话` 开关文案和交互。
- 云端会话开关持久化到本地偏好，并在后续 NIM 初始化/登录时作为真实配置读取。
- 保留当前 RN 设置页已有的消息提醒、听筒模式、已读回执、外观、语言和退出登录能力，不回退已有设置结构。

## Capabilities

### New Capabilities

- `user-setting-page`: 定义设置页中的云端会话开关可见性、持久化和现有入口保留要求。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/user/setting.tsx`, `stores/PreferenceStore.ts`, `stores/NIMStore.ts`
- Affected specs: `openspec/changes/align-user-setting-with-web/specs/user-setting-page/spec.md`
- No API, dependency, or backend impact.
