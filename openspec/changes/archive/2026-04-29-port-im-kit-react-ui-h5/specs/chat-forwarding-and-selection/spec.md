## ADDED Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests.

#### Scenario: Selecting messages in multi-select mode

- **WHEN** the user enters multi-select mode and selects or deselects eligible messages
- **THEN** the selection state, toolbar actions, and count limits follow the workbook rules

### Requirement: Multi-Select Resilience

The multi-select flow SHALL remain stable when new messages arrive, selected messages are recalled or deleted, another endpoint mutates the same timeline, or network connectivity changes during selection.

#### Scenario: Multi-select state changes during live updates

- **WHEN** message state changes while the user is still in multi-select mode
- **THEN** the page keeps a valid selection model and prevents acting on invalidated rows

### Requirement: Forwarding Modes And Limits

The chat module SHALL support single-message forwarding, serial forwarding, and merged forwarding with the confirmation dialogs, message-count limits, ordering rules, and nested-merge limits required by the tests.

#### Scenario: Forwarding selected messages

- **WHEN** the user chooses a supported forwarding mode for valid messages
- **THEN** the app applies the correct limit checks, confirmation copy, and output ordering for that forwarding mode

### Requirement: Forwarding Payload Fidelity

Forwarded payloads SHALL preserve or intentionally transform reply state, `@` content, read-receipt settings, remarks, mark state, and attachment summaries exactly as the tests define for each forwarding mode.

#### Scenario: Forwarding messages with reply, `@`, or receipt metadata

- **WHEN** the selected messages include reply chains, mentions, marked rows, or read-receipt-sensitive content
- **THEN** the generated forwarded message follows the workbook's metadata-preservation rules

### Requirement: Forward Target Selection

The forwarding flow SHALL provide recent-forward sessions, search, single-target selection, multi-target selection up to the supported limit, and stale-target rejection for deleted friends or invalid teams.

#### Scenario: Selecting forwarding targets

- **WHEN** the user opens the forwarding target page and chooses recent or searched sessions
- **THEN** the page enforces valid target selection and blocks broken or stale conversations

#### Scenario: Recent forwarding history fails to load

- **WHEN** the forwarding target page cannot load its recent-forward history before showing recent entries
- **THEN** the page distinguishes that failure from a true empty state and provides a retry action

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, and offline fallback handling.

#### Scenario: Opening a merged forward detail page

- **WHEN** the user taps a merged-forward message
- **THEN** the detail page renders the expected message list and detail interactions without corrupting nested content
