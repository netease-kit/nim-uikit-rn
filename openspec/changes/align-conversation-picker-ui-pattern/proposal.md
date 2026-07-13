## Why

`/conversation/picker` 当前虽然已经补齐了取消按钮、空态、头像昵称和创建文案等细节，但 React Native 页面整体仍然是单独手写的 `ThemedView + TextInput + 自定义勾选圈 + 自定义按钮` 组合，没有对齐仓库里其它选择器页面已经采用的 `UIKitPage + UIKitSearchBar + UIKitSelectionIndicator` 实现方式。这样会让同类页面在视觉节奏、容器边界和交互 affordance 上显得不统一。

## What Changes

- 将会话选择页切换到与相关 picker 页一致的 RN UIKit 页面骨架。
- 复用统一搜索栏、候选列表选中指示器和提交按钮节奏。
- 保留当前页面已有的 AI 账号支持、已选头像面板、空态和创建逻辑。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-search-and-picker`: 补充会话选择页应与仓库内相关 picker 页保持一致实现方式和视觉结构的要求。

## Impact

- 受影响代码：`app/conversation/picker.tsx`
- 受影响行为：会话选择页的页面骨架、候选列表样式和提交区布局
- 无新增依赖，无接口协议变更
