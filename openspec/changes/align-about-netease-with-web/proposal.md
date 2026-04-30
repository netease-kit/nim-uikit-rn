## Why

当前 `/user/aboutNetease` 页面只实现了简化版内容，与本地 Web 端的“关于云信”页面在信息结构和链接行为上不一致。

## What Changes

- 让 RN 版“关于云信”页面对齐 Web 端的信息结构。
- 增加 `IM版本号` 展示项。
- 将“产品介绍”调整为打开云信官网外链。

## Capabilities

### New Capabilities

- `about-netease-page`: 定义“关于云信”页面与 Web 对齐的结构和链接行为。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/user/aboutNetease.tsx`
- Affected specs: `openspec/changes/align-about-netease-with-web/specs/about-netease-page/spec.md`
- No API, dependency, or backend impact.
