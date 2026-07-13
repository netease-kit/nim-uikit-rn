## MODIFIED Requirements

### Requirement: Message Preview Copy Action

The message preview page SHALL expose copy actions consistently with chat message copy rules.

#### Scenario: Text message preview can be copied

- **GIVEN** the preview page is showing a text IM message
- **WHEN** the page renders
- **THEN** the copy action is available

#### Scenario: Non-text message preview cannot be copied

- **GIVEN** the preview page is showing a non-text IM message
- **WHEN** the page renders
- **THEN** the copy action is not available

#### Scenario: Route-provided original content can be copied

- **GIVEN** the preview page is showing route-provided content without a resolved IM message
- **WHEN** the page renders
- **THEN** the copy action is available for that content
