## ADDED Requirements

### Requirement: Chat Detail Team Availability

The chat detail page SHALL validate the current team conversation before allowing the user to remain in the chat.

#### Scenario: Team is unavailable when opening chat detail

- **WHEN** the user opens a team chat detail page
- **AND** the team info query fails because the team was dismissed or the current user is no longer a member
- **THEN** RN MUST show a native confirmation alert with the unavailable-team message
- **AND** after confirmation RN MUST return to the conversation list
- **AND** RN MUST remove that conversation from the active conversation source
