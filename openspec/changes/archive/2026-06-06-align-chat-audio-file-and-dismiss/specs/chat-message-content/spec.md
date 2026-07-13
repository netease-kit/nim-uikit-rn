## ADDED Requirements

### Requirement: Audio And File Bubble Compact Alignment

The chat message bubble SHALL keep audio duration and file-name suffix content visually adjacent to their related primary content.

#### Scenario: Audio duration stays near the voice icon

- **WHEN** the chat page renders a voice message
- **THEN** RN MUST show the duration text next to the voice icon
- **AND** the icon-duration group MUST stay on the side closest to the sender avatar

#### Scenario: File extension stays adjacent to a non-overflowing file name

- **WHEN** the chat page renders a file message whose file name fits in the available width
- **THEN** RN MUST keep the file extension or type suffix directly after the file name
- **AND** RN MUST NOT stretch the file name row so that a blank gap appears between the name and suffix

#### Scenario: Long file name still preserves suffix

- **WHEN** the chat page renders a file message whose file name exceeds available width
- **THEN** RN MUST keep the preserved tail and file extension visible where possible
- **AND** RN MAY truncate the earlier file-name prefix with a tail ellipsis
