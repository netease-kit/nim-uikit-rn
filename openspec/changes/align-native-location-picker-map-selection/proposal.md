## Why

当前 Android 原生位置选择页虽然能搜索列表项，但拖动地图后并没有真正把地图中心点作为待选位置，导致“在地图上选点”这一原生 UIKit 基线能力缺失。参考 Android/iOS UIKit 实现，位置选择页应支持通过移动地图中心点联动刷新附近地点，并把当前中心点结果作为可发送位置。

## What Changes

- 对齐 Android 原生位置选择页的地图选点交互，使地图移动后的中心点成为当前待选位置来源。
- 调整附近地点列表首项与默认选中规则，避免拖图后仍被旧的当前位置条目覆盖。
- 补齐中心点选址所需的原生 marker 视觉资源和发送兜底逻辑。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-location-messages`: 细化原生位置选择页“通过地图中心点选址”的交互要求。

## Impact

- 受影响代码：`android/app/src/main/java/com/netease/yunxin/app/im/location/NIMLocationPickerActivity.kt`
- 受影响资源：`android/app/src/main/res/drawable-*/`
- 受影响行为：Android 原生位置选择页的拖图选点与默认选中逻辑
