## Why

会话模块测试用例 `0232-消息免打扰会话` 要求免打扰会话显示免打扰 icon，且未读消息提示为灰色。当前 React Native 的共享会话角标在所有场景下都使用红色，导致免打扰会话展示不符合要求。

## What Changes

- 为共享未读角标增加免打扰态灰色展示。
- 在会话行和通用列表行中，将免打扰状态透传到角标样式。
- 保持免打扰 icon 与时间戳现有布局不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充免打扰会话未读提示的灰色展示要求。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`
- 受影响行为：会话列表及复用列表行中的免打扰未读角标颜色
- 无新增依赖，无接口协议变更
