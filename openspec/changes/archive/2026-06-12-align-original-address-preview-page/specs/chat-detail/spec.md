## ADDED Requirements

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
