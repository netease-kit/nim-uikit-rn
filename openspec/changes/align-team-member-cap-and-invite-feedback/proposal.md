## Why

会话模块测试用例 `0224-高级群/讨论组 人数上限3000` 要求高级群/讨论组总人数上限为 3000，人满后邀请成员失败。当前 React Native 的 `stores/TeamStore.ts` 在创建高级群时把 `memberLimit` 固定成了 `200`，这会把总人数上限错误地下压到 200，与后续邀请和群成员相关用例都不一致。

## What Changes

- 将高级群创建时的总人数上限从 200 调整为 3000。
- 保持单次选择联系人上限 200 的现有约束不变。
- 继续沿用邀请失败时留在当前邀请页的交互。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充高级群/讨论组总人数上限为 3000 的要求。

## Impact

- 受影响代码：`stores/TeamStore.ts`
- 受影响行为：高级群/讨论组创建后的成员容量
- 无新增依赖，无接口协议变更
