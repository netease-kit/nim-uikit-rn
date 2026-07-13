## MODIFIED Requirements

### Requirement: App Background State Sync

The app SHALL synchronize real app foreground and background state into the NIM RN runtime for offline-push strategy decisions, while excluding temporary system camera capture transitions launched from chat media capture.

#### Scenario: Entering background

- **WHEN** the native app transitions from active to background or inactive for a real app background event
- **THEN** the app notifies the NIM RN runtime that the app is not visible and updates background state with the current unread badge count

#### Scenario: Returning to foreground

- **WHEN** the native app returns to active state
- **THEN** the app restores NIM app visibility and clears the background flag in the NIM RN runtime

#### Scenario: Entering system camera capture from chat

- **WHEN** the chat detail page launches the native system camera for photo or video capture
- **AND** React Native reports a temporary inactive or background AppState while the camera UI is on screen
- **THEN** the app MUST NOT notify the NIM RN runtime that the app entered background for that camera transition
- **AND** the normal background-state synchronization MUST resume after camera capture ends
