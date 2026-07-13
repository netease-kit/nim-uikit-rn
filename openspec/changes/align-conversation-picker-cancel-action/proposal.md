## Why

会话模块测试用例 `0200-好友选择页面左上角-返回` 要求好友选择页左上角提供 `取消` 操作，点击后销毁当前页面并返回上一页。当前 `app/conversation/picker.tsx` 只使用默认导航返回，没有显式 `取消` 文案，无法满足该用例的交互和文案要求。

## What Changes

- 为好友选择页面补充显式的左上角 `取消` 操作。
- `取消` 点击后返回上一页，不保留当前页面。
- 保持页面标题和现有选择/创建逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话好友选择页需要提供显式取消返回操作的要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：好友选择页返回交互
- 无新增依赖，无接口变化
