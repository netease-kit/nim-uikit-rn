## MODIFIED Requirements

### Requirement: Attachment Message Sending State

The chat message renderer SHALL present in-progress attachment sends with loading affordances and remove them after sending completes.

#### Scenario: File message shows loading while sending

- **GIVEN** the chat detail page renders an outgoing file message
- **WHEN** the file message sending state is `SENDING`
- **THEN** the file message MUST show an Android-aligned 20dp determinate circular progress indicator in the file icon/progress area
- **AND** it MUST show the Android-aligned 6dp x 9dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the SDK upload progress callback instead of showing an indefinite spinner

#### Scenario: Video message shows loading while sending

- **GIVEN** the chat detail page renders an outgoing video message
- **WHEN** the video message sending state is `SENDING`
- **THEN** the video message MUST show an Android-aligned 42dp determinate circular progress indicator over the video preview
- **AND** it MUST show the Android-aligned 13dp x 18dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the SDK upload progress callback instead of showing an indefinite spinner

#### Scenario: Image message shows native bubble-front sending loading while sending

- **GIVEN** the chat detail page renders an outgoing image message
- **WHEN** the image message sending state is `SENDING`
- **THEN** RN MUST show a message-level loading before the message bubble on iOS and Android
- **AND** the loading MUST use a native platform spinner style
- **AND** the normal image sending thumbnail loading MUST remain inside the image card

#### Scenario: Video message shows native bubble-front sending loading while sending

- **GIVEN** the chat detail page renders an outgoing video message
- **WHEN** the video message sending state is `SENDING`
- **THEN** RN MUST show a message-level loading before the message bubble on iOS and Android
- **AND** the loading MUST use a native platform spinner style
- **AND** the determinate circular upload progress MUST remain over the video preview

#### Scenario: File message shows native bubble-front sending loading on iOS only

- **GIVEN** the chat detail page renders an outgoing file message on iOS
- **WHEN** the file message sending state is `SENDING`
- **THEN** RN MUST show a 22dp gray native-style loading before the message bubble, vertically centered to the bubble
- **AND** the file icon area's determinate circular upload progress MUST remain visible

#### Scenario: File message keeps Android native sending-status exception

- **GIVEN** the chat detail page renders an outgoing file message on Android
- **WHEN** the file message sending state is `SENDING`
- **THEN** RN MUST NOT show the message-level loading before the message bubble
- **AND** the file icon area's determinate circular upload progress MUST remain visible

#### Scenario: Attachment sending loading disappears after success

- **GIVEN** the chat detail page renders an outgoing file or video message
- **WHEN** the message sending state changes from `SENDING` to `SUCCEEDED`
- **THEN** the sending loading indicator MUST disappear

#### Scenario: Bubble-front sending loading disappears after sending leaves sending state

- **GIVEN** the chat detail page renders an outgoing image, video, or iOS file message
- **WHEN** the message sending state changes from `SENDING` to `SUCCEEDED` or `FAILED`
- **THEN** the message-level loading before the message bubble MUST disappear
- **AND** the failed state MAY show the existing retry affordance instead
