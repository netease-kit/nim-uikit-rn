## ADDED Requirements

### Requirement: Success Toast Uses Default Visual Style

The app SHALL present success toast messages with the same default visual background style as ordinary informational toast messages, instead of a green success-specific background.

#### Scenario: Success toast on RN uses default toast background

- **WHEN** RN code shows a success toast
- **THEN** the toast MUST keep the existing toast layout, timing, and placement
- **AND** its background style MUST match the default informational toast background instead of green

#### Scenario: Success toast on web uses default toast background

- **WHEN** web code shows a success toast
- **THEN** the toast MUST keep the existing toast layout, timing, and placement
- **AND** its background style MUST match the default informational toast background instead of green
