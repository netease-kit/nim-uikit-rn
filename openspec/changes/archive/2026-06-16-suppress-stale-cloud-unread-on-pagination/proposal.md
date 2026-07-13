## Why

云端会话模式下，登录后消息 Tab 已确认没有未读红点，但上滑分页拉取更多旧会话时，部分旧会话可能短暂显示行级未读，随后又自动消失。该闪现来自分页会话的云端原始 `unreadCount` 与 RN 本地已清未读水位的展示抑制不一致，导致会话行和消息 Tab 对“无未读”的判断短暂不同步。

## What Changes

- 云端会话展示归一化时，如果云端总未读为 0，所有展示会话的 `unreadCount` 和 `aitMsgs` 都按 0 处理。
- 云端总未读大于 0 时，继续使用现有已清未读水位抑制逻辑，允许新消息产生未读。
- 不改变云端会话分页、SDK 原始数据、清未读接口或本地会话模式。

## Impact

- Affects cloud conversation list row unread display.
- Aligns Messages tab red-dot state and conversation-row unread state during pagination.
- No SDK API or storage format changes.
