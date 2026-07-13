## MODIFIED Requirements

### Requirement: File message card uses full available width

RN file messages MUST use the full available message content width within the current chat bubble layout.

#### Scenario: File message is rendered in chat detail

- **WHEN** the chat page renders a file message
- **THEN** the file message card width fills the available message content width
- **AND** it does not keep the previous narrower fixed-width appearance

#### Scenario: File message keeps existing content layout

- **WHEN** the file message card expands to full width
- **THEN** the file type icon, filename, and file size remain visible
- **AND** the existing card border and spacing remain unchanged
