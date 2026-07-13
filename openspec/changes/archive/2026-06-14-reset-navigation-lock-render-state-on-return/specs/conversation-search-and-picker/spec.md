## ADDED Requirements

### Requirement: Search Result Navigation Recovers After Return

Conversation search result rows SHALL be tappable after the user opens one result, returns from chat, and taps another result.

#### Scenario: Open another search result after returning from chat

- **GIVEN** the user searches for a keyword and sees matching search results
- **WHEN** the user opens one result, returns from the chat page to the search result page, and taps any valid result
- **THEN** the app MUST open the tapped chat page
- **AND** the result rows MUST NOT remain disabled by the previous navigation lock
