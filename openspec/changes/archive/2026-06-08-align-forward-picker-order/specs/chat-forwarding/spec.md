## ADDED Requirements

### Requirement: Forward Picker Recent Chat Order

The system SHALL show the forward picker's recent chat list in the same order as the conversation list, including pinned conversation priority and recent activity ordering.

#### Scenario: Recent chat order matches conversation list

- **WHEN** the user opens the forward target picker
- **THEN** the recent chat list uses the same conversation ordering as the main conversation list

### Requirement: Forward Picker Friend Order

The system SHALL show the forward picker's friend list in the same order as the contacts friend list, using the same display-name ordering.

#### Scenario: Friend order matches contacts

- **WHEN** the user opens the forward target picker and selects the friends tab
- **THEN** the friend list order matches the contacts friend list order
