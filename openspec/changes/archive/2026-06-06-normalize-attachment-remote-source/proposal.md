## Why

图片消息已处理 NOS `http` 地址在 iOS 上被 ATS 拦截的问题，但文件消息下载/打开仍直接使用附件 `path || url`，视频消息也可能被其它端的本地 `path` 抢占有效远端 `url`。当其它端发送附件时，`path` 可能是发送端本地路径，RN 端不可访问；`url` 也可能是已知 NOS 域名的 `http` 地址，需要在渲染或下载前归一化为 `https`。

## What Changes

- 提供通用附件源选择工具：本地 `file://` / `content://` 路径优先，其次使用归一化后的远端 `url`，最后才回退非本地 `path`。
- 文件消息点击下载/打开和文件详情页统一使用归一化后的附件源。
- 视频渲染/预览继续优先使用可访问本地路径，但其它端本地路径不再抢占有效远端 URL。
- 保持图片已落地的远端 URL 优先策略不变。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 补充文件和视频附件源选择、NOS HTTP URL 归一化要求。

## Impact

- 受影响代码：`utils/media-source.ts`、`app/chat/[id].tsx`、`app/chat/file-detail.tsx`
- 受影响行为：RN 文件消息下载/打开、视频消息渲染/预览源选择
- 不改变消息发送、重发、SDK 上传或附件元数据
