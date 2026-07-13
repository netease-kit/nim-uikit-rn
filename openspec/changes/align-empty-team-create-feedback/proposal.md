## Why

会话模块测试用例 `0222-不选择好友创建高级群/讨论组` 要求用户在未选择联系人时点击“创建”，需要提示“请选择联系人”。当前 React Native 的 `app/conversation/picker.tsx` 在空选时直接禁用了按钮，不会给出明确失败提示，因此该用例无法通过。

## What Changes

- 调整会话创建页空选时的创建交互反馈。
- 保持实际创建前的防重复、成员上限和创建逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充空选创建时的提示反馈要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：会话模块创建高级群/讨论组时的空选点击反馈
- 无新增依赖，无接口协议变更
