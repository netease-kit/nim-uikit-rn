## Why

当前 RN 聊天页图片详情仍暴露“原始地址”入口，用户点击后可以进入二级页查看完整原始地址，这与客户端“不外漏原始地址”的要求冲突。

## What Changes

- 移除 RN 聊天页图片详情中的“原始地址”入口，不再提供进入二级页查看原始地址的操作。
- 保持媒体查看器的关闭、保存等现有能力不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 媒体查看器不得向用户暴露原始地址入口或原始地址详情页跳转能力。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: original-address entry in RN media viewer
- No API, dependency, or backend impact.
