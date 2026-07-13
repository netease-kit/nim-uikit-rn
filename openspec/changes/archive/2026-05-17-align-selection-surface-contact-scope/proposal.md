## Why

会话模块测试用例 `0203-选择页面联系人显示` 要求多个选择页对联系人范围采用一致的过滤规则：创建群聊、单聊设置建群、群成员邀请页都要覆盖联系人与数字人，并排除自己、黑名单及当前上下文里不应再次展示的对象；黑名单选择页则只允许好友，不应展示数字人。当前仓库只有 `app/conversation/picker.tsx` 部分满足，`app/team/member-picker.tsx` 仍只展示好友，黑名单页右上角也还没有选择好友加入黑名单的选择流。

## What Changes

- 对齐会话和群成员邀请页的联系人选择范围。
- 为群成员邀请页接入数字人，并过滤已在群中的好友/数字人、自己和黑名单好友。
- 为黑名单页补充好友选择加入黑名单的选择流，并明确不展示数字人。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-create-entry`: 补充群成员邀请页的联系人和数字人过滤规则。
- `contact-blacklist-and-teams`: 补充黑名单选择页只展示好友、不展示数字人的规则。

## Impact

- 受影响代码：`app/team/member-picker.tsx`、`app/contacts/blacklist.tsx`
- 可能新增辅助选择页或参数，用于黑名单选择流
- 无新增依赖，无接口协议变更
