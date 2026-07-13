# Proposal

## Why

RN 在无网络时点击合并转发消息，iOS 可能停留在加载中，Android 会展示 `聊天记录不存在` 空态。期望与业务反馈对齐：加载不到合并转发内容时提示 `信息获取失败`，并回到聊天页。

## What Changes

- 合并转发详情页加载标准合并转发内容失败或离线超时时，统一显示 `信息获取失败` toast。
- 失败后自动返回上一页，避免停留在加载页或空态页。
- 对合并转发内容下载增加超时保护，避免离线请求长时间不结束。

## Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: 合并转发详情页离线/加载失败处理。

## Impact

- Affected code: `app/chat/merged-forward-detail.tsx`
- Affected behavior: merged-forward detail load failure feedback and navigation
- No message payload, SDK send, or backend API impact.
