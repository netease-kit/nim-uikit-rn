## ADDED Requirements

### Requirement: Audio playback state resets after voice playback completes

The chat detail page SHALL clear the active audio-playing state when a voice message finishes playback, even on devices where the completion callback shape differs.

#### Scenario: Voice playback reaches the end

- **WHEN** a voice message finishes playback naturally
- **THEN** the chat page MUST clear the active playing message id
- **AND** the voice playback animation MUST stop
- **AND** the same cleanup behavior MUST also apply when playback is stopped or ends through a platform-specific status transition
