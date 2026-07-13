## Why

聊天详情页视频消息当前只渲染文件名和时长文本卡片，没有测试用例要求的占位图、发送中 loading 态，以及发送完成后的首帧封面展示。与此同时，视频发送入口缺少“原视频”发送控制，`0524-发送视频消息` 和 `0526-发送视频原图` 因此无法通过。

## What Changes

- 将 RN 聊天页的视频消息展示调整为和本地 UIKit/H5 基线一致的预览卡片。
- 发送中展示稳定的占位图和 loading 态。
- 发送成功后展示视频首帧封面，并保留播放入口。
- 在 Android 视频发送入口增加“原视频”切换，并将该选项映射到无压缩导出参数。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected UX: chat detail video-message rendering and original-video sending behavior
