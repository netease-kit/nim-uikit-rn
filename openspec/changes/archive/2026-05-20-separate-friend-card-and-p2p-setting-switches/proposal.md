## Why

RN 当前把单聊设置页和好友名片页的开关职责混在了一起：好友名片页仍展示消息提醒开关，单聊设置页仍展示黑名单开关，陌生人名片页也复用了黑名单开关。这与原始 `TestCases` 中各页面的 UI 归属不一致，也会让两个页面的职责边界变得重复。

## What Changes

- 单聊设置页仅保留消息提醒和聊天置顶等聊天设置能力，不再展示黑名单开关。
- 好友名片页保留加入黑名单开关，不再展示消息提醒开关。
- 陌生人名片页不展示黑名单开关，仅保留添加好友等陌生人操作。

## Capabilities

### Modified Capabilities

- `p2p-session-settings`: 收敛单聊设置页的开关职责。
- `friend-search-and-card`: 收敛好友名片页和陌生人名片页的操作项。

## Impact

- 受影响代码：`app/session/p2p-settings.tsx`、`app/friend/friend-card.tsx`
- 受影响行为：单聊设置、好友名片、陌生人名片的开关展示
- 无新增依赖，无协议变更
