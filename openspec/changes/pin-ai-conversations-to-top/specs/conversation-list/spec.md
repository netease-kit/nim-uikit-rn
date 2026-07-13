## ADDED Requirements

### Requirement: Conversation List AI Header

The RN conversation list SHALL show pinned AI users in a dedicated top section before the normal conversation rows.

#### Scenario: Show pinned AI users above conversations

- **GIVEN** the current account has one or more pinned AI users
- **WHEN** the conversation list page is displayed
- **THEN** the page MUST render an AI user section above the standard conversation list items
- **AND** the normal conversation ordering below that section MUST remain unchanged

#### Scenario: Hide AI header when no pinned AI users exist

- **GIVEN** the current account has no pinned AI users
- **WHEN** the conversation list page is displayed
- **THEN** the page MUST NOT render an empty AI user header section

#### Scenario: Open AI conversation from the header

- **GIVEN** the user taps an AI user in the conversation list header
- **WHEN** the target P2P conversation can be created or resolved
- **THEN** the app MUST open the corresponding chat detail page
