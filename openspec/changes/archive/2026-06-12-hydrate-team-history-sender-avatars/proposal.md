## Why

群聊历史消息中，非好友发送者如果本地尚未缓存用户资料，头像会回退成 accid 生成的默认头像，而不是展示该成员预设的自定义头像。当前聊天页只补拉团队通知消息中的账号资料，普通历史消息发送者没有稳定的资料补齐链路。

## What Changes

- 群聊可见消息变化时，主动补拉普通消息发送者的用户资料，覆盖历史分页中新出现的非好友发送者。
- 让 RN UIKit 头像解析在群聊场景下使用 `teamId` 维度参与头像和复用 key 计算。
- 保持现有好友头像、AI 头像、本人头像和默认头像兜底规则不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 群聊历史消息中的非好友发送者头像需要在资料补齐后展示其预设自定义头像。

## Impact

- Affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/components.tsx`, `src/NEUIKit/rn/identity.ts`
- Affected behavior: team chat sender avatar hydration for history and visible messages
- No API, dependency, or backend impact.
