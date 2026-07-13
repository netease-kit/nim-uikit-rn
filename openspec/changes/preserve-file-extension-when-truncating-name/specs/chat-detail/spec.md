## MODIFIED Requirements

### Requirement: File message keeps trailing name characters and extension visible when name is truncated

RN file messages MUST preserve the last two characters of the base filename and the file extension when the displayed filename exceeds the available width.

#### Scenario: Long filename is rendered

- **WHEN** the chat page renders a file message whose filename is wider than the available title area
- **THEN** the main filename portion is truncated with ellipsis
- **AND** the last two characters of the base filename remain visible
- **AND** the file extension remains visible at the end

#### Scenario: Filename without usable extension is rendered

- **WHEN** the chat page renders a file message without a valid trailing extension segment
- **THEN** the leading portion of the filename is truncated when needed
- **AND** the last two characters of the filename remain visible
