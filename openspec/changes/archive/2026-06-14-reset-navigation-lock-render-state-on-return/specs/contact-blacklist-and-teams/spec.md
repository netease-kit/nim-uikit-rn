## ADDED Requirements

### Requirement: Joined Team Row Navigation Recovers After Return

The joined-team list rows SHALL be tappable after the user opens one team chat, returns to the joined-team list, and taps another team row.

#### Scenario: Open another joined team after returning from chat

- **GIVEN** the user is viewing the joined-team list
- **WHEN** the user opens one team chat, returns to the joined-team list, and taps any valid team row
- **THEN** the app MUST open the tapped team chat page
- **AND** the team rows MUST NOT remain disabled by the previous navigation lock
