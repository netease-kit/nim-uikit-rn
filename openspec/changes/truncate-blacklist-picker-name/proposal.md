## Why

黑名单选择页中的好友昵称在超长场景下会占用多行，导致列表行高视觉不稳定，也偏离现有联系人选择列表的展示方式。

## What Changes

- 将黑名单选择页好友昵称限制为单行展示。
- 当昵称超出可用宽度时，以省略号截断。

## Capabilities

### Modified Capabilities

- `contacts-blacklist`: 补充黑名单选择页昵称单行省略展示要求。

## Impact

- 受影响代码：`app/contacts/blacklist-picker.tsx`
- 受影响行为：黑名单选择页好友昵称的列表展示方式
