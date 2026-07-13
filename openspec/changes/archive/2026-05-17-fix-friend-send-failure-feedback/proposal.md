## Why

当前 React Native 聊天与好友验证链路在 `104404 friend not exist` 场景下存在四个连锁问题：聊天页会重复展示“好友关系已解除”提示；从失败消息进入“好友验证”后，好友名片页直接读取不稳定的原生错误对象字段，可能触发 `Value for message cannot be cast from Double to String`；对 AI 账号仍暴露普通“添加好友”动作，会继续把用户引导到不支持的关系链路；直接给 AI 账号发送消息时仍沿用普通 P2P 发送语义，导致服务端按好友关系校验失败。

## What Changes

- 聊天页在 `104404` 发送失败时只保留时间线中的一处好友关系 tips，不再额外显示失败气泡下方的重复提示。
- 好友名片页统一兜底原生/桥接错误对象的文案提取，避免错误提示再次崩溃。
- 好友名片页识别 AI 账号并隐藏普通“添加好友”动作，避免将用户引导到必然失败的好友申请路径。
- AI 单聊发送消息时补齐与 Web 端一致的 `aiConfig`，避免继续走普通好友消息发送链路。

## Capabilities

### Modified Capabilities

- `chat-send-failure-feedback`: 明确好友关系发送失败提示的保留形态、去重与好友验证跳转后的稳态处理。
- `friend-search-and-card`: 补充 AI 账号名片与好友申请失败提示的处理要求。
- `ai-chat-send`: 补充 AI 账号消息发送需要走 AI 配置而非普通好友关系发送的要求。

## Impact

- 受影响代码：`stores/MessageStore.ts`、`src/NEUIKit/rn/chat-message-bubble.tsx`、`app/friend/friend-card.tsx`
- 受影响行为：聊天发送失败反馈、AI 账号消息发送、好友验证入口、好友名片页异常提示
- 无新增依赖，无接口协议变更
