## ADDED Requirements

### Requirement: Demo Repository Does Not Bundle A Shared AppKey

The demo repository SHALL leave the tracked AppKey empty by default and MUST block SDK initialization or SMS-auth network requests until a contributor configures their own AppKey locally.

#### Scenario: Fresh clone without local AppKey

- **WHEN** a contributor starts the app from a checkout that still uses the tracked default configuration
- **THEN** the repository does not provide a bundled shared AppKey
- **THEN** NIM initialization stops before creating the SDK instance
- **THEN** the app exposes a clear error telling the contributor to configure `constants/NIMConfig.ts`

#### Scenario: SMS auth request without local AppKey

- **WHEN** the contributor requests a login SMS code before configuring an AppKey
- **THEN** the app blocks the request locally
- **THEN** the error message tells the contributor to configure `constants/NIMConfig.ts` instead of sending an empty or shared AppKey

### Requirement: Setup Docs Explain Local AppKey Configuration

The repository SHALL document that AppKey is intentionally omitted from tracked source, identify the local file and field to update, and explain the expected failure mode when the contributor has not configured it yet.

#### Scenario: Reading setup instructions for first run

- **WHEN** a contributor opens `README.md` to prepare the demo locally
- **THEN** the document states that the example project no longer bundles a default AppKey
- **THEN** the document points to `constants/NIMConfig.ts` as the required local configuration file
- **THEN** the document explains that both SDK initialization and SMS login requests depend on that local AppKey
