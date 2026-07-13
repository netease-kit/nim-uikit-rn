## MODIFIED Requirements

### Requirement: Chat Detail Top Banner

The chat detail screen SHALL render user-facing copy in the active in-app language across its RN page and RN UIKit adapter surfaces.

#### Scenario: English chat detail copy

- **GIVEN** the active in-app language is English
- **WHEN** the user opens the chat detail screen or its common RN child routes
- **THEN** safety reminders, common action labels, failure hints, and empty states SHALL be shown in English where English translations exist
