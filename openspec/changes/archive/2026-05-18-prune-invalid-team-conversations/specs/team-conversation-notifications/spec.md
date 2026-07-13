## ADDED Requirements

### Requirement: Team Invalidity Removes Conversation Access

The app SHALL converge team-conversation access when the current user is no longer allowed to stay in that team conversation because the team was dismissed, the user left, or the user was kicked.

#### Scenario: Current user is removed from a team outside the active chat page

- **WHEN** the SDK reports that the current user left a team, was kicked from a team, or the team was dismissed while the user is outside that chat page
- **THEN** the app MUST remove the corresponding team conversation from the conversation list without requiring a manual refresh
- **AND** future attempts to enter that stale conversation id MUST be blocked

#### Scenario: Team becomes invalid before entering chat

- **WHEN** the user taps a team conversation whose team metadata has already become invalid or unavailable
- **THEN** the app MUST avoid opening a broken chat detail state
- **AND** it MUST clean up the stale conversation entry or route the user back to the conversation list
