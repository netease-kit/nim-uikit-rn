## MODIFIED Requirements

### Requirement: Online Push And Foreground Updates

The app SHALL suppress system-notification presentation while active in-app and SHALL continue routing notification taps into the referenced conversation.

#### Scenario: Receiving a push-worthy event in foreground

- **WHEN** a new message arrives while the app is active
- **THEN** the app updates the corresponding conversation and chat state without presenting a system notification banner

### Requirement: Notification Tap Routing

The app SHALL route from foreground, background, and cold-start notification taps into the correct conversation and clear the currently presented local notification state after the tap is handled.

#### Scenario: Opening a conversation from notification tap

- **WHEN** the user taps a notification that references a conversation
- **THEN** the app restores authentication if needed, opens the matching chat detail page, and clears the visible local notification tray entries and app badge when the runtime supports it

### Requirement: Vendor Push Channel Initialization

The app SHALL not claim Android IMKit-equivalent offline vendor push delivery unless the current RN runtime actually initializes a vendor push transport and binds the NIM offline-push configuration required by the tests.

#### Scenario: Comparing with Android IMKit push initialization

- **WHEN** the RN demo is compared against the Android `imkit` reference implementation
- **THEN** the RN demo distinguishes foreground presentation handling from true vendor offline push initialization, and does not treat local Expo notification settings alone as sufficient proof of background or terminated-state push delivery
