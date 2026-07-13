## Why

会话模块测试用例 `0199-好友选择页面左上角创建-确定按钮样式` 要求好友选择页面在勾选好友后，将创建动作展示为带括号人数的创建文案。当前 React Native 实现的 `app/conversation/picker.tsx` 底部提交按钮始终显示为 `确定`，没有体现创建语义，也不会展示已选人数，因此不满足测试用例要求。

## What Changes

- 调整会话好友选择页的创建动作文案。
- 当用户已选择好友时，按钮展示为 `创建(<人数>)`。
- 保持未选择、提交中和创建逻辑的现有约束不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充好友选择创建页的创建动作文案与已选人数展示要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：会话模块好友选择页的创建按钮展示
- 无新增依赖，无后端接口变化
