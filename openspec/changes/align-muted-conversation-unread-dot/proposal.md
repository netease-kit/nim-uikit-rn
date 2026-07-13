## Why

会话模块测试用例 `0246-未读消息展示` 要求普通会话显示红色未读数字，免打扰会话显示免打扰 icon 且不显示未读数字。当前 React Native 会话列表在免打扰状态下仍显示数字角标，只是改成了灰色，和测试要求不一致。

## What Changes

- 为共享未读角标增加“小点模式”。
- 会话列表在免打扰状态下，将未读提示渲染为灰色小点而不是数字角标。
- 保持普通会话的红色数字角标与 `99+` 上限逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充免打扰会话未读提示不显示数字、仅显示点状提示的要求。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`
- 受影响行为：会话列表免打扰会话未读展示
- 无新增依赖，无接口协议变更
