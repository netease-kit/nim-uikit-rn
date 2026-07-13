# Validated Web MVP Example

这是一次基于 `im-feature-foundation` 的 Web 版实战验证结果。

## 验证目标

在没有参考项目的前提下，仅依赖 `im-feature-foundation` 的 reference：

- 生成一个 `React Web + React Router + MobX` 的 IM MVP 骨架
- 打通登录、会话、聊天三条主链路
- 验证项目结构和 TypeScript 静态检查是否自洽

## 验证输出目录

`/tmp/im-foundation-validation-web`

## 已生成文件类型

- 路由文件
- 页面文件
- store 文件
- service 文件
- domain model 文件
- utils 文件
- `package.json`
- `tsconfig.json`

## 核心文件

- `src/routes/index.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/ConversationsPage.tsx`
- `src/pages/ChatPage.tsx`
- `src/stores/AuthStore.ts`
- `src/stores/SessionStore.ts`
- `src/stores/MessageStore.ts`
- `src/services/AuthService.ts`
- `src/services/SessionService.ts`
- `src/services/MessageService.ts`

## 验证结果

已通过：

- `tsc --noEmit`

说明：

- 为了完成静态验证，补装了 `react-router-dom`
- 该骨架已经达到“结构自洽、可继续扩展”的水平
- 它仍然是 starter scaffold，不是完整生产实现

## 结论

`im-feature-foundation` 现在已经至少完成了两套实战验证：

- Expo Router + React Native
- React Router + Web

这意味着它不仅能给出抽象模板，还能产出经过静态检查验证的双技术栈 MVP 骨架。

## 建议使用方式

如果用户明确是 Web / H5 项目，推荐顺序：

1. `architecture-blueprint.md`
2. `cross-platform-adaptation.md`
3. `code-skeleton-template.md`
4. `code-templates/react-router-web-pack.md`
5. `validated-web-mvp-example.md`
