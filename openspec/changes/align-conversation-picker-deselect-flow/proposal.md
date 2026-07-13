## Why

会话模块测试用例 `0204-取消选择好友、数字人` 要求用户既可以在联系人列表中反选已勾选成员，也可以通过已选择区域点击头像取消选择。当前 React Native 的 `app/conversation/picker.tsx` 只有列表勾选状态，没有已选择头像列表与对应的点击取消交互，因此该用例无法通过。

## What Changes

- 为会话选择页增加已选择成员展示区域。
- 支持点击已选择区域中的好友或数字人头像直接取消选择。
- 保持现有列表勾选/取消勾选逻辑和创建流程不变，并确保创建结果只包含当前仍处于选中态的成员。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话选择页的已选择成员展示与点击头像取消选择要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：会话模块创建群聊/讨论组的成员选择交互
- 无新增依赖，无接口协议变更
