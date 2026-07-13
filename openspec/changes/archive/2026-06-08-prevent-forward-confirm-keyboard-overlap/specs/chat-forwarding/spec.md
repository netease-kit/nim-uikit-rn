## ADDED Requirements

### Requirement: Forward Confirmation Keyboard Avoidance

The system SHALL keep the forward confirmation modal comment input visible and usable when the keyboard is open. This behavior SHALL apply to single-message forwarding, merged forwarding, and one-by-one forwarding because they share the same confirmation modal.

#### Scenario: Comment input with keyboard open

- **WHEN** the user opens the forward confirmation modal and focuses the comment input
- **THEN** the modal moves or resizes so the comment input is not covered by the keyboard

#### Scenario: Forward actions remain available

- **WHEN** the keyboard is open in the forward confirmation modal
- **THEN** the cancel and send actions remain visible and usable
