## Why

会话模块测试用例 `0205-选择人员数量限制值` 要求会话创建选择器最多可选择 200 个联系人，且第 201 次选择时要提示“最多只能选择200个联系人”；同一条用例还明确黑名单选择器限制最多选择 10 人。当前 React Native 实现虽然限制了会话选择器数量，但提示文案不匹配，黑名单选择器也没有 10 人上限，因此该用例无法通过。

## What Changes

- 统一会话选择页的 200 人上限提示文案为测试要求。
- 为黑名单选择页增加最多 10 人的多选上限。
- 保持已选人数统计、提交逻辑和已有联系人过滤规则不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话创建选择页的 200 人上限提示要求。
- `contact-blacklist-and-teams`: 补充黑名单选择页的 10 人选择上限要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`、`app/contacts/blacklist-picker.tsx`
- 受影响行为：会话模块与黑名单模块的人员选择上限提示
- 无新增依赖，无接口协议变更
