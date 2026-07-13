## ADDED Requirements

### Requirement: Chat New Message Notice Presentation

The chat detail page SHALL present the new-message notice on the right side with a down-arrow icon and count-based copy.

#### Scenario: Incoming messages arrive while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** one or more incoming messages arrive
- **THEN** the page SHALL show the new-message notice on the right side
- **AND** the notice SHALL show a down-arrow icon before the text
- **AND** the notice text SHALL include the accumulated number of newly arrived messages

#### Scenario: User returns to bottom

- **GIVEN** the new-message notice is visible
- **WHEN** the user taps the notice or scrolls back to the bottom
- **THEN** the page SHALL hide the notice
- **AND** the accumulated notice count SHALL reset
