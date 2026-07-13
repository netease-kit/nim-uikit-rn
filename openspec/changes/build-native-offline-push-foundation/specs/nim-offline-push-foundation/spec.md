## ADDED Requirements

### Requirement: RN Offline Push Configuration

The app SHALL configure NIM RN offline-push settings before IM login when native push token access is available on the current runtime.

#### Scenario: Applying offline push config before login

- **WHEN** the app initializes the NIM RN SDK on a native runtime that can provide a native push token
- **THEN** it registers the offline-push plugin and manufacturer/APNs certificate configuration before any IM login attempt

### Requirement: Unified Push Payload Contract

The app SHALL attach a stable push payload contract to outbound push-enabled IM messages so offline notification taps can be resolved back into a conversation after app restore.

#### Scenario: Sending a push-enabled message

- **WHEN** the app sends a message with push enabled
- **THEN** the push payload includes `conversationId`, `sessionId`, and `sessionType`

### Requirement: App Background State Sync

The app SHALL synchronize app foreground and background state into the NIM RN runtime for offline-push strategy decisions.

#### Scenario: Entering background

- **WHEN** the native app transitions from active to background or inactive
- **THEN** the app notifies the NIM RN runtime that the app is not visible and updates background state with the current unread badge count

#### Scenario: Returning to foreground

- **WHEN** the native app returns to active state
- **THEN** the app restores NIM app visibility and clears the background flag in the NIM RN runtime

### Requirement: Android Push Click Bridging

The Android runtime SHALL bridge native notification payload fields into the RN routing layer without reconstructing account-scoped conversation identifiers in native code.

#### Scenario: Opening from a native Android notification

- **WHEN** Android receives an intent containing push payload fields such as `conversationId`, `sessionId`, or `sessionType`
- **THEN** the main activity rewrites the launch intent into an app deep link that preserves those fields for RN-side resolution
