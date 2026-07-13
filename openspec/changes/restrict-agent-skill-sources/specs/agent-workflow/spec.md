## ADDED Requirements

### Requirement: Agent Skill Sources Must Be Whitelisted

The repository SHALL restrict agent skill usage to built-in platform skills and repository-approved whitelist entries.

#### Scenario: Agent selects a skill while working in this repository

- **WHEN** an agent decides whether to use a skill for a task in this repository
- **THEN** the agent MUST only use built-in platform skills or skills explicitly listed in the root `skills.md`
- **AND** the agent MUST treat any non-built-in skill not listed in `skills.md` as disallowed

#### Scenario: Repository initializes the non-built-in skill whitelist

- **WHEN** the repository defines the root `skills.md`
- **THEN** the file MUST serve as the only whitelist for non-built-in skills in this repository
- **AND** the initial whitelist MAY be empty
