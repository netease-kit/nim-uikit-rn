## MODIFIED Requirements

### Requirement: Collection List Entry And Empty State

The app SHALL provide a collection page reachable from My, and that page SHALL render collected message entries with message content presentation aligned to the chat detail message bubble whenever the source message can be resolved.

#### Scenario: Opening the collection page with resolvable messages

- **WHEN** the user opens the collection page and a collected source message can be resolved from its stored message reference
- **THEN** the collection row renders the message content using the same chat message bubble presentation as the conversation detail page
- **AND** text, rich emoji, image, video, audio, file, location, merged-forward, notification, and tips messages follow the same visual treatment as chat detail for their supported content
- **AND** tapping a collected audio message MUST play the audio in the collection page with the same playback animation as chat detail
- **AND** the collection row still shows collection-specific source and action controls outside the message bubble
