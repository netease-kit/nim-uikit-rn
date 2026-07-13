## Why

登录成功后首次进入会话列表页时，数据尚未完成首次加载前会短暂出现空状态占位图，造成明显闪烁；但如果会话列表确实为空，也不能一直停留在 loading 状态。

## What Changes

- 为首页会话列表增加首次加载阶段的 loading 占位。
- 仅在首次请求已发起且确认当前没有会话数据后，才切换为空状态展示。
- 避免首次渲染阶段在 loading 与空状态之间频繁闪动。

## Capabilities

### Modified Capabilities

- `conversation-list`: 补充首次进入时的 loading/空状态切换要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：登录后首次进入会话列表页的初始占位与空态展示
