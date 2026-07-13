## Why

会话列表测试期望删除会话后直接生效，不再出现二次确认弹窗。当前 React Native 会话列表在左滑删除和长按删除后，会额外弹出一个确认 ActionSheet，导致交互多了一步，与预期不一致。

## What Changes

- 移除会话列表删除会话后的二次确认弹窗。
- 保持左滑删除和长按删除都直接执行删除。
- 保留现有删除中的防重复提交、断网失败提示和删除失败提示。

## Capabilities

### Modified Capabilities

- `conversation-list`: 调整删除会话交互为直接删除。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话列表左滑删除、长按删除
- 无新增依赖，无接口协议变更
