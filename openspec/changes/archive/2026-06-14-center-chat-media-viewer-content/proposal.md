## Why

聊天图片/视频查看器当前媒体内容没有在黑色预览区域内居中。图片预览使用固定的安全区扣减高度，视频预览直接让播放器填满布局，都会导致图片或视频在部分设备上视觉偏上或不在可用区域中央。

## What Changes

- 图片查看器的横向分页项改为占满屏幕可用区域，并在其中居中图片内容。
- 视频查看器增加独立居中舞台，让播放器在可用区域内居中显示。
- 底部关闭和保存按钮保持绝对定位，不影响媒体内容居中。

## Capabilities

### Modified Capabilities

- `chat-media-save`: 聊天图片/视频查看器中的媒体内容应在预览区域内水平和垂直居中。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: 聊天图片/视频预览布局
- No API, native, or dependency changes.
