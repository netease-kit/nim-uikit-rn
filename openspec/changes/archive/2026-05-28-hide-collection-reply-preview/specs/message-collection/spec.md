## ADDED Requirements

### Requirement: Collection Reply Message Preview

The collection page SHALL render collected reply messages without the quoted source preview.

#### Scenario: Collected reply message is shown in collection page

- **GIVEN** the user opens My > Collection
- **AND** a collected message is a reply message
- **WHEN** the collection card renders that message
- **THEN** the card SHALL show the reply message content itself
- **AND** the card SHALL NOT show the quoted source message preview

### Requirement: Collection Text Message Preview Line Limit

The collection page SHALL limit collected text-message previews in collection cards without limiting the opened message-detail page.

#### Scenario: Long collected text message is shown in collection page

- **GIVEN** the user opens My > Collection
- **AND** a collected text message has content longer than three display lines
- **WHEN** the collection card renders that message
- **THEN** the card SHALL show at most three lines of the text message content
- **AND** overflowing text SHALL be truncated with a tail ellipsis

#### Scenario: Collected text message is opened

- **GIVEN** a collected text message is shown in My > Collection
- **WHEN** the user taps the collection card to open message detail
- **THEN** the opened message detail SHALL show the full message content without the collection-card three-line ellipsis constraint
- **AND** the opened message detail SHALL NOT apply the generic message-card four-line ellipsis constraint

### Requirement: Collection Delete Action

The collection page SHALL expose a delete action for each collected message and require confirmation before deleting the collection.

#### Scenario: User cancels collection deletion

- **GIVEN** the user opens a collection card more-action menu
- **WHEN** the user taps the delete action and then taps cancel in the confirmation dialog
- **THEN** the confirmation dialog SHALL close
- **AND** the collection list SHALL remain unchanged

#### Scenario: User confirms collection deletion

- **GIVEN** the user opens a collection card more-action menu
- **WHEN** the user taps the delete action and confirms the dialog
- **THEN** the app SHALL delete that collection
- **AND** the app SHALL show a toast with the text `删除成功`
- **AND** the collection list SHALL update to remove that item
