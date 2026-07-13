## Why

好友验证消息在无网络时执行同意或拒绝会直接暴露 SDK 的 `illegal state` 原始报错，不符合当前应用统一的离线提示规范。与此同时，清空验证消息仍然依赖服务端接口，导致离线场景下无法完成本地清空。

## What Changes

- 将验证消息页的同意与拒绝操作改为优先输出统一的网络异常提示，不再向用户显示原始 `illegal state`
- 将清空验证消息改为本地优先完成，并在后续刷新时继续隐藏已清空的旧记录
- 为清空验证消息补充成功反馈，保证离线场景下操作结果明确

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `friend-verification-center`: 调整验证消息在离线处理、错误提示和清空行为下的预期结果

## Impact

- `app/contacts/validlist.tsx`
- `stores/FriendStore.ts`
- `utils/app-language.ts`
- `constants/NIMConfig.ts`
