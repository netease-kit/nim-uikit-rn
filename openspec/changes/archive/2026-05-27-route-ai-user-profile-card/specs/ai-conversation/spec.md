## ADDED Requirements

### Requirement: AI user profile entry opens the dedicated AI profile page

RN MUST route AI user profile entry points to a dedicated AI profile page instead of the normal friend-card page.

#### Scenario: Open AI profile from chat message avatar

- **WHEN** the user taps an AI user's avatar in chat detail
- **THEN** RN opens the dedicated AI profile page for that account
- **AND** it does not open the normal friend-card page

#### Scenario: Open AI profile from P2P settings

- **WHEN** the current P2P peer is an AI user
- **AND** the user taps `查看好友名片` in chat settings
- **THEN** RN opens the dedicated AI profile page for that account

#### Scenario: Open AI profile from my AI users list

- **WHEN** the user opens the my AI users list
- **AND** taps an AI user row
- **THEN** RN opens the dedicated AI profile page for that account
- **AND** it does not directly open the chat detail page

### Requirement: AI profile page uses AI-appropriate actions

RN AI profile page MUST align with native AI profile behavior by avoiding normal friend-only actions.

#### Scenario: Render AI profile page

- **WHEN** RN opens an AI profile page
- **THEN** the page shows the AI user's basic identity information in the header area
- **AND** the page provides a chat action
- **AND** the page does not show a page-title label such as `数字人名片`
- **AND** the page does not show birthday, mobile, email, or signature rows
- **AND** the page does not show friend alias editing, blacklist switch, add-friend action, or delete-friend action
