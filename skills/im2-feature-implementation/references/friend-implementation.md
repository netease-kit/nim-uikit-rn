# Friend Implementation

用于回答“当前仓库里的联系人 / 好友功能是怎么做的”。

## 主要落点

- 通讯录入口：`app/(tabs)/contacts.tsx`
- 好友相关页面：`app/friend/*`
- 黑名单 / 验证消息：`app/contacts/blacklist.tsx`、`app/contacts/validlist.tsx`
- 好友状态：`stores/FriendStore.ts`
- 用户资料：`stores/UserStore.ts`

## 当前实现套路

1. `app/(tabs)/contacts.tsx` 负责联系人首页和快捷入口
2. `stores/FriendStore.ts` 负责好友列表、申请列表、未读申请数、黑名单、备注修改
3. 用户展示名优先由好友备注、用户资料、账号依次兜底
4. 好友卡片、好友备注、添加好友等细分页面放在 `app/friend/*`
5. 与个人资料相关的展示信息由 `stores/UserStore.ts` 兜底，不在每个页面重复拼装

## 新增好友功能时的默认落点

- 通讯录入口和快捷入口：`app/(tabs)/contacts.tsx`
- 好友操作页：`app/friend/*.tsx`
- 好友申请、备注、黑名单、删除好友：`stores/FriendStore.ts`
- 用户昵称、头像、资料展示：`stores/UserStore.ts`

## 常见扩展点

- 添加好友
- 处理好友申请
- 好友备注
- 删除好友
- 黑名单管理
- 好友资料页展示

## 典型实现步骤

1. 先确认功能是联系人首页入口还是好友详情操作
2. 页面改动放 `app/(tabs)/contacts.tsx` 或 `app/friend/*`
3. 业务动作优先进入 `stores/FriendStore.ts`
4. 如果会影响展示名，检查 `stores/UserStore.ts` 和会话列表展示
5. 最后验证通讯录、好友详情、会话显示名联动

## 最少测试面

- 好友列表展示
- 验证消息未读数变化
- 添加好友成功 / 失败
- 通过 / 拒绝好友申请
- 修改备注成功 / 清空备注
- 黑名单添加 / 移除
- 删除好友后的回归影响
