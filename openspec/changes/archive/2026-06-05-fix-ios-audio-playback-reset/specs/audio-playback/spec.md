## MODIFIED Requirements

### Requirement: Audio playback state resets after voice playback completes

The chat detail page SHALL play voice messages audibly on iOS and SHALL clear the active audio-playing state when a voice message finishes playback, even on devices where the completion callback shape differs or does not arrive.

#### Scenario: Voice playback reaches the end

- **WHEN** a voice message finishes playback naturally
- **THEN** the chat page MUST clear the active playing message id
- **AND** the voice playback animation MUST stop
- **AND** the same cleanup behavior MUST also apply when playback is stopped or ends through a platform-specific status transition

#### Scenario: iOS voice playback starts after recording mode

- **GIVEN** the iOS chat page has previously entered voice recording mode
- **WHEN** the user plays a voice message
- **THEN** the app MUST restore a playback audio session before playback starts
- **AND** the audio player MUST be unmuted and set to full volume
- **AND** the voice message MUST play through the normal audible playback route instead of remaining silent because of recording-oriented audio routing

#### Scenario: Received voice message contains sender-local path and remote URL

- **WHEN** the iOS chat page plays a received voice message whose attachment contains both a remote `url` and a sender-local or otherwise unreadable `path`
- **THEN** the app MUST play the voice message from the remote `url`
- **AND** if the audio attachment has no remote `url`, the app MAY fall back to its local `path`

#### Scenario: Received voice message uses HTTPS-capable NOS HTTP URL

- **WHEN** the iOS chat page plays a received voice message whose attachment contains a remote NOS audio `url` using the `http` scheme for an HTTPS-capable NOS host
- **THEN** the app MUST pass the equivalent `https` URL to the native audio player
- **AND** the app MUST NOT require broad insecure network loading for that voice message to play

#### Scenario: iOS voice playback creates player from resolved source

- **WHEN** the iOS chat page starts voice message playback
- **THEN** the app MUST create the native audio player with the resolved playable source already attached
- **AND** the app MUST NOT start playback on an empty player that relies on a later asynchronous source replacement

#### Scenario: iOS received voice message uses remote source

- **WHEN** the iOS chat page plays a received voice message from a remote audio URL
- **THEN** the app MUST first make the remote audio available as a local file URI for native playback
- **AND** the app MUST create the native audio player from that local file URI

#### Scenario: iOS playback status does not report completion

- **WHEN** a voice message starts playback and the platform does not emit a terminal playback status by the expected audio duration
- **THEN** the chat page MUST stop the audio player
- **AND** the chat page MUST clear the active playing message id
