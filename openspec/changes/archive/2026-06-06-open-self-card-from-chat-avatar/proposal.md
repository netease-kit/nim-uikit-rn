## Why

聊天消息里他人头像是可点击入口，但自己发送的消息右侧头像只是静态 View，没有绑定点击事件。同时通用名片路由没有对当前登录账号做专门分流，自己账号不应进入普通好友名片。

## What Changes

- 将自己消息右侧头像改为可点击头像入口。
- 点击自己头像时打开个人名片页 `/user/my-detail`。
- 保持他人头像、数字人头像原有名片路由行为。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天消息头像点击应支持打开自己的个人名片。

## Impact

- 受影响代码：`src/NEUIKit/rn/chat-message-bubble.tsx`、`src/NEUIKit/rn/identity.ts`
- 受影响行为：聊天页消息头像点击
- 不影响消息收发、长按头像 @ 人、他人名片或数字人名片路由
