## ADDED Requirements

### Requirement: Sanitized Demo Bootstrap Configuration

The repository MUST not ship a usable shared `AppKey`, push-certificate identifier, or other ready-to-run third-party credential placeholder in the default runtime bootstrap configuration.

#### Scenario: Running with missing app credentials

- **GIVEN** a fresh checkout of the repository
- **WHEN** the contributor starts the app without editing `constants/NIMConfig.ts`
- **THEN** NIM bootstrap MUST fail with a clear local error telling the contributor to configure their own `AppKey`
- **AND** SMS login requests MUST fail with the same configuration guidance instead of silently calling the remote API with a bundled shared key

### Requirement: Integration Guide For Release Consumers

The repository MUST provide a dedicated integration guide that explains which runtime values, app identifiers, native assets, and optional push materials adopters need to replace before using the release branch.

#### Scenario: Onboarding a new adopter

- **GIVEN** a developer opening the repository for the first time
- **WHEN** they read the top-level onboarding docs
- **THEN** they can find a dedicated integration guide from `README.md`
- **AND** the guide lists the required `NIMConfig` fields, optional native files, and minimum validation steps for successful local startup
