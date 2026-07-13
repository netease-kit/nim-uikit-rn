## Why

会话模块测试用例 `0210-搜索输入框占位文案` 要求会话搜索页输入框默认占位文案为“请输入你要搜索的关键字”。当前 React Native 的 `app/conversation/search.tsx` 使用的是“搜索会话 / 好友 / 群组”，与用例和 UIKit 文案基线不一致，因此该用例无法通过。

## What Changes

- 将会话搜索页输入框占位文案调整为测试要求的标准文案。
- 保持现有搜索范围、搜索结果类型和跳转逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话搜索页输入框占位文案要求。

## Impact

- 受影响代码：`app/conversation/search.tsx`
- 受影响行为：会话搜索页输入框初始展示文案
- 无新增依赖，无接口协议变更
