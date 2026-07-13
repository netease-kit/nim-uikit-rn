## MODIFIED Requirements

### Requirement: Forward Target Picker Tabs

The forward target picker SHALL provide Recent Chats, Friends, and Groups tabs for selecting forwarding targets. Each tab SHALL maintain an independent vertical scroll position so scrolling one tab does not change the visible position of another tab.

#### Scenario: Forward target tabs keep independent scroll positions

- **GIVEN** the user opens the forward target picker
- **AND** the Recent Chats, Friends, and Groups tabs each contain enough rows to scroll
- **WHEN** the user scrolls one tab and then switches to another tab
- **THEN** the newly selected tab SHALL show its own previous scroll position or its initial top position
- **AND** switching back SHALL restore the first tab's previous scroll position
- **AND** the selected-target strip and recent-forward shortcut module SHALL remain unchanged
