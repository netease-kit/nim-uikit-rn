## MODIFIED Requirements

### Requirement: Notification Tap Routing

The app SHALL route from foreground, background, and cold-start notification taps into the correct conversation, and SHALL resolve either a direct `conversationId` or a `sessionId` plus `sessionType` payload into the final chat route before clearing visible notification state when supported.

#### Scenario: Opening a conversation from notification tap

- **WHEN** the user taps a notification that references a conversation
- **THEN** the app restores authentication if needed, resolves the target conversation from `conversationId` or from `sessionId` plus `sessionType`, opens the matching chat detail page, and clears the visible local notification tray entries and app badge when the runtime supports it

### Requirement: Vendor Push Channel Initialization

The app SHALL not claim Android or iOS IMKit-equivalent offline push delivery unless the current RN runtime both initializes the NIM offline-push configuration contract and has the required native transport implementation for the active platform.

#### Scenario: Comparing with Android IMKit push initialization

- **WHEN** the RN demo is compared against the Android `imkit` reference implementation
- **THEN** the RN demo distinguishes RN-side offline-push contract setup from full manufacturer transport integration, and does not treat local Expo notification settings alone as sufficient proof of background or terminated-state push delivery

#### Scenario: Running without iOS native project support

- **WHEN** the repository does not yet contain an iOS native project with APNs registration hooks
- **THEN** the RN demo may expose the offline-push payload and configuration contract, but MUST NOT claim that APNs device-token registration and upload are already complete
