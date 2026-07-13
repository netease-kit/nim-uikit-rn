## MODIFIED Requirements

### Requirement: Conversation Delete Action Flow

The app SHALL execute supported conversation-list delete actions immediately after the user chooses delete from the available row actions.

#### Scenario: Delete conversation from the conversation list

- **WHEN** the user taps delete from a conversation row swipe action or long-press action sheet
- **THEN** the app MUST execute the delete flow immediately
- **AND** the app MUST NOT show a second confirmation sheet for that same delete action
- **AND** offline or mutation failures MUST continue using the existing delete failure handling
