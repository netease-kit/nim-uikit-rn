## Why

会话模块测试用例 `0201-好友选择-无好友` 要求好友选择页在无好友时展示占位图和 `暂无好友` 文案。当前 `app/conversation/picker.tsx` 在好友列表为空时只显示文本 `暂无可选好友`，既没有占位图，文案也不符合用例要求。

## What Changes

- 为好友选择页无好友场景补充空态图片。
- 将无好友场景文案调整为 `暂无好友`。
- 保持搜索无结果场景与无好友场景区分展示。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话好友选择页在无好友时的空态展示要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：好友选择页无好友空态
- 无新增依赖，无接口变化
