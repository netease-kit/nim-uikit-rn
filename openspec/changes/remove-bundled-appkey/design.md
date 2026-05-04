## Overview

这次变更只调整示例仓库的初始化配置策略，不改登录交互和页面结构。核心目标是把 AppKey 从仓库源码中移除，同时保证未配置时的失败路径可预期、可解释。

## Decisions

### 单一配置源

`constants/NIMConfig.ts` 顶部保留一个空的 `appKey` 常量，RN 运行时的 `NIMConfig.appkey` 和短信登录请求头里的 `NIMConfig.userCenter.appKey` 都复用这个值，避免出现两处配置不一致。

### 失败前置到初始化与请求入口

- `stores/NIMStore.ts` 在创建 SDK 实例前检查 AppKey，缺失时直接记录明确错误并跳过初始化
- `services/auth.ts` 在发起短信登录接口前检查 AppKey，缺失时直接抛出同样的错误文案

这样可以避免把空值继续透传到 SDK 或网络层，减少模糊报错。

### 同步移除示例辅助代码中的硬编码值

`src/NEUIKit/common/utils/init.ts` 中的 H5 初始化辅助代码也移除硬编码 AppKey，避免仓库内残留共享值。
