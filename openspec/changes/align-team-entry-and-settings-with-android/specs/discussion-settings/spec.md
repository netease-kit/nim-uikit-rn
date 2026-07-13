## MODIFIED Requirements

### Requirement: Discussion Settings Page Copy

The app SHALL present discussion-group settings with discussion-specific copy.

#### Scenario: Discussion settings page UI

- **WHEN** the user opens the settings page for a discussion group
- **THEN** the hero area MUST identify the team as a discussion group
- **AND** the hero area MUST be the entry to the discussion info page
- **AND** the page MUST show the discussion avatar and discussion name
- **AND** the member row label MUST be `讨论组成员`
- **AND** the page MUST NOT show a duplicated top invite entry when the member preview area already exists
- **AND** the page MUST NOT show `我的群昵称`
- **AND** the page MUST NOT show `群介绍`
- **AND** the page MUST NOT show `群管理`
- **AND** the page MUST NOT show `群禁言`
- **AND** the bottom action MUST be `退出讨论组`

#### Scenario: Discussion info page UI

- **WHEN** the user opens the discussion info page
- **THEN** the title and editable field labels MUST use discussion-specific copy
- **AND** the page MUST NOT show `群介绍`

#### Scenario: Discussion member page UI

- **WHEN** the user opens the discussion member page
- **THEN** the title MUST use the discussion-member copy
- **AND** the page MUST NOT show an invite action in the navigation bar

### Requirement: Group Settings Page Copy And Permissions

The app SHALL present normal group settings with group-specific copy and role-based controls.

#### Scenario: Group settings page UI

- **WHEN** the user opens the settings page for a normal group
- **THEN** the hero area MUST identify the team as an advanced group
- **AND** the hero area MUST be the entry to the group info page
- **AND** the page MUST show `我的群昵称`
- **AND** the page MUST show `群管理` only to the group owner and administrators
- **AND** the existing owner-only `群禁言` behavior MUST remain unchanged
- **AND** oversized avatars and add-entry affordances in the settings hero and member preview area MUST be reduced to the Android-aligned visual scale
