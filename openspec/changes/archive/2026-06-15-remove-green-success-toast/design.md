## Context

当前 toast 工具保留了 `success` 类型，并且在 Web 与 RN 原生 host 中都给 `success` 配置了绿色背景。这会让部分“普通完成提示”在视觉上出现不符合当前产品预期的绿色 toast。

## Decision

不删除 `success` 类型，也不要求逐个业务点替换调用；直接统一 toast 主题映射：

- `success` 的背景色改为与 `info` 一致。
- `success` 继续作为语义类型保留，避免影响已有调用代码。
- `warning` 和 `error` 保持现状。

## Non-Goals

- 不修改业务文案。
- 不删除 `toast.success` API。
- 不改 Web 单独的 H5 UIKit less 主题，除非后续发现实际页面仍走那套组件。
