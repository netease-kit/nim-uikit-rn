## Why

当前 RN 聊天媒体查看页在 Android 上保存图片/视频时，Android Q/API 29 及以上会直接走原生 `MediaStore` 保存分支，没有先请求系统相册/媒体权限。结果是应用在首次未授权情况下点击保存，不会弹出系统权限弹窗，请求链路与原生端预期不一致。

## What Changes

- 为聊天媒体查看页新增“保存到系统相册”专用权限申请链路。
- 在首次未授权时，保存图片/视频必须先触发系统权限弹窗；用户授权后继续执行保存。
- 当权限已拒绝且系统不再允许直接弹窗时，保留现有“去设置”引导。
- 不改变聊天发送图片/视频入口的现有相册读取与 limited 权限行为。

## Capabilities

### Modified Capabilities

- `chat-media-save`: 聊天媒体查看页保存图片/视频时，应先满足系统相册保存权限请求链路。

## Impact

- Affected code: `app/chat/media-viewer.tsx`, `utils/permissions.ts`
- Affected behavior: 聊天媒体查看页首次保存图片/视频时的系统权限请求与保存链路
- No API or dependency changes.
