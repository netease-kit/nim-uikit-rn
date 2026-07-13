## Why

会话模块测试用例 `0278-长按会话A` 要求长按会话时仅出现“置顶该会话/取消置顶、删除会话”两个操作。当前 React Native 长按菜单额外包含“开启免打扰”和“清除未读”，与测试要求不一致。

## What Changes

- 收敛会话长按 ActionSheet 的操作项。
- 保留置顶/取消置顶和删除会话。
- 不影响左滑场景和其他入口的免打扰设置能力。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充长按会话菜单项范围要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话列表长按菜单的动作集合
- 无新增依赖，无接口协议变更
