## MODIFIED Requirements

### Requirement: Media viewer does not expose original address entry

RN image and video viewers MUST NOT expose the original address to end users from the media detail experience.

#### Scenario: Image viewer hides original address action

- **WHEN** the user opens the chat image detail viewer
- **THEN** the page MUST NOT render an action that reveals or jumps to the original address
- **AND** the user MUST NOT be able to navigate from the image detail viewer to a raw original-address detail page

#### Scenario: Media viewer keeps non-sensitive actions

- **WHEN** the user opens the chat image or video detail viewer
- **THEN** the viewer MUST continue to provide its existing non-sensitive actions such as close and save
- **AND** removing the original-address entry MUST NOT affect normal media preview behavior

#### Scenario: Media viewer image renders without black screen

- **WHEN** the user opens a chat image detail viewer for a valid image message
- **THEN** the image content MUST render normally instead of remaining on a black screen
- **AND** horizontal paging or zoom container layout MUST NOT collapse the visible image area to zero height

#### Scenario: Media viewer image loading settles after first success

- **WHEN** the user opens an image that has already been loaded successfully in the current app session
- **THEN** the viewer SHOULD reuse the cached image result when available
- **AND** it MUST NOT keep showing a persistent loading overlay for that image after the image is already ready to display

#### Scenario: Android media viewer does not render valid image content as solid black

- **WHEN** the user opens a valid chat image detail viewer on Android
- **THEN** the visible image area MUST render the actual image content
- **AND** it MUST NOT degrade into a solid black image while the page itself remains visible

#### Scenario: iOS media viewer keeps valid image content visible

- **WHEN** the user opens a valid chat image detail viewer on iOS
- **THEN** the visible image area MUST render the actual image content
- **AND** the iOS image detail viewer MUST keep showing that image content during normal paging and reopen flows
- **AND** the iOS image detail viewer MUST NOT provide pinch-zoom or ScrollView-based zoom interaction
