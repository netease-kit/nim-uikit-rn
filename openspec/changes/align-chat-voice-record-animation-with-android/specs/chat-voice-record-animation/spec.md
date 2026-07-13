## ADDED Requirements

### Requirement: Chat voice record animation must align with Android

The RN chat voice record panel MUST present press-to-talk visual feedback that matches the Android chat implementation for the recording wave and pressed button state.

#### Scenario: Recording starts from the chat voice panel

- **WHEN** the user presses and holds the RN voice record button
- **THEN** the chat page shows an Android-aligned pulsing wave around the voice button
- **AND** the center voice button uses the Android-aligned pressed visual treatment
- **AND** the hint copy remains visible above the button while recording
