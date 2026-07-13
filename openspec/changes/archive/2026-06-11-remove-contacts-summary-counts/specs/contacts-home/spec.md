## MODIFIED Requirements

### Requirement: Contacts Home Structure

The app SHALL provide a contacts home page that exposes the friend directory, verification center, blacklist, my-team-list, my-AI-user-list, and add-friend entry points required by the tests.

#### Scenario: Viewing contacts home

- **WHEN** the user opens the Contacts tab
- **THEN** the page shows the required shortcuts and friend directory structure
- **AND** the page does not show a friend-count or team-count summary strip below the shortcuts
- **AND** the `我的数字人` shortcut appears below `我的群聊`
