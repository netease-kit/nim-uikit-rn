## Why

验证消息列表里混入当前账号自己发出的好友申请时，Android 设备上会看到一条“待处理”但无法同意或拒绝的记录。该记录不属于当前账号可处理的验证消息，应从验证消息中心过滤；已处理的入站验证消息仍应保留展示。

## What Changes

- 验证消息列表中的账号区域支持点击打开对端账号名片。
- 验证消息列表过滤当前账号作为 `applicantAccountId` 的自己发出的申请。
- 当前账号作为接收人时，待处理、已同意、已拒绝等入站验证消息继续显示。
- 通讯录页“验证消息”入口显示入站待处理验证消息数，点击入口后立即清空该数字。
- 收到的待处理申请保留同意/拒绝按钮，按钮行为不被行点击影响。

## Capabilities

### Modified Capabilities

- `friend-verification-center`: 验证消息记录过滤自己发出的申请；入站待处理数显示在通讯录入口并在进入验证消息页时清空；入站记录除了处理按钮外，还提供对端账号名片入口。

## Impact

- Affected code: `app/(tabs)/contacts.tsx`, `app/contacts/validlist.tsx`, `stores/FriendStore.ts`
- Affected specs: `openspec/specs/friend-verification-center/spec.md`
- No API or dependency changes
