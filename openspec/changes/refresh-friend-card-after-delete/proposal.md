## Why

多端登录时，一端删除好友后，另一端没有像 Android `ContactRepo` 和 iOS `ContactRepo` 一样把好友关系删除事件统一分发到联系人关系状态。RN 侧只依赖异步全量刷新，本地 `friendStore.friends` 与 UIKit `rootStore.friendStore.friends` 可能在刷新完成前继续保留旧关系。聊天页点击头像进入名片页时仍读取到旧好友关系，因此继续展示好友名片；只有杀进程重新拉取状态后才变成陌生人名片。

## What Changes

- 处理 `onFriendDeleted` 关系事件时，立即从 RN 本地好友表和 UIKit/rootStore 好友表移除被删除账号。
- 处理 `onFriendAdded`、`onFriendInfoChanged` 关系事件时，同步更新 UIKit/rootStore 好友表，保持关系判断来源一致。
- 点击头像进入个人名片前以及名片页加载时，通过 `checkFriend` 校验目标账号的实时好友关系；若服务端关系已删除，立即清理本地与 UIKit 好友缓存。
- 同步将对应 P2P 会话标题回退为账号，避免继续展示好友备注。
- 后台继续刷新完整好友列表，保持 blockList、申请列表等状态一致。
- 主动删除好友复用同一套本地好友删除应用逻辑。

## Capabilities

### Modified Capabilities

- `friend-search-and-card`: 好友关系删除后名片页应实时切换为陌生人态。

## Impact

- 受影响代码：`app/_layout.tsx`、`app/friend/friend-card.tsx`、`src/NEUIKit/rn/identity.ts`、`stores/FriendStore.ts`、`stores/ImStoreV2Bridge.ts`
- 受影响行为：多端好友关系事件、聊天页头像进入名片页、P2P 会话标题回退、UIKit 关系判断、名片页关系校验
- 不影响好友申请、添加好友、好友资料刷新和非好友名片添加好友流程
