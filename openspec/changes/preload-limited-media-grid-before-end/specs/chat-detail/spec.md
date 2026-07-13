## MODIFIED Requirements

### Requirement: Limited media grid preloads the next page before the user fully reaches the end

RN limited media grid in chat detail MUST request the next page before the user fully reaches the end when more assets are available.

#### Scenario: Scroll downward in the limited media grid

- **WHEN** the user scrolls near the end of the limited media grid and more assets are available
- **THEN** the app requests the next page before the user fully reaches the list end
- **AND** duplicate pagination requests remain suppressed while a previous request is still in flight
