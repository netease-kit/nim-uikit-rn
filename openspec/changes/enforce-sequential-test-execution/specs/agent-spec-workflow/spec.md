## MODIFIED Requirements

### Requirement: Validation Guidance Uses Supported Commands

The agent guide SHALL list validation and startup commands that exist in this repository or are standard Expo and OpenSpec commands, and SHALL define how testcase-driven verification is sequenced.

#### Scenario: Repository validation

- **WHEN** an agent finishes a documentation, routing, configuration, or store change
- **THEN** the guide instructs it to use relevant commands from `npm run lint`, `npm run format:check`, `npx tsc --noEmit`, `npx expo install --check`, and `OPENSPEC_TELEMETRY=0 openspec validate <change> --type change --no-interactive`

#### Scenario: Expo startup verification

- **WHEN** an agent needs to boot the app locally
- **THEN** the guide routes generic startup to `npm run start` and platform-specific startup to `npm run ios`, `npm run android`, or `npm run web`, without claiming frontend/backend health URLs that do not exist in this repository

#### Scenario: Testcase execution is sequential

- **WHEN** an agent is executing workbook or testcase-based verification in this repository
- **THEN** it MUST advance only one testcase at a time
- **AND** it MUST not start the next testcase until the current testcase has either passed directly or passed after a repair and explicit re-verification
- **AND** it MUST NOT verify multiple testcases in parallel
- **AND** after the current testcase passes, it MUST automatically continue to the next testcase unless the user stops or redirects the task
