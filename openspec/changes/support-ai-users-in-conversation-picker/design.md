## Context

当前仓库已经绑定了 `@xkit-yx/im-store-v2`，并且该 store 内部包含 `AIUserStore`，能够通过 SDK 的 `V2NIMAIService.getAIUserList()` 获取当前 AppKey 关联的全部数字人。但 RN 会话创建页没有消费这部分数据，导致数字人列表在 UI 上完全缺失。

## Decision

围绕 `app/conversation/picker.tsx` 做最小修复：

1. 在 `ImStoreV2Bridge` 暴露当前 `aiUserStore` 中的数字人列表。
2. 在会话创建页进入时主动触发一次 `getAIUserListActive()`，确保当前会话页具备最新数字人数据。
3. 将好友与数字人组合成同一选择列表，并沿用现有搜索、排除当前会话对象和勾选逻辑。
4. 无搜索关键字且好友与数字人都为空时，继续展示空态图片；搜索无结果时保留搜索空态。

## Validation Impact

只验证单条用例 `0202`：

- 进入会话创建选择页
- 当 AppKey 配置了数字人时，页面可展示全部数字人
- 当 AppKey 未配置数字人且没有好友时，页面展示空态占位
