## MODIFIED Requirements

### Requirement: Joined Team List

The contacts module SHALL provide the joined-team list and joined-team search entry points with the required UI, ordering, route from a team row into the corresponding team conversation, initial-load failure recovery, and immediate chat entry after successful free-join applications.

#### Scenario: Opening an already-joined team from join-team search

- **GIVEN** the current account has already joined a group
- **WHEN** the user opens the join-group page and searches that group's ID
- **THEN** the result action MUST display `去聊天`
- **AND** the action MUST be enabled
- **WHEN** the user taps `去聊天`
- **THEN** the app MUST create or upsert the matching team conversation locally
- **AND** the app MUST open that team chat page

#### Scenario: Applying to join a non-joined team

- **GIVEN** the current account has not joined the searched group
- **WHEN** the join-group page renders the search result
- **THEN** the result action MUST keep the existing join/application behavior
