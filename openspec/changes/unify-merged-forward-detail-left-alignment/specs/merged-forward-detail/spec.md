## ADDED Requirements

### Requirement: Merged-forward detail messages must use unified left alignment

The merged-forward detail page MUST render all message items with left alignment, regardless of whether the original sender matches the current logged-in account.

#### Scenario: Viewing merged-forward history containing self-sent and other-sent messages

- **WHEN** the user opens merged-forward detail history
- **THEN** every message item MUST align to the left
- **AND** audio and call placeholder cards MUST NOT switch to a right-aligned self style
