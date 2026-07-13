## 1. Spec Alignment

- [x] 1.1 Record the differentiated failed-preview requirement in OpenSpec.
- [x] 1.2 Confirm the current RN preview maps every failed last message to `【提醒消息】`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `stores/MessageStore.ts` so only blocked-send failures use `【提醒消息】`, while generic send failures keep their failed message preview.
- [x] 2.2 Re-verify testcase `0305-会话列表外露消息显示与聊天详情页最后一条显示一致` before advancing.
