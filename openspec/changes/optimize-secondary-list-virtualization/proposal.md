## Why

当前仍有多处高频列表页沿用默认渲染参数，在数据量偏大时首屏和滚动过程会出现额外开销。

## What Changes

- 为会话搜索、群成员、我的收藏列表补充虚拟列表参数。
- 为黑名单、群列表、数字人列表、验证消息、已标记消息、转发已选列表补充虚拟列表参数。
- 为黑名单选择器、位置选点列表，以及聊天页内部弹层列表补充虚拟列表参数。
- 优先收敛初始渲染批次、批量渲染窗口和裁剪行为，不改变现有业务逻辑。

## Capabilities

### Modified Capabilities

- `conversation-search`: 搜索结果列表需要使用更保守的虚拟渲染参数。
- `team-members`: 群成员列表需要使用稳定的虚拟渲染参数和行布局。
- `collection`: 我的收藏列表需要减少一次性渲染开销。
- `contacts-blacklist`: 黑名单列表需要使用稳定的虚拟渲染参数和行布局提示。
- `contacts-team-list`: 群列表需要使用稳定的虚拟渲染参数和行布局提示。
- `contacts-ai-users`: 数字人列表需要使用稳定的虚拟渲染参数和行布局提示。
- `contacts-valid-list`: 验证消息列表需要使用稳定的虚拟渲染参数和行布局提示。
- `chat-pins`: 已标记消息列表需要减少大卡片的一次性渲染开销。
- `forward-selected`: 转发已选列表需要使用更保守的虚拟渲染参数。
- `blacklist-picker`: 黑名单选择器需要使用稳定的虚拟渲染参数和行布局提示。
- `location-picker`: 位置选点列表需要使用稳定的虚拟渲染参数和行布局提示。
- `chat-detail-overlays`: 聊天页内的 @ 选择列表和受限相册网格需要收敛批次和窗口参数。

## Impact

- Affected code: `app/conversation/search.tsx`, `app/team/members.tsx`, `app/user/collection.tsx`, `app/contacts/blacklist.tsx`, `app/contacts/teamlist.tsx`, `app/contacts/ai-users.tsx`, `app/contacts/validlist.tsx`, `app/chat/pins.tsx`, `app/chat/forward-selected.tsx`, `app/contacts/blacklist-picker.tsx`, `app/chat/location-picker.tsx`, `app/chat/[id].tsx`
- Affected behavior: list rendering performance in RN
- No API, dependency, or backend impact.
