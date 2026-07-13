## MODIFIED Requirements

### Requirement: Chat New Message Notice Presentation

The chat detail page SHALL present the new-message notice on the right side with a down-arrow icon
and count-based copy when new messages arrive, and SHALL present the same shortcut as an icon-only
scroll-to-bottom affordance when the user is browsing older history without pending new messages.

#### Scenario: Incoming messages arrive while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** one or more incoming messages arrive
- **THEN** the page SHALL show the new-message notice on the right side
- **AND** the notice SHALL show a down-arrow icon before the text
- **AND** the notice text SHALL include the accumulated number of newly arrived messages

#### Scenario: User scrolls upward to browse history

- **GIVEN** the user is viewing a chat detail page at the latest message
- **WHEN** the user scrolls upward and the latest message is no longer near the viewport bottom
- **THEN** the page SHALL show a right-side down-arrow shortcut without new-message count text
- **AND** tapping the shortcut SHALL scroll the timeline back to the latest message

#### Scenario: User returns to bottom

- **GIVEN** the new-message notice or icon-only scroll shortcut is visible
- **WHEN** the user taps the notice or scrolls back to the bottom
- **THEN** the page SHALL hide the shortcut
- **AND** the accumulated notice count SHALL reset
