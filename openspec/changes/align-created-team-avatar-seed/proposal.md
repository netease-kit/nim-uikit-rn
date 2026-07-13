## Why

会话模块测试用例 `0219-创建群聊/讨论组邀请好友及数字人加入群聊` 要求新创建的高级群/讨论组使用系统随机生成的群头像。当前 React Native 的 `stores/TeamStore.ts` 创建群时只传入名称、类型和人数上限，没有设置头像，因此该用例无法通过。

## What Changes

- 为 React Native 的高级群创建流程补充随机群头像。
- 保持现有创建成员、群名生成和创建后跳转逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充新创建高级群/讨论组的默认随机头像要求。

## Impact

- 受影响代码：`stores/TeamStore.ts`、`app/conversation/picker.tsx`
- 受影响行为：会话模块创建高级群/讨论组时的初始头像
- 无新增依赖，无接口协议变更
