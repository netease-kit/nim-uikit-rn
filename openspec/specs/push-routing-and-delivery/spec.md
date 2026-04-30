# push-routing-and-delivery Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Online Push And Foreground Updates

The app SHALL handle online push-worthy events while foregrounded and SHALL keep unread and timeline state consistent with the current page context, including the case where the user is already in the active chat.

#### Scenario: Receiving a push-worthy event in foreground

- **WHEN** a new message arrives while the app is active
- **THEN** the app updates the corresponding conversation and chat state according to the online-push tests

#### Scenario: Receiving multiple foreground pushes

- **WHEN** foreground push-worthy events arrive for two or more conversations or include call-style notifications
- **THEN** the app updates each affected conversation according to the workbook's multi-notification rules

### Requirement: Offline Push Preference Binding

The app SHALL bind session mute state and user preference state into offline-push delivery, including hidden-detail and muted-session exception behavior.

#### Scenario: Receiving push for muted or hidden-detail sessions

- **WHEN** the app is backgrounded or terminated and a push-worthy event occurs
- **THEN** the visible push content and push suppression behavior follow the mute and detail-visibility rules from the tests

### Requirement: Vendor Push Channel Initialization

The app SHALL initialize the platform push transport required by the tests and SHALL preserve that push-brand behavior across background and terminated states.

#### Scenario: Registering the current device for push delivery

- **WHEN** the app completes login and prepares push delivery
- **THEN** the active device registers using the expected push transport for the current platform environment

#### Scenario: Running without an authorized vendor push channel

- **WHEN** the app runs in an environment where the current AppKey or platform build has not authorized vendor background push state reporting
- **THEN** the app does not call NIM app-background state commands that would produce forbidden SDK errors

### Requirement: Notification Tap Routing

The app SHALL route from foreground, background, and cold-start notification taps into the correct conversation.

#### Scenario: Opening a conversation from notification tap

- **WHEN** the user taps a notification that references a conversation
- **THEN** the app restores authentication if needed and opens the matching chat detail page

