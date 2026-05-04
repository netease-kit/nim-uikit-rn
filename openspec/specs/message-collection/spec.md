# message-collection Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Message Collection Actions

The chat module SHALL expose collect and uncollect actions for eligible messages, keep the visible action label aligned with current collection state, and provide the success or failure feedback required by the tests.

#### Scenario: Collecting or uncollecting a message

- **WHEN** the user triggers collect or uncollect from a supported message action panel
- **THEN** the action result, feedback copy, and latest collection state follow the workbook rules

### Requirement: Collection List Entry And Empty State

The app SHALL provide a collection page reachable from My, and that page SHALL render the required title, list rows, timestamps, previews, empty-state treatment, and initial-load failure recovery affordance.

#### Scenario: Opening the collection page

- **WHEN** the user enters collection from My
- **THEN** the page shows the expected collection list or empty-state presentation without breaking the account overview flow

#### Scenario: Collection list initial load fails

- **WHEN** the initial collection query fails before any rows are shown
- **THEN** the page presents a load-failure state distinct from the empty state and provides a retry entry

### Requirement: Collection Follow-Up Actions

The collection page SHALL support forwarding a collected message, removing a collection, and handling source-message lookup failures or offline conditions without leaving stale UI state.

#### Scenario: Operating on a collected message

- **WHEN** the user forwards or removes a collected message from the collection list
- **THEN** the app follows the workbook's routing, refresh, and failure-handling rules for that action

