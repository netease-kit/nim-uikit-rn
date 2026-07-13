## Why

受限相册场景下，聊天图片和视频选择弹窗当前把“添加更多照片”放在网格尾部。这个入口的优先级比普通资源更高，放在首卡位置更容易被发现，也更符合当前用户希望先扩权再选图的操作路径。

## What Changes

- 将受限相册场景中的“添加更多照片”卡片从网格尾部移动到第一个卡片位置。
- 保留已授权图片视频的最新优先排序和现有点击扩权链路不变。
- 不改变完全授权场景下的媒体网格内容。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-detail`: 受限媒体选择器中的“添加更多照片”入口改为首卡展示。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: limited media picker add-more card placement
- No API, dependency, or backend impact.
