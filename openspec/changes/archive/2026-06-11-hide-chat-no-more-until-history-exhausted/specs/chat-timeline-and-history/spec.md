## ADDED Requirements

### Requirement: Chat history exhaustion feedback must reflect real pagination state

The chat detail screen MUST show the "no more" history indicator only after older-history pagination is actually exhausted.

#### Scenario: Older history still available

- **GIVEN** the chat detail screen has already rendered some historical messages
- **AND** older history can still be fetched
- **WHEN** the current batch finishes rendering
- **THEN** the timeline must not show the "no more" history indicator

#### Scenario: Older history loading in progress

- **GIVEN** the chat detail screen is currently requesting older history
- **WHEN** the loading request has not finished yet
- **THEN** the timeline must not show the "no more" history indicator during that loading state

#### Scenario: Older history fully exhausted

- **GIVEN** the chat detail screen has fetched history until no older messages remain
- **WHEN** the history exhaustion state is confirmed
- **THEN** the timeline may show the "no more" history indicator
