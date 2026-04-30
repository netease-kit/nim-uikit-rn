## ADDED Requirements

### Requirement: Setting page matches the Web settings structure

The `/user/setting` page MUST follow the local Web setting page structure for its primary content.

#### Scenario: User opens the setting page

- **WHEN** the user navigates to `/user/setting`
- **THEN** the page shows a Web-style in-page navigation bar with title `设置`
- **THEN** the page shows a settings card with `是否开启云端会话` and `是否切换为英文`
- **AND** each item is rendered as a switch row
- **AND** the page shows a standalone `退出登录` button below the settings card

#### Scenario: Legacy RN-only settings are not shown

- **WHEN** the user opens `/user/setting`
- **THEN** the page does not show the previous cache-clearing module
- **AND** the page does not show the previous message-reminder entry
- **AND** the page does not show the extra RN-only preference switch group
