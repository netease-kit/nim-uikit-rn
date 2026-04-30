# Team Implementation

用于回答“当前仓库里的群组 / 团队功能是怎么做的”。

## 主要落点

- 群列表：`app/contacts/teamlist.tsx`
- 群设置和成员页：`app/team/*`
- 群会话入口也会出现在 `app/chat/[id].tsx`、`app/session/p2p-settings.tsx`
- 团队状态：`stores/TeamStore.ts`
- 会话级设置：`stores/ConversationStore.ts`

## 当前实现套路

1. 团队基础信息和成员集合归 `stores/TeamStore.ts`
2. 群会话的置顶、免打扰等仍归 `stores/ConversationStore.ts`
3. 群详情、群设置、成员选择、群昵称、群头像等页面放在 `app/team/*`
4. 群成员展示名优先读 team member nick，再回退到好友备注和用户资料
5. 群管理动作由页面触发，真正的 SDK 调用放在 `stores/TeamStore.ts`

## 新增群功能时的默认落点

- 群设置页、群成员页、编辑页：`app/team/*.tsx`
- 创建群、邀请成员、踢人、改群资料、改群昵称：`stores/TeamStore.ts`
- 群消息免打扰、会话置顶：`stores/ConversationStore.ts`

## 常见扩展点

- 创建群聊
- 邀请成员
- 群资料编辑
- 我的群昵称
- 群禁言
- 群成员管理
- 退群 / 解散群

## 典型实现步骤

1. 先判断是群资料能力还是群会话设置能力
2. 资料能力优先改 `stores/TeamStore.ts`
3. 会话设置能力优先改 `stores/ConversationStore.ts`
4. 页面入口落在 `app/team/*`
5. 最后验证群详情、群成员、群会话三个视角

## 最少测试面

- 群资料加载成功 / 失败
- 修改群名称 / 介绍 / 头像 / 我的群昵称
- 邀请成员 / 踢人
- 群禁言切换
- 群消息提醒 / 置顶切换
- 退群 / 解散群
- 群成员展示名回显
