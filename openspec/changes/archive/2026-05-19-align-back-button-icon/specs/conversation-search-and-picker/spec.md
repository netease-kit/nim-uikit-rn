## ADDED Requirements

### Requirement: Search and picker pages use the unified back button visual

Conversation search and conversation picker pages SHALL align their back button visual with the shared navigation back button style.

#### Scenario: Opening conversation search

- **WHEN** the user opens the conversation search page
- **THEN** the header back button MUST use the shared iOS-style left arrow icon
- **AND** the button MUST NOT display blue highlight styling

#### Scenario: Opening conversation picker

- **WHEN** the user opens the conversation picker page
- **THEN** the header left action area MUST follow the shared back button visual rules when it is used as a back affordance
- **AND** custom left actions that are not a back affordance MAY keep their existing text treatment
