## Why

当前仓库已经支持应用内语言切换，但 React Native 路由页和 `src/NEUIKit/rn` 适配层里仍存在不少中文硬编码。用户将语言切换为英文后，会话列表、聊天页、联系人页以及部分聊天子页面仍会显示中文，导致语言偏好不能完整覆盖 RN 主流程。

## What Changes

- 为 RN 端主流程补齐缺失的英文翻译词条。
- 将 RN 路由页与 `src/NEUIKit/rn` 中高频路径的中文硬编码改为统一走应用翻译函数。
- 保持现有业务逻辑、页面结构和 UIKit 交互不变，只修正文案来源和多语言覆盖。

## Capabilities

### Modified Capabilities

- `language-preferences`: 明确英文语言偏好需要覆盖 RN 主流程页面，而不只是设置页和个人页链路。
- `conversation-list-behavior`: 会话列表文案需要跟随当前应用语言。
- `chat-detail`: 聊天页及其高频子页面文案需要跟随当前应用语言。
- `contacts-home`: 通讯录主页文案需要跟随当前应用语言。

## Impact

- 受影响代码：`utils/app-language.ts`, `app/`, `src/NEUIKit/rn/`
- 受影响行为：英文语言下的会话列表、聊天页、通讯录页和若干聊天子页文案展示
- 无接口协议变更，无新增原生依赖
