## Why

当前 RN 的 `/user/product-intro` 被实现为本地静态介绍内容页，点击“产品介绍”后不会进入云信 H5 产品介绍页面。这与现有测试用例 `0063-产品介绍-` 的预期不一致，也与 iOS 原生端通过 WebView 打开 `https://netease.im/m/` 的行为不一致。

## What Changes

- 将“关于云信”页中的“产品介绍”入口目标保持为 `/user/product-intro`，但该页改为加载云信 H5 产品介绍页面。
- 让 RN 的产品介绍页使用内嵌 WebView 打开与 iOS 一致的地址 `https://netease.im/m/`。
- 为 H5 加载失败补充基础重试反馈，避免空白页。

## Capabilities

### Modified Capabilities

- `profile-home-and-account`: 产品介绍入口从本地静态介绍内容页调整为 H5 产品介绍页面。

## Impact

- Affected code: `app/user/product-intro.tsx`
- Affected specs: `openspec/specs/profile-home-and-account/spec.md`
- No dependency or backend changes.
