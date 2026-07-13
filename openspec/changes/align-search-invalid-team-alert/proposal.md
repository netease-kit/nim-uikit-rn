## Why

会话模块测试用例 `0217-搜索后群聊解散或被移除群聊` 要求用户点击已失效的搜索结果群聊时，弹出“离开群聊”提示，并说明“您已被移出群聊或群聊已解散”。当前 React Native 的 `app/conversation/search.tsx` 对失效群聊使用了通用“无法打开/该群聊已失效”提示，不符合用例要求，因此该用例无法通过。

## What Changes

- 调整会话搜索页点击失效群聊时的提示弹窗标题和说明文案。
- 保持有效搜索结果的跳转逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话搜索页点击已失效群聊时的提示要求。

## Impact

- 受影响代码：`app/conversation/search.tsx`
- 受影响行为：会话搜索结果点击群聊失效时的提示反馈
- 无新增依赖，无接口协议变更
