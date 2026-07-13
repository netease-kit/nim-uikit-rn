# audio-playback Specification

## Purpose

Define chat voice-message playback behavior so playback state and animation reliably reset after audio finishes across device-specific callback differences.

## Requirements

### Requirement: Audio playback state resets after voice playback completes

The chat detail page, pinned-message list, and collection list SHALL play voice messages audibly on iOS and SHALL clear the active audio-playing state when a voice message finishes playback, even on devices where the completion callback shape differs or does not arrive. When the user rapidly switches between voice messages, RN SHALL serialize the switch so the next voice message is started only after the previous playback stop has been applied and the iOS audio session has had a short settling window.

#### Scenario: Voice playback reaches the end

- **WHEN** a voice message finishes playback naturally
- **THEN** the active page MUST clear the active playing message id
- **AND** the voice playback animation MUST stop
- **AND** the same cleanup behavior MUST also apply when playback is stopped or ends through a platform-specific status transition

#### Scenario: Rapidly switching voice messages on iOS

- **GIVEN** the app is running on iOS
- **AND** voice message 1 is playing
- **WHEN** the user quickly taps voice message 2
- **THEN** RN MUST stop voice message 1 before starting voice message 2
- **AND** RN MUST start only the latest requested voice message after the playback switch settles
- **AND** voice message 2 MUST be audible when its audio source is valid
- **AND** RN MUST NOT leave voice message 2 in the playing animation state if its superseded playback request is cancelled

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

### Requirement: Voice playback cache preserves attachment extension

RN voice playback SHALL cache remote voice attachments using the best available attachment extension metadata instead of forcing an `.m4a` fallback when the remote URL has no extension.

#### Scenario: AAC voice attachment without URL extension plays on iOS

- **GIVEN** a remote voice message attachment has metadata extension `aac`
- **AND** the remote URL path has no filename extension
- **WHEN** RN iOS downloads the attachment for in-app playback
- **THEN** the cached local file MUST use an `.aac` extension
- **AND** the player MUST load the cached file with a non-zero duration when the file itself is valid
- **AND** playback state MUST no longer remain stuck only because the cache filename used an incompatible fallback extension

#### Scenario: M4A voice attachment keeps existing behavior

- **GIVEN** a remote voice message attachment has metadata extension `m4a` or a filename ending in `.m4a`
- **WHEN** RN iOS downloads or reuses the attachment for in-app playback
- **THEN** the cached local file MUST keep the `.m4a` extension
- **AND** existing playback behavior MUST remain unchanged
