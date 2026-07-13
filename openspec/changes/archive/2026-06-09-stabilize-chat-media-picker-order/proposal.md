## Why

RN 聊天详情页自定义图片/视频选择器在 Android 和 iOS 上展示顺序不一致。当前仅依赖 `expo-media-library` 的 `creationTime DESC`，但 Android 该字段映射 `MediaStore.DATE_TAKEN`，部分资源可能缺失或与 iOS `PHAsset.creationDate` 语义不完全一致，导致同一批媒体跨端排序不稳定。

## What Changes

- RN 图片/视频选择器对媒体资源使用统一的“最新在前”排序。
- 排序优先使用创建时间，创建时间缺失时使用修改时间，并用资源 id/文件名做稳定兜底。
- 分页加载和分页合并后均保持同一排序规则。

## Capabilities

### Modified Capabilities

- `chat-detail`: 补充聊天页图片/视频选择器跨 RN Android、RN iOS 的稳定排序要求。

## Impact

- 受影响代码：`app/chat/[id].tsx`
- 受影响行为：聊天详情页底部输入模块进入图片/视频选择器后的媒体展示顺序
- 无新增依赖，无接口协议变更
