## ADDED Requirements

### Requirement: Disabled composer visuals stay aligned with composer interaction state

The chat composer SHALL keep its visual state aligned with its interaction state.

#### Scenario: Composer becomes non-editable

- **WHEN** the composer is disabled by runtime chat state such as a team mute restriction
- **THEN** the composer MUST present a disabled-looking input surface instead of the normal editable visual
