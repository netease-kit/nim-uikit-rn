## Why

会话模块测试用例 `0211-输入内容搜索` 要求会话搜索页展示与关键字模糊匹配的好友、讨论组、高级群，并按结果类型分组，用横线分隔且对匹配字符做蓝色高亮。当前 React Native 的 `app/conversation/search.tsx` 使用平铺卡片混排结果，没有分组分隔，也没有关键字高亮，还额外混入了会话结果，因此该用例无法通过。

## What Changes

- 将会话搜索页结果调整为好友与群聊分组展示。
- 为搜索命中的昵称、账号和群名添加蓝色关键字高亮。
- 保持本地搜索和点击结果跳转聊天页的现有能力。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话搜索结果分组展示与关键字高亮要求。

## Impact

- 受影响代码：`app/conversation/search.tsx`
- 受影响行为：会话搜索页结果列表展示结构
- 无新增依赖，无接口协议变更
