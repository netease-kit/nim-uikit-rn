## Why

The current repository documentation is still fragmented. `AGENTS.md` and `CLAUDE.md` have been corrected for the current Expo Router demo, but `README.md` still carries too much `create-expo-app` starter wording and the repo still has no dedicated `ARCHITECTURE.md`, so contributors and agents do not yet have one consistent source for setup, code boundaries, and change routing.

## What Changes

- Rewrite `AGENTS.md` around the real repository structure: Expo Router screens in `app/`, MobX stores in `stores/`, configuration in `constants/NIMConfig.ts` and `app.json`, and actual `npm`-based commands.
- Define a repository capability that requires OpenSpec before route, user-flow, NIM configuration, store-shape, or workflow-documentation changes are implemented.
- Align `CLAUDE.md` with the current project so it remains a thin wrapper and no longer points to removed fullstack commands.
- Rewrite `README.md` to document the actual project purpose, setup, configuration, startup, validation, and Spec-driven workflow.
- Add `ARCHITECTURE.md` to document runtime topology, module ownership, edit boundaries, and change routing for this Expo RN demo.
- Document startup and validation guidance that matches Expo CLI usage instead of copied frontend/backend or Docker assumptions.

## Capabilities

### New Capabilities

- `agent-spec-workflow`: Defines how agents onboard into this repo, when OpenSpec is mandatory, which files own navigation/state/configuration behavior, and which validation commands are authoritative.

### Modified Capabilities

- none

## Impact

- `README.md`
- `ARCHITECTURE.md`
- `AGENTS.md`
- `CLAUDE.md`
- `openspec/changes/define-agent-spec-workflow/*`
- Day-to-day agent behavior for Codex, Claude Code, and OpenCode
