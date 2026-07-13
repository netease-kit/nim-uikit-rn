# Proposal

## Why

RN 当前群内昵称展示没有完全对齐 H5/UIKit 规则。设置群昵称后，群成员列表和群消息仍可能显示好友备注或个人昵称，并且聊天页不一定会实时收到群成员资料更新。

## What Changes

- 将 RN UIKit 昵称优先级调整为群昵称优先于好友备注。
- 监听群成员资料更新事件并刷新本地群成员缓存。
- 让群成员列表和群消息发送者展示在群昵称变更后实时更新。

## Capabilities

### Modified Capabilities

- `team-settings-and-members`: 群成员列表需要实时展示最新群昵称。
- `chat-message-content`: 群聊消息发送者名称需要实时展示最新群昵称。

## Impact

- Affected code: `src/NEUIKit/rn/identity.ts`, `stores/TeamStore.ts`, `app/_layout.tsx`, `app/team/settings.tsx`
- Affected behavior: group nickname display precedence and realtime refresh in RN
- No API, dependency, or backend impact.
