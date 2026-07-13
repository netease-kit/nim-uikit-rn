## MODIFIED Requirements

### Requirement: Team-Wide Mute And Permission Changes

The team-setting flow SHALL support team-wide mute defaults, mute toggling, composer-state reactions, and role-permission changes that may happen mid-operation. The main group settings page MUST expose the group-wide chat-ban switch to the group owner and MUST NOT expose that owner-only switch to managers or normal members.

#### Scenario: Team permission changes while operating

- **WHEN** mute state or management permission changes while the user is composing or managing members
- **THEN** the setting page and chat composer converge to the latest permitted behavior

#### Scenario: Owner toggles group-wide chat ban from settings

- **WHEN** the group owner opens the main group settings page
- **THEN** the page shows a `群禁言` switch bound to the current team chat-ban mode
- **AND** toggling the switch updates the team chat-ban mode

#### Scenario: Non-owner cannot toggle group-wide chat ban from settings

- **WHEN** a manager or normal member opens the main group settings page
- **THEN** the page does not show the owner-only `群禁言` switch
