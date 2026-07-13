# IM Data Models

用于在没有现成代码时定义核心实体。

## User

关键字段：

- userId
- nickname
- avatar
- mobile
- remark
- blocked

## Session

关键字段：

- sessionId
- type: p2p | team
- targetId
- title
- avatar
- lastMessage
- unreadCount
- stickTop
- muted
- updatedAt

## Message

关键字段：

- messageId
- clientId
- sessionId
- senderId
- receiverId
- type
- text
- attachment
- status: sending | sent | failed | revoked
- createdAt
- updatedAt
- replyTo
- pinned

## FriendApplication

关键字段：

- applicationId
- fromUserId
- toUserId
- postscript
- status
- createdAt

## Team

关键字段：

- teamId
- name
- avatar
- intro
- ownerId
- memberCount
- chatBannedMode

## TeamMember

关键字段：

- teamId
- userId
- role
- teamNick
- joinedAt

## Preference

关键字段：

- notificationsEnabled
- showMessageDetail
- soundEnabled
- vibrationEnabled
- readReceiptEnabled
- appearance

## 建模原则

- 先定义业务字段，再考虑 SDK 字段映射
- 页面层不要直接依赖原始 SDK 返回结构
- 如需适配多个端，优先定义统一领域模型
