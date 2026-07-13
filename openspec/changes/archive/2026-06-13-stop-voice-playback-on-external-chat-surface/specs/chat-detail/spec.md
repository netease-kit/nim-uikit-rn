## ADDED Requirements

### Requirement: Chat Voice Playback Lifecycle

The chat detail screen SHALL stop active voice-message playback before the user leaves the chat timeline context for another route, media surface, or system picker.

#### Scenario: Opening chat media or detail surfaces stops voice playback

- **GIVEN** a voice message is currently playing in the chat detail timeline
- **WHEN** the user opens a video message, image preview, merged-forward detail, forwarding page, or conversation settings page
- **THEN** the active voice message MUST stop playback before the target surface is shown
- **AND** the chat timeline MUST no longer show that voice message as playing.

#### Scenario: Opening system pickers stops voice playback

- **GIVEN** a voice message is currently playing in the chat detail timeline
- **WHEN** the user opens the document picker, album/file picker, camera capture flow, or limited photo-library permission picker from the chat composer
- **THEN** the active voice message MUST stop playback before the system UI or picker flow begins.

#### Scenario: Tapping a voice message remains a playback control

- **GIVEN** the user remains in the chat detail timeline
- **WHEN** the user taps a voice message
- **THEN** the voice message MUST continue to use the existing play-or-stop toggle behavior.
