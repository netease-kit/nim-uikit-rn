## Why

多端场景下，一端删除好友后，另一端虽然能收到好友删除事件，但会话列表标题仍可能继续显示旧备注名。此时该会话应立即回退为对方个人昵称，而不是继续显示已失效的好友备注。

## What Changes

- 在 P2P 非好友状态下，统一身份解析不再接受残留的好友备注回退。
- 会话列表在收到多端好友删除后的下一次重算中，直接回退为用户昵称。
- 群聊成员称谓、仍为好友时的备注优先级不变。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 多端删除好友后，P2P 会话标题应从好友备注回退到个人昵称。

## Impact

- Affected code: `src/NEUIKit/rn/identity.ts`
- Affected behavior: p2p conversation title fallback after remote friend deletion
- No API or dependency changes.
