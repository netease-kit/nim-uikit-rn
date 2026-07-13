## MODIFIED Requirements

### Requirement: Audio playback state resets after voice playback completes

The chat detail page, pinned-message list, and collection list SHALL play voice messages audibly on iOS and SHALL clear the active audio-playing state when a voice message finishes playback, even on devices where the completion callback shape differs or does not arrive.

#### Scenario: Voice playback reaches the end

- **WHEN** a voice message finishes playback naturally
- **THEN** the active page MUST clear the active playing message id
- **AND** the voice playback animation MUST stop
- **AND** the same cleanup behavior MUST also apply when playback is stopped or ends through a platform-specific status transition

#### Scenario: Voice message is tapped in a pinned-message list

- **GIVEN** the user opens a conversation's pinned-message list
- **AND** a pinned message is a voice message
- **WHEN** the user taps the voice message bubble
- **THEN** RN MUST play the voice message in the current app page
- **AND** RN MUST show the same voice playback animation as the chat detail page
- **AND** RN MUST NOT open the voice attachment URL in the browser or another external app

#### Scenario: Voice message is tapped in the collection list

- **GIVEN** the user opens My > Collection
- **AND** a collected message is a voice message whose source message can be resolved
- **WHEN** the user taps the voice message bubble
- **THEN** RN MUST play the voice message in the current app page
- **AND** RN MUST show the same voice playback animation as the chat detail page
- **AND** RN MUST NOT open the voice attachment URL in the browser or another external app
