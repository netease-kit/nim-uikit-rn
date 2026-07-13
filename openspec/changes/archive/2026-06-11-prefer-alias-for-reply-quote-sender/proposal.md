## Why

聊天页回复消息时，引用区展示的原消息发送者昵称没有优先使用好友备注，而是先取了群昵称。这与期望的称谓优先级不一致，也会让回复引用区与其它好友称谓展示不统一。

## What Changes

- 调整统一 UIKit 称谓解析在普通聊天展示场景下的优先级。
- 让回复引用区发送者昵称按 `备注 > 群昵称 > 个人昵称 > accid` 解析。
- 保持需要忽略备注的特定场景继续显式使用 `ignoreAlias` 分支。

## Capabilities

### Modified Capabilities

- `chat-detail`: 回复消息引用区发送者昵称应优先展示好友备注。

## Impact

- Affected code: `src/NEUIKit/rn/identity.ts`
- Affected behavior: reply quote sender-name precedence in chat detail
- No API or dependency changes.
