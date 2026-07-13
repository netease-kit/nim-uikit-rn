## Why

好友名片页删除好友成功后固定 `router.replace('/(tabs)/contacts')`，不管用户是从聊天页、群成员页、聊天设置页还是联系人列表进入，都会回到好友列表。该行为与原生常见返回语义不一致，也打断了用户当前任务上下文。

## What Changes

- 删除好友成功后优先返回上一页。
- 当没有可返回页面时，保留回到好友列表的兜底行为。
- 不改变删除好友 API、确认弹窗、错误提示和本地好友关系清理逻辑。

## Capabilities

### Modified Capabilities

- `friend-card-navigation`: 好友名片删除好友后应回到来源页面。

## Impact

- 受影响代码：`app/friend/friend-card.tsx`
- 受影响行为：从聊天页、联系人页、群成员页、聊天设置页等入口进入好友名片后的删除成功导航
- 不影响陌生人名片、添加好友、备注编辑和打开聊天流程
