## ADDED Requirements

### Requirement: Pinned Message Display Must Show Highlighted Attribution

The chat detail screen SHALL render pinned messages with a highlighted container and a pin attribution hint that identifies the operator when that information is available.

#### Scenario: Viewing a pinned message in chat detail

- **WHEN** a message is currently pinned in the conversation
- **THEN** the message row MUST display a highlighted pinned container
- **AND** the pinned hint MUST appear below the bubble inside that highlighted area
- **AND** the hint MUST include the pin icon plus attribution text indicating who pinned the message when the operator account is available
- **AND** the pinned message bubble itself MUST NOT show a yellow border

### Requirement: Pinned Message List Offline Actions

The pinned message list SHALL allow the more action to open the bottom action sheet while offline, SHALL prevent network-dependent sheet actions from entering their next flow when the app is offline, and SHALL dismiss the bottom action sheet before showing operation feedback for a selected action.

#### Scenario: Opening pinned message more actions while offline

- **GIVEN** the user opens the pinned message list
- **AND** the app is offline
- **WHEN** the user taps the pinned message more action
- **THEN** the app MUST show the bottom action sheet normally
- **AND** the app MUST NOT hide the action sheet solely because the app is offline

#### Scenario: Forwarding a pinned message while offline

- **GIVEN** the user opens the pinned message list
- **AND** the app is offline
- **AND** the pinned message supports forwarding
- **WHEN** the user taps the pinned message action menu and chooses forward
- **THEN** the app MUST show the offline feedback directly
- **AND** the app MUST NOT navigate to the forward selection flow

#### Scenario: Opening pinned audio message actions

- **GIVEN** the user opens the pinned message list
- **AND** the pinned message is an audio message
- **WHEN** the user opens the pinned message action menu
- **THEN** the action menu MUST NOT show the forward action

#### Scenario: Leaving pinned message list while audio is playing

- **GIVEN** the user starts playing an audio message in the pinned message list
- **WHEN** the user navigates to another page
- **THEN** the audio playback MUST stop before or when the pinned message list loses focus

#### Scenario: Unpinning a pinned message while offline

- **GIVEN** the user opens the pinned message list
- **AND** the pinned message action sheet is visible
- **WHEN** the user chooses unpin while offline
- **THEN** the app MUST dismiss the action sheet before showing the offline failure feedback
- **AND** the offline feedback MUST NOT be covered by the bottom action sheet

### Requirement: Pinned Message Back Button Visibility

The iOS navigation back affordance for pinned-message related screens SHALL remain visible and tappable when offline state causes page or navigation-header refreshes.

#### Scenario: Viewing pinned-message screens after disconnecting the network

- **GIVEN** the user is on the pinned message list or pinned message detail screen on iOS
- **AND** the app becomes offline
- **WHEN** the navigation header refreshes
- **THEN** the top-left back affordance MUST remain visible
- **AND** tapping the affordance MUST navigate back

### Requirement: Pinned Text Message Detail Reuses Collection Detail

Pinned text message detail SHALL use the same standalone text-detail presentation and copy interaction as collection text message detail.

#### Scenario: Opening a pinned text message

- **GIVEN** the user opens a text message from the pinned message list
- **WHEN** the app navigates to message detail
- **THEN** the detail MUST use the same text-only content layout as collection message detail
- **AND** the composer MUST be hidden
- **AND** long-pressing the text MUST show the same copy action as collection message detail
