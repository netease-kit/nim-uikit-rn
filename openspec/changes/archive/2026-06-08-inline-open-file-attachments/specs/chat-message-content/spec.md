## MODIFIED Requirements

### Requirement: Attachment Message Download State

The chat message renderer SHALL present in-progress file and video downloads with determinate circular progress affordances aligned with the native UIKit implementations.

#### Scenario: File message shows loading while downloading

- **GIVEN** the chat detail page renders a file message whose remote attachment has not been downloaded locally
- **WHEN** the user taps the file message and the file download is in progress
- **THEN** the file message MUST show an Android-aligned 20dp determinate circular progress indicator in the file icon/progress area
- **AND** it MUST show the Android-aligned 6dp x 9dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the file download progress callback instead of showing a static pause glyph

#### Scenario: File message opens inline from secondary message surfaces

- **GIVEN** a file message is rendered in merged-forward detail, collection list, or pinned-message list
- **WHEN** the user taps the file message
- **THEN** RN MUST keep the user on the current page
- **AND** RN MUST show file download progress on that file message bubble while downloading
- **AND** after download completes RN MUST open the local file directly through the platform file opener
- **AND** if the platform cannot open the file in-app RN MUST let the user choose an available external app when the platform supports an app chooser

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
