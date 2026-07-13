## MODIFIED Requirements

### Requirement: Collection List Entry And Empty State

The app SHALL provide a collection page reachable from My, and that page SHALL render collected message entries with message content presentation aligned to the chat detail message bubble whenever the source message can be resolved. The collection row SHALL present sender identity and collection metadata in a native-aligned form: sender avatar fallback labels MUST NOT use friend remarks or team nicknames and MUST use personal nickname before account ID, source text MUST use native-aligned P2P/team copy under the sender title, and collection time MUST be displayed at the bottom of the collection card.

#### Scenario: Opening the collection page with resolvable messages

- **WHEN** the user opens the collection page and a collected source message can be resolved from its stored message reference
- **THEN** the collection row renders the message content using the same chat message bubble presentation as the conversation detail page
- **AND** text, rich emoji, image, video, audio, file, location, merged-forward, notification, and tips messages follow the same visual treatment as chat detail for their supported content
- **AND** tapping a collected audio message MUST play the audio in the collection page with the same playback animation as chat detail
- **AND** the collection row still shows collection-specific source and action controls outside the message bubble
- **AND** the sender avatar fallback label MUST resolve from personal nickname before account ID and MUST NOT use friend remark or team nickname
- **AND** the collection source MUST be shown under the sender title using native-aligned source copy
- **AND** the collection time MUST be shown at the bottom of the collection card

#### Scenario: Opening the collection page with snapshot-only messages

- **WHEN** the user opens the collection page and a collected source message cannot be resolved but the stored collection payload has sender or conversation snapshot fields
- **THEN** the collection row MUST use the stored native-compatible sender and conversation snapshot fields when available
- **AND** the sender avatar fallback label MUST still avoid friend remarks and team nicknames
- **AND** the source and collection time presentation MUST remain consistent with resolvable collection rows
