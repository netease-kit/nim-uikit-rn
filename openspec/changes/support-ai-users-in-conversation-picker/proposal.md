## Why

会话模块测试用例 `0202-数字人选择页面显示所有数字人` 要求数字人选择页展示当前 AppKey 配置的全部数字人，未配置时展示空占位。当前 React Native 的 `app/conversation/picker.tsx` 只接入了 `friendStore.friendList`，完全没有接入 `im-store-v2`/SDK 的 AI 数字人列表，因此该用例无法通过。

## What Changes

- 为会话创建选择页接入 AI 数字人列表。
- 页面进入时主动拉取当前 AppKey 下的数字人配置。
- 列表筛选、搜索和展示同时覆盖好友与数字人。
- 当没有好友且没有数字人配置时，继续展示空态占位。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话创建选择页需要展示 AppKey 配置数字人的要求。

## Impact

- 受影响代码：`stores/ImStoreV2Bridge.ts`、`app/conversation/picker.tsx`、`utils/nim-sdk.ts`
- 受影响行为：会话创建页联系人选择列表的数据来源
- 无新增依赖，无接口协议变更
