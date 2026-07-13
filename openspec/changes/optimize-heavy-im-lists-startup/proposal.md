## Why

真机登录大号账号后，主同步完成会拉取好友、会话、群和本人资料。3000 好友账号会放大好友列表和会话列表派生计算成本：多个 observer 在 render 期间读取列表时会重复转数组、排序、过滤、分组和解析展示信息。同时 im-store-v2/NIM 调试日志会格式化超大会话、好友和 AI 用户对象，导致 JS 线程长时间忙碌，表现为页面卡顿、按钮点击延迟和快速滑动空白。

iOS Console 还出现大量 `subscribeEvent` 的 416 rate-limit 错误，说明 RN 在线状态订阅在大号场景下存在重复订阅、全量订阅或过高频订阅问题，需要对齐原生端按好友列表/会话窗口批量订阅、按 SDK 单次上限分片并过滤已订阅账号的策略。

## What Changes

- 为本地好友 store 增加稳定的排序快照和版本号，只在好友数据实际变化时重建排序结果。
- 让通讯录首页、会话搜索、建群/邀请/黑名单/转发选择器基于好友版本重算派生列表，而不是每次 render 都重新处理 3000 条好友。
- 关闭 RN 绑定 im-store-v2 时的 debug 日志，避免格式化超大对象阻塞 JS 线程。
- 缓存 im-store-v2 会话列表和展示会话派生数组，避免会话页每次 render 都生成新数组并重算整页数据。
- 提高会话列表快速滑动时的虚拟列表渲染窗口和批量渲染能力，减少空白 cell。
- 在线状态订阅改为集中管理：好友状态由本地好友列表变化触发批量订阅，不监听 im-store-v2 rootStore 好友集合；会话状态订阅首批 P2P 会话账号和滚动窗口账号；底层按 100 个账号分片、过滤已订阅账号，并在 416 限流后冷却重试。
- 将 SDK 日志级别从 debug 降低到 warn，减少真机 Console/Logcat 的高频调试日志。
- 打断 `ConversationStore` 和 `MessageStore` 的静态 require cycle，减少启动期警告和未初始化值风险。
- 保持现有 UI、排序规则、搜索规则、黑名单过滤和导航行为不变。

## Capabilities

### Modified Capabilities

- `heavy-im-lists`: 大量好友账号登录和进入好友相关列表时，RN 页面必须避免重复同步处理全量好友数据，保持页面可交互。

## Impact

- Affected code: `stores/FriendStore.ts`, `stores/ImStoreV2Bridge.ts`, `stores/UserStore.ts`, `stores/ConversationStore.ts`, `src/NEUIKit/rn/user-status.ts`, `constants/NIMConfig.ts`, `app/(tabs)/contacts.tsx`, `app/(tabs)/index.tsx`, `app/conversation/search.tsx`, `app/conversation/picker.tsx`, `app/team/member-picker.tsx`, `app/contacts/blacklist-picker.tsx`, `app/chat/forward.tsx`
- Affected behavior: large-account startup and friend-list derived rendering performance in RN
- No API, dependency, backend, or visual-design impact.
