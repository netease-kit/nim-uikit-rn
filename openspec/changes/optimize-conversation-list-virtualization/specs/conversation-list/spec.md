## MODIFIED Requirements

### Requirement: Conversation list remains responsive with large datasets

RN conversation list rendering MUST use an effective virtualized-list configuration that keeps the current UI and interactions intact while reducing unnecessary work for large datasets.

#### Scenario: Render a conversation list with many items

- **WHEN** the conversation list renders or scrolls through a large number of conversations
- **THEN** the list uses virtualized rendering parameters suitable for a fixed-height conversation row
- **AND** off-screen rows are not eagerly kept mounted beyond the configured window
- **AND** unchanged conversation rows avoid unnecessary rerenders as the list state updates
- **AND** the next page of conversations can be requested before the user fully reaches the list end
- **AND** the existing swipe actions, long-press actions, pull-to-refresh, pagination, and header content continue to work
