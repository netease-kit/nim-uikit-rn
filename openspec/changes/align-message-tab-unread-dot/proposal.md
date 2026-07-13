## Why

会话模块测试用例 `0247-底部消息icon未读展示` 要求底部消息 icon 在存在未读消息时显示小红点，且不受会话是否免打扰影响。当前 React Native 使用自定义 tab bar，但没有把未读状态渲染到图标上，因此该用例无法通过。

## What Changes

- 在自定义底部 tab bar 上渲染消息和通讯录入口的小红点提示。
- 消息页小红点基于总未读数显示，不区分具体会话是否免打扰。
- 保持现有图标、标题和路由逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `tab-navigation`: 补充底部消息入口未读小红点展示要求。

## Impact

- 受影响代码：`app/(tabs)/_layout.tsx`
- 受影响行为：底部 tab 的消息与通讯录未读提示
- 无新增依赖，无接口协议变更
