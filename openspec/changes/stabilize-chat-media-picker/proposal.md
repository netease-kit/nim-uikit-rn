# Proposal

## Why

RN 聊天页图片入口弹出的图片/视频选择器在快速上下滑动时容易出现网格空白、卡顿，严重时可能因大量缩略图加载和列表裁剪/复用压力导致崩溃。

## What Changes

- 优化聊天页媒体选择器分页和虚拟列表渲染参数，降低一次加载和批量渲染的缩略图数量。
- 修正三列网格 `getItemLayout` 的偏移计算，避免虚拟列表误判可见区域。
- 避免弹窗网格在快速滚动时因裁剪子视图造成空白。
- 限制滚动惯性期间重复分页触发，减少并发加载和主线程压力。
- 为网格资源预先解析稳定预览源：图片使用本地可访问 URI 和固定尺寸图片源渲染，视频生成本地封面缓存，避免快速滑动时反复解析相册资源或视频封面。
- 视频封面生成按当前可见项优先，减少刚打开弹窗或快速滑动到视频时的灰色占位时间。
- 保留现有图片/视频选择、禁用规则、选择数量、发送和文件模式能力。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天页媒体选择器滚动稳定性。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat media picker scrolling, paging, layout virtualization, thumbnail generation and rendering
- No API, message send payload, permission, or backend impact.
