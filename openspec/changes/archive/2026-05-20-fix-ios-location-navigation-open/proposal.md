## Why

iOS 点击地理位置消息后的导航入口当前会优先探测高德地图 scheme，但应用未声明对应的 `LSApplicationQueriesSchemes`，导致 `canOpenURL` 直接报错并中断后续兜底链路。结果是位置详情页无法继续打开地图应用或浏览器，与现有位置消息查看流程不一致。

## What Changes

- 修正位置详情页点击“导航”后的打开链路，保证单个地图 URL 探测失败时仍继续尝试后续候选。
- 在 iOS 上补充第三方地图 scheme 查询白名单，并提供系统地图或网页地图兜底。
- 将位置详情页外跳地图时使用的回跳 scheme 对齐当前 Expo 应用的真实 scheme。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-location-messages`: 细化位置详情页导航按钮的外部地图打开与兜底要求。

## Impact

- 受影响代码：`app/chat/location-detail.tsx`、`app.json`
- 受影响行为：iOS 位置消息详情页点击导航后的地图/浏览器打开流程
- 无接口协议变更，无新增业务依赖
