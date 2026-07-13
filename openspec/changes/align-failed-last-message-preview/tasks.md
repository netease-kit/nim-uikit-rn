## 1. Spec Alignment

- [x] 1.1 Record the failed-last-message preview requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0260` currently fails because RN reuses the failed message content instead of `【提醒消息】`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `stores/MessageStore.ts` so a send-failed last message maps to the required conversation-list preview text.
- [x] 2.2 Re-verify testcase `0260-会话列表外露消息显示与聊天详情页最后一条显示一致` only, and do not advance to the next testcase until it passes.
