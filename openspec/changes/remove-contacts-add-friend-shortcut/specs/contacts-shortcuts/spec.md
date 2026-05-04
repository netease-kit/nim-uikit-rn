## ADDED Requirements

### Requirement: Contacts top shortcuts exclude duplicate add-friend entry

The contacts page MUST show the validation message, blacklist, and team-list shortcuts in its top shortcut area, and MUST NOT show a second add-friend shortcut below the team-list item.

#### Scenario: Contacts page renders shortcut rows

- **WHEN** a user opens the contacts page
- **THEN** the top shortcut area shows entries for `验证消息`, `黑名单`, and `我的群聊`
- **AND** no `添加好友` shortcut row is rendered in that shortcut area
- **AND** the header add-friend action remains available
