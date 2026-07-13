## Why

云端会话多端登录时，一端离线期间无法收到另一端删除会话的实时事件。当前 RN 重连后会刷新云端会话列表，但 `@xkit-yx/im-store-v2` 的 `getConversationListActive` 只把服务端返回的会话合并进内存，不会移除已经不在云端结果中的旧会话，导致被另一端删除的会话在离线端联网后仍残留。

两端都在线时，`@xkit-yx/im-store-v2` 的云端会话 Store 会响应 SDK `onConversationDeleted` 事件并移除云端会话，但 RN 会话列表还会合并 RN 本地 fallback 会话。远端删除只清掉云端 Store 时，已删除会话会从 RN fallback 数据重新出现在列表中。

## What Changes

- 云端会话刷新第一页后，将服务端返回范围内已不存在的旧会话从内存会话列表中移除。
- 该裁剪只在云端会话模式、从 offset 0 刷新且当前内存数量可由本次服务端结果覆盖时执行，避免误删分页外未拉取会话。
- 监听云端会话删除事件，在删除云端 Store 会话的同时清理 RN 本地 fallback 会话。
- 重连主同步完成、会话同步完成、手动下拉刷新继续走统一刷新入口。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补齐云端会话离线后同步另一端删除会话的要求。

## Impact

- 受影响代码：`stores/ImStoreV2Bridge.ts`
- 受影响行为：云端会话模式下重连/刷新、在线多端删除后的会话列表收敛
