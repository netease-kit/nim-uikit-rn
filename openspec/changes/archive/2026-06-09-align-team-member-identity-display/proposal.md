## Why

群设置页和群成员列表的成员展示与 Android、iOS 原生端不一致：设置页成员头像下方展示了昵称，成员列表昵称下方展示了 accid，普通成员也展示“成员”身份文案，群主/管理员标识样式也没有对齐原生端。

## What Changes

- 群设置页成员预览只展示成员头像，不在头像下方展示昵称。
- 群成员列表只展示成员昵称，不在昵称下方展示 accid。
- 普通成员不展示身份标识。
- 群主和管理员使用右侧圆角描边标签展示，样式对齐原生端的浅灰背景、灰色文字和边框。

## Capabilities

### Modified Capabilities

- `team-settings-and-members`: 补充群设置成员预览和群成员列表身份标签展示规则。

## Impact

- 受影响代码：`app/team/settings.tsx`、`app/team/members.tsx`
- 受影响行为：群设置页成员预览、群成员列表成员行展示
- 无新增依赖，无接口协议变更
