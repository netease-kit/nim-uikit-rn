## Why

`/conversation/search` 当前虽然具备基本搜索能力，但 React Native 页面实现是单独手写的一套输入框、清空按钮、容器间距和列表骨架，没有遵循仓库里其它搜索型页面已经形成的 `UIKitWhitePage + UIKitSearchBar + UIKitSectionLabel` 实现方式。结果是它在视觉层次、留白、空白初始态和列表节奏上都和相邻页面不一致，用户感知会比较突兀。

## What Changes

- 将会话搜索页切换到与相关搜索页一致的 RN UIKit 页面骨架。
- 复用统一搜索栏、分组标题和结果列表间距样式，保留现有占位文案、结果分组、高亮和跳转规则。
- 让无输入时的页面呈现方式与其它搜索页保持一致，避免额外的独立提示文案。
- 移除搜索页顶部的建群入口，保持该页只承担搜索与跳转职责。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-search-and-picker`: 补充会话搜索页应与仓库内相关搜索页保持一致实现方式和视觉结构的要求。

## Impact

- 受影响代码：`app/conversation/search.tsx`
- 受影响行为：会话搜索页的页面骨架、搜索栏样式、分组标题、空白初始态和顶部操作入口
- 无新增依赖，无接口协议变更
