## Why

聊天页“图片”入口当前会先弹出自定义“选择媒体”对话框，再进入系统相册权限或系统相册；这与 `0564-0568`、`0851-0855` 相册权限测试用例要求的直接权限/相册链路不一致。与此同时，iOS/Android 的 limited photos 场景缺少“选择更多照片”的恢复路径，导致权限变更相关用例无法满足。

## What Changes

- 调整聊天页“图片”入口，首次点击时直接进入系统相册权限请求或系统相册，不再先展示自定义媒体类型对话框。
- 保留发送图片/视频与 9 张多选能力，但把“原图/原视频”能力从相册权限前置链路中解耦，避免阻断权限测试所要求的直接系统行为。
- 补齐相册 limited 权限状态下的“选择更多照片”恢复入口，支持权限变更后重新扩大可见照片范围。
- 统一 denied / canAskAgain=false 场景的提示与系统设置跳转链路，保持用户停留在聊天页。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-composer-actions`: 调整聊天页图片主入口的媒体选择方式，使图片入口优先满足系统相册权限与系统相册直达链路。
- `chat-message-content`: 调整聊天页图片入口的辅助面板与相册进入行为，使其符合相册权限测试要求。
- `permission-flows`: 明确相册 limited / deny / post-settings-change 场景下的恢复与补选行为。

## Impact

- Affected code: `app/chat/[id].tsx`, `utils/permissions.ts`
- Affected docs: `openspec/specs/chat-message-content/spec.md`, `openspec/specs/permission-flows/spec.md`
- Affected verification: `TestCases/10.0.0/相册权限/0851-0855`, `TestCases/10.0.0/聊天详情页/0564-0568`
