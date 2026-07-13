## Why

删除好友时，好友名片页会在好友关系刷新与路由返回之间短暂进入不一致状态，导致当前页面崩溃。这个问题直接影响通讯录核心流程，需要补齐删除成功后的稳定过渡行为。

## What Changes

- 调整好友名片删除好友后的页面过渡，删除提交后进入稳定的退出态，直到返回通讯录。
- 调整好友删除成功后的本地好友关系同步，避免当前页面继续基于已失效的好友数据重渲染。
- 补充删除好友流程的规格，明确删除成功后不得崩溃且必须稳定返回通讯录。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `friend-search-and-card`: 删除好友成功后的关系变更过渡与返回行为需要明确为稳定且不可崩溃。

## Impact

受影响代码包括 [app/friend/friend-card.tsx](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/app/friend/friend-card.tsx)、[stores/FriendStore.ts](/Users/xumengxiang/Documents/00.NetEase/05.IM/im2-rn-demo/stores/FriendStore.ts) 和 `friend-search-and-card` 规格。
