## ADDED Requirements

### Requirement: Merged-forward summary emoji rendering

Merged-forward message cards SHALL render supported UIKit emoji keys in summary preview lines as emoji icons while preserving the existing summary text layout.

#### Scenario: Emoji message summary renders as icon

- **GIVEN** a merged-forward message card summary line contains a supported UIKit emoji key from an original emoji or text message
- **WHEN** the chat detail page renders the merged-forward message card
- **THEN** the summary line MUST render that emoji key as the corresponding UIKit emoji icon
- **AND** the summary line MUST NOT display the supported emoji key as plain text
- **AND** summary line measurement and line-clamp allocation MUST use the same emoji-icon rendering as the visible summary
- **AND** the sender name, separator, wrapping, and line-clamp behavior MUST remain readable and consistent with other merged-forward summary lines
