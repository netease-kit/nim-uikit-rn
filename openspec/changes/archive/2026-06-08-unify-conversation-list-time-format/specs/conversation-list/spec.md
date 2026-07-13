## ADDED Requirements

### Requirement: Fixed Conversation List Time Format

RN conversation list timestamps SHALL render with a fixed format that is independent of the device locale and 12-hour/24-hour system preference.

#### Scenario: Today's conversation timestamp

- **GIVEN** a conversation timestamp is on the same local calendar day as the current time
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `HH:mm` using 24-hour time

#### Scenario: Current-year conversation timestamp

- **GIVEN** a conversation timestamp is in the same local calendar year as the current time but not today
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `MM月dd日 HH:mm` using 24-hour time

#### Scenario: Cross-year conversation timestamp

- **GIVEN** a conversation timestamp is not in the same local calendar year as the current time
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `yyyy年MM月dd日`
