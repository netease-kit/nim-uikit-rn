## Why

iOS 聊天详情页的受限相册选择器在“添加更多照片”返回后仍可能继续按旧授权范围过滤分页结果，导致新授权的图片或视频无法在同一弹窗中刷新出来。与此同时，多张图片并发发送时，反垃圾失败提示被追加为独立 tips 行，会按失败回调顺序漂移，无法稳定贴着对应失败图片。

## What Changes

- 修正 iOS 受限相册“添加更多照片”后的媒体刷新逻辑，保证同一图片和视频选择弹窗能基于最新授权范围重新加载并继续分页。
- 去掉反垃圾失败依赖独立 tips 行的提示方式，改为将失败文案直接绑定在对应失败消息气泡下方。
- 保留反垃圾分类文案、失败态按钮禁用规则以及现有多选图片和视频发送能力。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-detail`: 受限相册扩容后，聊天详情页媒体选择弹窗需要在原地刷新并继续展示新授权媒体。
- `chat-inline-send-failure-feedback`: 反垃圾发送失败需要以内联方式锚定到对应失败消息，而不是以独立 tips 行漂移显示。
- `chat-send-failure-feedback`: 反垃圾失败文案仍需保留分类信息，但不能再与错误消息脱锚。

## Impact

- Affected code: `app/chat/[id].tsx`, `stores/MessageStore.ts`, `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: iOS limited photo-library refresh, chat media picker pagination, inline anti-spam failure rendering for media messages
- No backend, SDK protocol, or dependency changes.
