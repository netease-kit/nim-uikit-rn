## Context

这次修复聚焦好友选择页面头部返回动作的文案与行为对齐，不改动好友列表、搜索、选择计数和创建群聊逻辑。

## Decision

在 `app/conversation/picker.tsx` 的 `Stack.Screen` 头部配置中显式提供左侧 `取消` 按钮：

1. 左上角显示 `取消`。
2. 点击执行 `router.back()`。
3. 保持页面标题 `选择` 和中间标题对齐不变。

## Validation Impact

只验证单条用例 `0200`：

- 进入好友选择页面
- 点击左上角 `取消`
- 确认返回上一页
