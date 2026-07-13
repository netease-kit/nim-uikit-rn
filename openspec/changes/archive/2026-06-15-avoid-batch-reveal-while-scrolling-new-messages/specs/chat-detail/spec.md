## ADDED Requirements

### Requirement: Manual Scroll Gradually Decrements New Message Notice

When the user is browsing history and receives multiple new messages, manual scrolling back toward the latest-message position SHALL reveal deferred new messages gradually so the new-message notice count decreases progressively with scrolling.

#### Scenario: Scroll toward deferred new messages

- **GIVEN** the user is browsing historical messages in chat detail
- **AND** multiple incoming messages arrive and are represented by the existing new-message notice
- **WHEN** the user manually scrolls downward toward the latest-message area
- **THEN** RN MUST reveal deferred latest messages progressively through the manual scroll path
- **AND** the `x条新消息` notice count MUST decrease progressively as those newly revealed messages become reachable by scrolling
- **AND** RN MUST NOT force an extra immediate jump-to-bottom alignment solely because the first deferred new message area became reachable by scrolling
- **AND** tapping the explicit new-message shortcut MAY still keep its existing direct jump-to-bottom behavior
