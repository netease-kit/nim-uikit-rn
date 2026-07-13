## MODIFIED Requirements

### Requirement: RN merged-forward summary matches React Web structure and spacing

The RN chat merged-forward summary card MUST follow the same summary-row truncation structure and spacing as the React Web implementation.

#### Scenario: Summary row contains sender and content

- **WHEN** RN renders a merged-forward summary row with a sender prefix and message content
- **THEN** the sender prefix and content are rendered as a single truncation block
- **AND** line allocation across the summary rows follows the same whole-row clamping behavior as React Web

#### Scenario: Three-line budget is allocated in display order

- **WHEN** RN renders up to three merged-forward summary rows
- **THEN** the summary content uses a shared maximum of three lines in total
- **AND** the first row can use up to all three lines
- **AND** the second row can only use the remaining lines after the first row allocation
- **AND** the third row can only use the remaining lines after the first and second row allocations

#### Scenario: Summary card shows title and footer

- **WHEN** RN renders the merged-forward summary card
- **THEN** the spacing between title, summary content, and footer matches the React Web implementation
- **AND** the footer separator and footer copy remain unchanged
