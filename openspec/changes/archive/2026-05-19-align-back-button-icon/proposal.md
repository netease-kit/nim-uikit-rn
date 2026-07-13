## Why

当前聊天页、首页搜索等页面在 Android 与 iOS 上的返回按钮样式不一致，部分页面仍使用系统默认返回箭头或蓝色高亮，和设计稿及 iOS 现状不统一。需要统一为 iOS 风格的返回图标，同时移除蓝色高亮表现。

## What Changes

- 统一受影响页面的返回按钮图标样式，使用 iOS 风格左箭头。
- 移除返回按钮的蓝色高亮着色，改为统一的中性色展示。
- 为使用系统默认 header 返回按钮和自定义 header 返回按钮的页面提供一致的 RN 实现。

## Capabilities

### New Capabilities

- `navigation-back-button`: 统一定义 React Native 页面返回按钮的图标、颜色和交互表现

### Modified Capabilities

- `conversation-search-and-picker`: 会话搜索和会话选择页面的返回按钮视觉表现对齐统一规范

## Impact

- 影响 `app/_layout.tsx` 的全局导航 header 配置。
- 影响聊天页、会话搜索页、会话选择页及其他使用自定义返回按钮的页面。
- 影响 `src/NEUIKit/rn` 中可复用的 RN 导航按钮组件封装。
