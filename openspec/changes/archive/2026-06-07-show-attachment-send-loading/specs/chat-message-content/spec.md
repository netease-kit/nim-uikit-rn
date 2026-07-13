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

#### Scenario: Attachment sending loading disappears after success

- **GIVEN** the chat detail page renders an outgoing file or video message
- **WHEN** the message sending state changes from `SENDING` to `SUCCEEDED`
- **THEN** the sending loading indicator MUST disappear

### Requirement: Attachment Message Download State

The chat message renderer SHALL present in-progress file and video downloads with determinate circular progress affordances aligned with the native UIKit implementations.

#### Scenario: File message shows loading while downloading

- **GIVEN** the chat detail page renders a file message whose remote attachment has not been downloaded locally
- **WHEN** the user taps the file message and the file download is in progress
- **THEN** the file message MUST show an Android-aligned 20dp determinate circular progress indicator in the file icon/progress area
- **AND** it MUST show the Android-aligned 6dp x 9dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the file download progress callback instead of showing a static pause glyph

#### Scenario: Video message shows loading while downloading

- **GIVEN** the chat detail page renders a video message whose remote attachment has not been downloaded locally
- **WHEN** the user taps the video message and the video download is in progress
- **THEN** the video message MUST show an Android-aligned 42dp determinate circular progress indicator over the video preview
- **AND** it MUST show the Android-aligned 13dp x 18dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the video download progress callback instead of showing a static pause glyph

#### Scenario: Image message keeps native-aligned thumbnail loading

- **GIVEN** the chat detail page renders an image message
- **WHEN** the image thumbnail is loading or the image message is opened
- **THEN** the message bubble MUST NOT add a download circular progress indicator for image download
