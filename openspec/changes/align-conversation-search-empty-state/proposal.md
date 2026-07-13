## Why

会话模块测试用例 `0213-搜索结果为空的页面展示` 要求会话搜索页在无结果时展示占位图和“该用户不存在”文案。当前 React Native 的 `app/conversation/search.tsx` 只有纯文本空态，没有复用 UIKit 空态占位，因此该用例无法通过。

## What Changes

- 将会话搜索页的无结果状态切换为 UIKit 空态展示。
- 保持当前的搜索输入、分组结果和点击跳转逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充会话搜索页无结果时的占位图与文案要求。

## Impact

- 受影响代码：`app/conversation/search.tsx`
- 受影响行为：会话搜索页无匹配结果时的空态展示
- 无新增依赖，无接口协议变更
