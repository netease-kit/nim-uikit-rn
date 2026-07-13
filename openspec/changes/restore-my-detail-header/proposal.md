## Why

从“我的”页点击头像昵称后的 `>` 进入个人信息页时，当前页面没有显示预期的标题“个人信息”和返回按钮，导致导航反馈缺失。这个页面是个人资料主入口，必须提供明确的页头和返回路径。

## What Changes

- 为个人信息页补充可见的页内标题“个人信息”和返回按钮。
- 保持根路由全局 `headerShown: false` 的前提下，在页面内提供稳定的导航头。
- 为个人信息页补充进入后必须展示页头导航信息的规范约束。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 补充个人信息页需要展示标题和返回入口的要求。

## Impact

- 受影响代码：`app/user/my-detail.tsx`
- 受影响行为：从“我的”页进入个人信息页时的导航头展示
- 无新增依赖，无 API 变化
