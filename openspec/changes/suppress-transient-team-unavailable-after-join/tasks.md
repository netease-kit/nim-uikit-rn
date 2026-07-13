## 1. Implementation

- [x] 1.1 免同意入群成功后记录短时刚加入状态
- [x] 1.2 聊天页普通初始化错误命中刚加入状态时不弹群不可用弹窗、不清会话
- [x] 1.3 群解散、离开等真实 SDK 事件仍强制执行原有不可用处理

## 2. Validation

- [x] 2.1 运行 `OPENSPEC_TELEMETRY=0 openspec validate suppress-transient-team-unavailable-after-join --type change --no-interactive`
- [x] 2.2 运行 `npx tsc --noEmit`
- [x] 2.3 运行 `npm run lint`
- [x] 2.4 验证 Metro 8081 状态
