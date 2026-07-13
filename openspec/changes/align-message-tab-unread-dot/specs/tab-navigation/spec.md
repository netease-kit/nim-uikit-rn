## MODIFIED Requirements

### Requirement: Bottom Navigation Unread Indicators

The app SHALL show unread indicators on bottom-tab entry points when relevant unread state exists.

#### Scenario: Messages tab has unread conversations

- **WHEN** the app has any total unread conversation count
- **THEN** the bottom messages tab icon MUST display a red unread dot

#### Scenario: Muted conversations still contribute to the messages tab dot

- **WHEN** unread messages only come from muted conversations
- **THEN** the bottom messages tab icon MUST still display a red unread dot
