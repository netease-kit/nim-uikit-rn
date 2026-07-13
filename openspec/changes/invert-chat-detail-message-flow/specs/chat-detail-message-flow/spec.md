## ADDED Requirements

### Requirement: Chat detail message flow must open from the latest messages without forced bottom scrolling

The RN chat detail page MUST present the latest messages at the initial visible edge by using reversed visual message flow instead of relying on post-render scrolling to the bottom.

#### Scenario: Entering a chat with existing messages

- **WHEN** the user opens a chat that already has messages
- **THEN** the latest messages are shown immediately in the initial visible area
- **AND** the page does not depend on repeated forced scroll-to-bottom correction after render

#### Scenario: Loading older history

- **WHEN** the user scrolls toward the history edge of the chat message list
- **THEN** the page loads older messages from that edge
- **AND** the history loading affordance is displayed on the same history edge
