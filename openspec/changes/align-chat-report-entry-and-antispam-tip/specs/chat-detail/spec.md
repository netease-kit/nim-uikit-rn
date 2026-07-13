## MODIFIED Requirements

### Requirement: Chat Anti-Fraud Banner

The chat detail screen SHALL show the anti-fraud reminder row required by the product flow and expose the report entry aligned with Android.

#### Scenario: Reporting from the top anti-fraud banner

- **GIVEN** the chat detail screen is showing the top anti-fraud reminder banner
- **WHEN** the user taps the report link in that banner
- **THEN** the app SHALL open an in-app embedded report page that loads the configured report destination
- **AND** the report page SHALL align with the native reference behavior instead of showing a local placeholder form
